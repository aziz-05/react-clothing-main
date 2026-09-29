'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Star, X } from 'lucide-react';
import { gql } from '@/graphql/client';
import AddToBag from './AddToBag';

type QV = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  description: string;
  thumbnail: string;
  images: string[];
  sizes: string[];
  stock: number;
  price: { formatted: string };
  compareAtPrice: { formatted: string } | null;
  rating: { average: number; count: number };
};

export default function QuickView({ slug, onClose }: { slug: string; onClose: () => void }) {
  const [img, setImg] = useState(0);
  const { data, isLoading } = useQuery({
    queryKey: ['quick', slug],
    queryFn: () =>
      gql<{ product: QV }>(
        `query Quick($slug: String!) { product(slug: $slug) { id slug title brand description thumbnail images sizes stock price { formatted } compareAtPrice { formatted } rating { average count } } }`,
        { slug }
      ).then((d) => d.product),
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Portal to <body>: an animated ancestor would otherwise become the containing
  // block for this fixed overlay and trap it inside the product card.
  return createPortal(
    <div className='fixed inset-0 z-50 grid place-items-center p-4' role='dialog' aria-modal='true' aria-label='Quick view'>
      <div className='absolute inset-0 bg-ink/50 animate-fade-in' onClick={onClose} />
      <div className='relative grid max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-cream shadow-2xl animate-rise md:grid-cols-2'>
        <button onClick={onClose} aria-label='Close' className='absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-cream hover:text-clay'>
          <X size={18} />
        </button>
        {isLoading || !data ? (
          <div className='col-span-2 grid h-96 place-items-center'>
            <Loader2 className='animate-spin text-stone' />
          </div>
        ) : (
          <>
            <div>
              <div className='relative aspect-[3/4] bg-sand'>
                <Image src={data.images[img] ?? data.thumbnail} alt={data.title} fill sizes='450px' className='object-cover' />
              </div>
              {data.images.length > 1 && (
                <div className='flex gap-2 p-3'>
                  {data.images.map((src, i) => (
                    <button key={src} onClick={() => setImg(i)} className={`relative h-16 w-12 bg-sand ${i === img ? 'ring-2 ring-ink' : 'opacity-70 hover:opacity-100'}`} aria-label={`Image ${i + 1}`}>
                      <Image src={src} alt='' fill sizes='48px' className='object-cover' />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className='space-y-5 p-6 sm:p-8'>
              <div>
                <p className='eyebrow'>{data.brand}</p>
                <h2 className='mt-1 font-serif text-3xl font-light'>{data.title}</h2>
                <p className='mt-2 inline-flex items-center gap-1.5 text-sm text-stone'>
                  <Star size={14} className='fill-ink text-ink' /> {data.rating.average.toFixed(1)} · {data.rating.count} reviews
                </p>
              </div>
              <p className='text-xl'>
                <span className={data.compareAtPrice ? 'text-clay' : ''}>{data.price.formatted}</span>
                {data.compareAtPrice && <s className='ml-3 text-base text-stone'>{data.compareAtPrice.formatted}</s>}
              </p>
              <p className='line-clamp-4 text-[15px] leading-relaxed text-stone'>{data.description}</p>
              <AddToBag product={data} onAdded={onClose} />
              <Link href={`/product/${data.slug}`} onClick={onClose} className='inline-block text-sm underline underline-offset-4 hover:text-clay'>
                View full details
              </Link>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
