'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Eye, Star } from 'lucide-react';
import type { CardProduct } from '@/graphql/fragments';
import QuickView from './QuickView';
import WishlistButton from './WishlistButton';

export default function ProductCard({ product, priority }: { product: CardProduct; priority?: boolean }) {
  const [quick, setQuick] = useState(false);
  const second = product.images[1];

  return (
    <article className='group animate-rise'>
      <Link href={`/product/${product.slug}`} className='relative block aspect-[3/4] overflow-hidden bg-sand'>
        <Image
          src={product.thumbnail}
          alt={product.title}
          fill
          priority={priority}
          sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
          className='object-cover transition duration-700 group-hover:scale-[1.03]'
        />
        {second && (
          <Image
            src={second}
            alt=''
            fill
            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
            className='object-cover opacity-0 transition duration-700 group-hover:opacity-100'
          />
        )}
        <span className='absolute left-3 top-3 flex flex-col gap-1.5'>
          {product.isNew && <span className='bg-cream px-2 py-1 text-[11px] font-medium uppercase tracking-wider'>New</span>}
          {product.discountPercent > 0 && (
            <span className='bg-clay px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-white'>−{product.discountPercent}%</span>
          )}
          {product.stock === 0 && <span className='bg-ink px-2 py-1 text-[11px] uppercase tracking-wider text-cream'>Sold out</span>}
        </span>
        <WishlistButton id={product.id} className='absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-cream/90 hover:bg-cream' />
        <button
          onClick={(e) => {
            e.preventDefault();
            setQuick(true);
          }}
          className='absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-2 bg-cream/95 py-2.5 text-xs font-medium uppercase tracking-wider opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100'
        >
          <Eye size={15} /> Quick view
        </button>
      </Link>
      <div className='mt-3 space-y-1'>
        <p className='eyebrow text-[11px]'>{product.brand}</p>
        <Link href={`/product/${product.slug}`} className='line-clamp-1 text-[15px] hover:text-clay'>
          {product.title}
        </Link>
        <div className='flex items-center justify-between gap-2'>
          <p className='text-[15px]'>
            <span className={product.compareAtPrice ? 'text-clay' : ''}>{product.price.formatted}</span>
            {product.compareAtPrice && <s className='ml-2 text-sm text-stone'>{product.compareAtPrice.formatted}</s>}
          </p>
          <span className='inline-flex items-center gap-1 text-xs text-stone'>
            <Star size={12} className='fill-ink text-ink' /> {product.rating.average.toFixed(1)}
          </span>
        </div>
      </div>
      {quick && <QuickView slug={product.slug} onClose={() => setQuick(false)} />}
    </article>
  );
}
