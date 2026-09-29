'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Loader2, SlidersHorizontal, X } from 'lucide-react';
import { gql } from '@/graphql/client';
import { CARD_FIELDS, type CardProduct } from '@/graphql/fragments';
import ProductCard from './ProductCard';

export type ShopPage = {
  items: CardProduct[];
  total: number;
  hasMore: boolean;
  facets: { brands: { value: string; count: number }[]; sizes: { value: string; count: number }[]; priceRange: { min: number; max: number } };
};

type BaseFilter = { department?: string; category?: string; onSale?: boolean };

const PAGE = 12;
const SORTS = [
  ['featured', 'Featured'],
  ['newest', 'Newest'],
  ['price_asc', 'Price: low to high'],
  ['price_desc', 'Price: high to low'],
  ['rating', 'Top rated'],
] as const;

const PRODUCTS = /* GraphQL */ `
  ${CARD_FIELDS}
  query Shop($filter: ProductFilter, $sort: ProductSort, $first: Int, $offset: Int) {
    products(filter: $filter, sort: $sort, first: $first, offset: $offset) {
      total hasMore
      items { ...CardFields }
      facets { brands { value count } sizes { value count } priceRange { min max } }
    }
  }
`;

/** Reads filters from the URL. The URL is the single source of truth, so views are shareable. */
function readParams(sp: URLSearchParams, defaultSort: string) {
  const list = (k: string) => sp.get(k)?.split(',').filter(Boolean) ?? [];
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined);
  return {
    q: sp.get('q') ?? undefined,
    brands: list('brand'),
    sizes: list('size'),
    minPrice: num('min'),
    maxPrice: num('max'),
    inStock: sp.get('stock') === '1',
    sort: sp.get('sort') ?? defaultSort,
  };
}

