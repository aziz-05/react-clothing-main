import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Leaf, RotateCcw, Truck } from 'lucide-react';
import Newsletter from '@/components/Newsletter';
import ProductCard from '@/components/ProductCard';
import { CARD_FIELDS, type CardProduct } from '@/graphql/fragments';
import { query } from '@/graphql/server';

type HomeData = {
  departments: { slug: string; name: string; blurb: string; categories: { slug: string; name: string; productCount: number; image: string }[] }[];
  newIn: { items: CardProduct[] };
  best: { items: CardProduct[] };
  sale: { items: CardProduct[]; total: number };
};

const HOME = /* GraphQL */ `
  ${CARD_FIELDS}
  query Home {
    departments { slug name blurb categories { slug name productCount image } }
    newIn: products(sort: newest, first: 8) { items { ...CardFields } }
    best: products(sort: rating, first: 4) { items { ...CardFields } }
    sale: products(filter: { onSale: true }, sort: price_desc, first: 4) { total items { ...CardFields } }
  }
`;

export default async function Home() {
  const data = await query<HomeData>(HOME);
  const heroImages = [data.newIn.items[0], data.best.items[0], data.sale.items[0]].filter(Boolean);
  const tiles = data.departments.flatMap((d) => d.categories.slice(0, 2).map((c) => ({ ...c, dept: d.name, href: `/shop/${d.slug}/${c.slug}` }))).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className='wrap grid items-center gap-10 py-12 lg:grid-cols-[1fr_1.1fr] lg:py-20'>
        <div className='space-y-8 animate-rise'>
          <p className='eyebrow'>Autumn / Winter 2026</p>
          <h1 className='display text-6xl leading-[0.95] sm:text-7xl xl:text-8xl'>
            Dressed for
            <br />
            <em className='text-clay'>every</em> season.
          </h1>
          <p className='max-w-md text-lg text-stone'>
            Timeless pieces from independent and heritage brands, priced in your currency and delivered free over $150.
          </p>
          <div className='flex flex-wrap gap-3'>
            <Link href='/shop/new' className='btn-ink'>
              Shop new in <ArrowRight size={16} />
            </Link>
            <Link href='/shop/sale' className='btn-line'>
              Up to {Math.max(...data.sale.items.map((p) => p.discountPercent))}% off
            </Link>
          </div>
        </div>
        <div className='grid h-[420px] grid-cols-2 grid-rows-2 gap-3 sm:h-[560px]'>
          {heroImages.map((p, i) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className={`group relative overflow-hidden bg-sand ${i === 0 ? 'row-span-2' : ''}`}
            >
              <Image src={p.thumbnail} alt={p.title} fill priority sizes='(max-width: 1024px) 50vw, 30vw' className='object-cover transition duration-1000 group-hover:scale-105' />
              <span className='absolute bottom-3 left-3 bg-cream/90 px-3 py-1.5 text-xs'>
                {p.title} · {p.price.formatted}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className='border-y border-ink/10'>
        <div className='wrap grid gap-6 py-6 text-sm sm:grid-cols-3'>
          {[
            [Truck, 'Free shipping over $150', 'Tracked, carbon-neutral delivery'],
            [RotateCcw, '30-day free returns', 'Changed your mind? No problem'],
            [Leaf, 'Built to last', 'Quality over quantity, always'],
          ].map(([Icon, t, s]) => {
            const I = Icon as typeof Truck;
            return (
              <div key={t as string} className='flex items-center gap-3'>
                <I size={20} strokeWidth={1.5} />
                <span>
                  <b className='font-medium'>{t as string}</b> <span className='text-stone'>· {s as string}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Categories */}
      <section className='wrap py-20'>
        <div className='mb-10 flex items-end justify-between'>
          <h2 className='display text-4xl sm:text-5xl'>Shop by category</h2>
          <Link href='/shop' className='hidden text-sm underline underline-offset-4 hover:text-clay sm:block'>
            View all
          </Link>
        </div>
        <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
          {tiles.map((c) => (
            <Link key={c.slug} href={c.href} className='group relative aspect-[3/4] overflow-hidden bg-sand'>
              <Image src={c.image} alt='' fill sizes='(max-width: 1024px) 50vw, 25vw' className='object-cover transition duration-700 group-hover:scale-105' />
              <span className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-5 text-cream'>
                <span className='eyebrow text-cream/80'>{c.dept}</span>
                <span className='block font-serif text-2xl'>{c.name}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New in */}
      <section className='wrap'>
        <div className='mb-10 flex items-end justify-between'>
          <div>
            <p className='eyebrow mb-2'>Just landed</p>
            <h2 className='display text-4xl sm:text-5xl'>New arrivals</h2>
          </div>
          <Link href='/shop/new' className='inline-flex items-center gap-2 text-sm underline underline-offset-4 hover:text-clay'>
            Shop all <ArrowRight size={14} />
          </Link>
        </div>
        <div className='grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4'>
          {data.newIn.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Sale banner */}
      <section className='wrap py-20'>
        <div className='grid overflow-hidden bg-clay text-white lg:grid-cols-2'>
          <div className='space-y-6 p-10 sm:p-16'>
            <p className='eyebrow text-white/70'>The mid-season sale</p>
            <h2 className='display text-5xl sm:text-6xl'>
              {data.sale.total} pieces,
              <br />
              <em>reduced.</em>
            </h2>
            <p className='max-w-sm text-white/80'>Quality you’ll keep for years, at prices that won’t last.</p>
            <Link href='/shop/sale' className='btn bg-cream text-ink hover:bg-white'>
              Shop the sale
            </Link>
          </div>
          <div className='grid grid-cols-2'>
            {data.sale.items.slice(0, 2).map((p) => (
              <Link key={p.id} href={`/product/${p.slug}`} className='group relative min-h-64 overflow-hidden'>
                <Image src={p.thumbnail} alt={p.title} fill sizes='25vw' className='object-cover transition duration-700 group-hover:scale-105' />
                <span className='absolute left-3 top-3 bg-white px-2 py-1 text-xs font-medium text-clay'>−{p.discountPercent}%</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className='wrap'>
        <div className='mb-10'>
          <p className='eyebrow mb-2'>Loved by customers</p>
          <h2 className='display text-4xl sm:text-5xl'>Highest rated</h2>
        </div>
        <div className='grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4'>
          {data.best.items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className='wrap pt-24'>
        <div className='grid items-center gap-8 border-y border-ink/15 py-16 lg:grid-cols-2'>
          <h2 className='display text-4xl sm:text-5xl'>
            Join the list, get <em className='text-clay'>10% off.</em>
          </h2>
          <Newsletter />
        </div>
      </section>
    </>
  );
}
