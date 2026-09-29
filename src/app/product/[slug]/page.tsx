import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Truck, RotateCcw } from 'lucide-react';
import AddToBag from '@/components/AddToBag';
import Gallery from '@/components/Gallery';
import ProductCard from '@/components/ProductCard';
import { CARD_FIELDS, type CardProduct } from '@/graphql/fragments';
import { query } from '@/graphql/server';
import { allProducts } from '@/lib/catalog';

type Props = { params: Promise<{ slug: string }> };

type Detail = {
  product: {
    id: string;
    slug: string;
    title: string;
    brand: string;
    description: string;
    thumbnail: string;
    images: string[];
    sizes: string[];
    tags: string[];
    stock: number;
    discountPercent: number;
    category: { name: string; slug: string; department: string };
    price: { formatted: string };
    compareAtPrice: { formatted: string } | null;
    rating: { average: number; count: number; breakdown: number[] };
    reviews: { rating: number; comment: string; date: string; author: string }[];
    related: CardProduct[];
  } | null;
};

const PRODUCT = /* GraphQL */ `
  ${CARD_FIELDS}
  query Product($slug: String!) {
    product(slug: $slug) {
      id slug title brand description thumbnail images sizes tags stock discountPercent
      category { name slug department }
      price { formatted }
      compareAtPrice { formatted }
      rating { average count breakdown }
      reviews { rating comment date author }
      related(first: 4) { ...CardFields }
    }
  }
`;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = allProducts().find((x) => x.slug === slug);
  return product ? { title: product.title, description: product.description } : { title: 'Not found' };
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className='inline-flex' aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-ink text-ink' : 'text-ink/25'} />
      ))}
    </span>
  );
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const { product: p } = await query<Detail>(PRODUCT, { slug });
  if (!p) notFound();
  const total = p.rating.breakdown.reduce((a, b) => a + b, 0) || 1;

  return (
    <div className='wrap py-8'>
      <nav className='mb-6 text-sm text-stone' aria-label='Breadcrumb'>
        <Link href='/' className='hover:text-ink'>Home</Link> /{' '}
        <Link href={`/shop/${p.category.department}`} className='capitalize hover:text-ink'>{p.category.department}</Link> /{' '}
        <Link href={`/shop/${p.category.department}/${p.category.slug}`} className='hover:text-ink'>{p.category.name}</Link>
      </nav>

      <div className='grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16'>
        <Gallery images={p.images} alt={p.title} />

        <div className='space-y-7 lg:sticky lg:top-24 lg:self-start'>
          <div className='space-y-3'>
            <p className='eyebrow'>{p.brand}</p>
            <h1 className='display text-4xl sm:text-5xl'>{p.title}</h1>
            <a href='#reviews' className='inline-flex items-center gap-2 text-sm text-stone hover:text-ink'>
              <Stars value={p.rating.average} /> {p.rating.average.toFixed(1)} ({p.rating.count} reviews)
            </a>
          </div>
          <p className='text-2xl'>
            <span className={p.compareAtPrice ? 'text-clay' : ''}>{p.price.formatted}</span>
            {p.compareAtPrice && (
              <>
                <s className='ml-3 text-lg text-stone'>{p.compareAtPrice.formatted}</s>
                <span className='ml-3 bg-clay px-2 py-0.5 align-middle text-xs text-white'>−{p.discountPercent}%</span>
              </>
            )}
          </p>

          <AddToBag product={p} />

          <div className='divide-y divide-ink/10 border-y border-ink/10'>
            <details open className='group py-4'>
              <summary className='flex cursor-pointer list-none justify-between font-medium'>
                Description <span className='transition group-open:rotate-45'>+</span>
              </summary>
              <p className='mt-3 leading-relaxed text-stone'>{p.description}</p>
              {p.tags.length > 0 && (
                <p className='mt-3 flex flex-wrap gap-2'>
                  {p.tags.map((t) => (
                    <span key={t} className='bg-sand px-2 py-1 text-xs capitalize'>
                      {t}
                    </span>
                  ))}
                </p>
              )}
            </details>
            <details className='group py-4'>
              <summary className='flex cursor-pointer list-none justify-between font-medium'>
                Delivery & returns <span className='transition group-open:rotate-45'>+</span>
              </summary>
              <ul className='mt-3 space-y-2 text-stone'>
                <li className='flex gap-2'>
                  <Truck size={18} strokeWidth={1.5} /> Free tracked shipping on orders over $150, otherwise $9.
                </li>
                <li className='flex gap-2'>
                  <RotateCcw size={18} strokeWidth={1.5} /> Free returns within 30 days.
                </li>
              </ul>
            </details>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section id='reviews' className='mt-24 grid gap-12 scroll-mt-24 lg:grid-cols-[320px_1fr]'>
        <div className='space-y-4'>
          <h2 className='display text-4xl'>Reviews</h2>
          <p className='flex items-center gap-3'>
            <span className='font-serif text-5xl'>{p.rating.average.toFixed(1)}</span>
            <span>
              <Stars value={p.rating.average} size={16} />
              <span className='block text-sm text-stone'>{p.rating.count} reviews</span>
            </span>
          </p>
          <ul className='space-y-2'>
            {p.rating.breakdown.map((n, i) => (
              <li key={i} className='flex items-center gap-3 text-sm'>
                <span className='w-10'>{5 - i} ★</span>
                <span className='h-1.5 flex-1 bg-sand'>
                  <span className='block h-full bg-ink' style={{ width: `${(n / total) * 100}%` }} />
                </span>
                <span className='w-5 text-right text-stone'>{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <ul className='divide-y divide-ink/10'>
          {p.reviews.map((r, i) => (
            <li key={i} className='py-6 first:pt-0'>
              <div className='flex items-center justify-between'>
                <Stars value={r.rating} />
                <time className='text-sm text-stone'>{new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
              </div>
              <p className='mt-3 font-serif text-xl'>“{r.comment}”</p>
              <p className='mt-2 text-sm text-stone'>{r.author} · Verified buyer</p>
            </li>
          ))}
        </ul>
      </section>

      {p.related.length > 0 && (
        <section className='mt-24'>
          <h2 className='display mb-10 text-4xl'>You may also like</h2>
          <div className='grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4'>
            {p.related.map((r) => (
              <ProductCard key={r.id} product={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