export default function ShopBrowser({
  base,
  defaultSort,
  initial,
  categories,
  activeCategory,
  basePath,
}: {
  base: BaseFilter;
  defaultSort: string;
  initial: ShopPage;
  categories: { slug: string; name: string; href: string; count: number }[];
  activeCategory?: string;
  basePath: string;
}) {
  const sp = useSearchParams();
  const params = readParams(new URLSearchParams(sp.toString()), defaultSort);
  const [panel, setPanel] = useState(false);
  const [price, setPrice] = useState({ min: params.minPrice?.toString() ?? '', max: params.maxPrice?.toString() ?? '' });

  const filter = useMemo(
    () => ({
      ...base,
      query: params.q,
      brands: params.brands.length ? params.brands : undefined,
      sizes: params.sizes.length ? params.sizes : undefined,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      inStock: params.inStock || undefined,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sp.toString(), base.department, base.category, base.onSale]
  );
  const isInitial = sp.toString() === '' || (sp.size === 1 && !!params.q);

  const query = useInfiniteQuery({
    queryKey: ['shop', filter, params.sort],
    queryFn: ({ pageParam, signal }) =>
      gql<{ products: ShopPage }>(PRODUCTS, { filter, sort: params.sort, first: PAGE, offset: pageParam }, signal).then((d) => d.products),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length * PAGE : undefined),
    initialData: isInitial ? { pages: [initial], pageParams: [0] } : undefined,
    placeholderData: (prev) => prev,
  });

  // Updates the URL without a server round trip; the query above refetches via GraphQL.
  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    window.history.replaceState(null, '', `${basePath}${next.size ? `?${next}` : ''}`);
  };

  const toggle = (key: 'brand' | 'size', value: string) => {
    const current = key === 'brand' ? params.brands : params.sizes;
    const nextList = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    update({ [key]: nextList.join(',') || undefined });
  };

  const first = query.data?.pages[0] ?? initial;
  const items = query.data?.pages.flatMap((p) => p.items) ?? initial.items;
  const facets = first.facets;
  const activeCount = params.brands.length + params.sizes.length + (params.minPrice != null || params.maxPrice != null ? 1 : 0) + (params.inStock ? 1 : 0);

  const filters = (
    <div className='space-y-8 text-sm'>
      {categories.length > 0 && (
        <div>
          <p className='eyebrow mb-3'>Category</p>
          <ul className='space-y-2'>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={c.href} className={clsx('flex justify-between hover:text-clay', activeCategory === c.slug && 'font-semibold')}>
                  {c.name} <span className='text-stone'>{c.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {facets.sizes.length > 0 && (
        <div>
          <p className='eyebrow mb-3'>Size</p>
          <div className='flex flex-wrap gap-2'>
            {facets.sizes.map((s) => (
              <button
                key={s.value}
                onClick={() => toggle('size', s.value)}
                aria-pressed={params.sizes.includes(s.value)}
                className={clsx('h-9 min-w-10 border px-2 transition', params.sizes.includes(s.value) ? 'border-ink bg-ink text-cream' : 'border-ink/20 hover:border-ink')}
              >
                {s.value}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className='eyebrow mb-3'>Brand</p>
        <ul className='max-h-64 space-y-2 overflow-y-auto pr-2'>
          {facets.brands.map((b) => (
            <li key={b.value}>
              <label className='flex cursor-pointer items-center gap-2.5'>
                <input type='checkbox' checked={params.brands.includes(b.value)} onChange={() => toggle('brand', b.value)} className='h-4 w-4 accent-ink' />
                <span className='flex-1'>{b.value}</span>
                <span className='text-stone'>{b.count}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className='eyebrow mb-3'>Price (USD)</p>
        <form
          className='flex items-center gap-2'
          onSubmit={(e) => {
            e.preventDefault();
            update({ min: price.min || undefined, max: price.max || undefined });
          }}
        >
          <input value={price.min} onChange={(e) => setPrice((p) => ({ ...p, min: e.target.value.replace(/\D/g, '') }))} placeholder={`${facets.priceRange.min}`} aria-label='Min price' className='field h-10 w-20 px-2 text-sm' />
          <span>–</span>
          <input value={price.max} onChange={(e) => setPrice((p) => ({ ...p, max: e.target.value.replace(/\D/g, '') }))} placeholder={`${facets.priceRange.max}`} aria-label='Max price' className='field h-10 w-20 px-2 text-sm' />
          <button className='h-10 border border-ink px-3 text-xs uppercase hover:bg-ink hover:text-cream'>Go</button>
        </form>
      </div>
      <label className='flex cursor-pointer items-center gap-2.5'>
        <input type='checkbox' checked={params.inStock} onChange={() => update({ stock: params.inStock ? undefined : '1' })} className='h-4 w-4 accent-ink' />
        In stock only
      </label>
      {activeCount > 0 && (
        <button
          onClick={() => {
            setPrice({ min: '', max: '' });
            update({ brand: undefined, size: undefined, min: undefined, max: undefined, stock: undefined });
          }}
          className='text-sm underline underline-offset-4 hover:text-clay'
        >
          Clear filters ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div className='grid gap-10 lg:grid-cols-[240px_1fr]'>
      <aside className='hidden lg:block'>{filters}</aside>

      <div>
        <div className='mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-4'>
          <button onClick={() => setPanel(true)} className='inline-flex items-center gap-2 text-sm lg:hidden'>
            <SlidersHorizontal size={16} /> Filters {activeCount > 0 && `(${activeCount})`}
          </button>
          <p className='text-sm text-stone' aria-live='polite'>
            {query.isFetching && !query.isFetchingNextPage ? <Loader2 size={14} className='inline animate-spin' /> : first.total} {first.total === 1 ? 'piece' : 'pieces'}
            {params.q && <> for “{params.q}”</>}
          </p>
          <label className='flex items-center gap-2 text-sm'>
            Sort
            <select value={params.sort} onChange={(e) => update({ sort: e.target.value === defaultSort ? undefined : e.target.value })} className='bg-transparent font-medium outline-none'>
              {SORTS.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        </div>

        {items.length === 0 ? (
          <div className='py-24 text-center'>
            <p className='display text-3xl'>Nothing matches, yet.</p>
            <p className='mt-2 text-stone'>Try removing a filter or two.</p>
          </div>
        ) : (
          <div className={clsx('grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 transition-opacity', query.isFetching && !query.isFetchingNextPage && 'opacity-60')}>
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 3} />
            ))}
          </div>
        )}

        {query.hasNextPage && (
          <div className='mt-14 text-center'>
            <p className='mb-4 text-sm text-stone'>
              Showing {items.length} of {first.total}
            </p>
            <button onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage} className='btn-line'>
              {query.isFetchingNextPage ? <Loader2 size={16} className='animate-spin' /> : 'Load more'}
            </button>
          </div>
        )}
      </div>

      {panel && (
        <div className='fixed inset-0 z-50 lg:hidden' role='dialog' aria-modal='true' aria-label='Filters'>
          <div className='absolute inset-0 bg-ink/40' onClick={() => setPanel(false)} />
          <div className='absolute inset-y-0 left-0 w-full max-w-sm overflow-y-auto bg-cream p-6 animate-fade-in'>
            <div className='mb-6 flex items-center justify-between'>
              <p className='font-serif text-2xl'>Filters</p>
              <button onClick={() => setPanel(false)} aria-label='Close filters'>
                <X />
              </button>
            </div>
            {filters}
            <button onClick={() => setPanel(false)} className='btn-ink mt-8 w-full'>
              Show {first.total} results
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
