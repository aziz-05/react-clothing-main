import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ShopBrowser, { type ShopPage } from '@/components/ShopBrowser';
import { CARD_FIELDS } from '@/graphql/fragments';
import { query } from '@/graphql/server';
import { categories, DEPARTMENTS } from '@/lib/catalog';

type Props = { params: Promise<{ slug?: string[] }>; searchParams: Promise<{ q?: string }> };

/** Maps /shop, /shop/new, /shop/sale, /shop/:department and /shop/:department/:category to a base filter. */
function resolve(slug: string[] = []) {
  const [first, second] = slug;
  if (!first) return { title: 'All products', blurb: 'Every piece in the collection.', base: {}, sort: 'featured' };
  if (first === 'new' && !second) return { title: 'New in', blurb: 'The latest arrivals, fresh this week.', base: {}, sort: 'newest' };
  if (first === 'sale' && !second) return { title: 'Sale', blurb: 'Reduced for a limited time.', base: { onSale: true }, sort: 'featured' };
  const dept = DEPARTMENTS.find((d) => d.slug === first);
  if (!dept) return null;
  if (!second) return { title: dept.name, blurb: dept.blurb, base: { department: dept.slug }, sort: 'featured', dept };
  const cat = categories().find((c) => c.slug === second && c.department === dept.slug);
  if (!cat) return null;
  return { title: `${dept.name}’s ${cat.name}`, blurb: dept.blurb, base: { department: dept.slug, category: cat.slug }, sort: 'featured', dept, cat };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = resolve((await params).slug);
  return { title: r?.title ?? 'Not found' };
}

export default async function Shop({ params, searchParams }: Props) {
  const { slug } = await params;
  const { q } = await searchParams;
  const r = resolve(slug);
  if (!r) notFound();

  const data = await query<{ products: ShopPage }>(
    /* GraphQL */ `
      ${CARD_FIELDS}
      query ShopInitial($filter: ProductFilter, $sort: ProductSort) {
        products(filter: $filter, sort: $sort, first: 12) {
          total hasMore
          items { ...CardFields }
          facets { brands { value count } sizes { value count } priceRange { min max } }
        }
      }
    `,
    { filter: { ...r.base, query: q }, sort: r.sort }
  );

  const cats = r.dept
    ? categories()
        .filter((c) => c.department === r.dept!.slug)
        .map((c) => ({ slug: c.slug, name: c.name, count: c.count, href: `/shop/${r.dept!.slug}/${c.slug}` }))
    : DEPARTMENTS.map((d) => ({ slug: d.slug, name: d.name, href: `/shop/${d.slug}`, count: categories().filter((c) => c.department === d.slug).reduce((n, c) => n + c.count, 0) }));

  const basePath = `/shop${slug?.length ? `/${slug.join('/')}` : ''}`;

  return (
    <div className='wrap py-10'>
      <nav className='mb-6 text-sm text-stone' aria-label='Breadcrumb'>
        <Link href='/' className='hover:text-ink'>
          Home
        </Link>{' '}
        / <Link href='/shop' className='hover:text-ink'>Shop</Link>
        {r.dept && (
          <>
            {' '}
            / <Link href={`/shop/${r.dept.slug}`} className='hover:text-ink'>{r.dept.name}</Link>
          </>
        )}
        {r.cat && <> / <span className='text-ink'>{r.cat.name}</span></>}
      </nav>
      <header className='mb-10'>
        <h1 className='display text-5xl sm:text-6xl'>{q ? `“${q}”` : r.title}</h1>
        <p className='mt-3 max-w-lg text-stone'>{q ? `Search results in ${r.title.toLowerCase()}.` : r.blurb}</p>
      </header>
      <Suspense>
        <ShopBrowser
          key={`${basePath}?${q ?? ''}`}
          base={r.base}
          defaultSort={r.sort}
          initial={data.products}
          categories={cats}
          activeCategory={r.cat?.slug}
          basePath={basePath}
        />
      </Suspense>
    </div>
  );
}
