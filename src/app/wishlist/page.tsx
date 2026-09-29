'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Heart, Loader2 } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { gql } from '@/graphql/client';
import { CARD_FIELDS, type CardProduct } from '@/graphql/fragments';
import { useHydrated } from '@/lib/useHydrated';
import { useWishlist } from '@/store/bag';

export default function Wishlist() {
  const hydrated = useHydrated();
  const ids = useWishlist((s) => s.ids);
  const { data, isLoading } = useQuery({
    queryKey: ['wishlist', ids],
    queryFn: () =>
      gql<{ productsByIds: CardProduct[] }>(`${CARD_FIELDS} query W($ids: [ID!]!) { productsByIds(ids: $ids) { ...CardFields } }`, { ids }).then(
        (d) => d.productsByIds
      ),
    enabled: hydrated && ids.length > 0,
    placeholderData: (prev) => prev?.filter((p) => ids.includes(p.id)),
  });

  return (
    <div className='wrap py-12'>
      <h1 className='display mb-2 text-5xl sm:text-6xl'>Wishlist</h1>
      <p className='mb-12 text-stone'>{hydrated ? `${ids.length} saved piece${ids.length === 1 ? '' : 's'}` : ' '}</p>

      {hydrated && ids.length === 0 ? (
        <div className='py-20 text-center'>
          <Heart size={40} strokeWidth={1.2} className='mx-auto text-stone' />
          <p className='display mt-4 text-3xl'>Nothing saved yet</p>
          <p className='mt-2 text-stone'>Tap the heart on anything you love to keep it here.</p>
          <Link href='/shop' className='btn-ink mt-8'>
            Start browsing
          </Link>
        </div>
      ) : isLoading || !hydrated ? (
        <Loader2 className='mx-auto animate-spin text-stone' />
      ) : (
        <div className='grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4'>
          {data?.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
