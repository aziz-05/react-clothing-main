'use client';

import clsx from 'clsx';
import { Heart } from 'lucide-react';
import { useHydrated } from '@/lib/useHydrated';
import { useWishlist } from '@/store/bag';

export default function WishlistButton({ id, className, withLabel }: { id: string; className?: string; withLabel?: boolean }) {
  const hydrated = useHydrated();
  const { ids, toggle } = useWishlist();
  const saved = hydrated && ids.includes(id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={clsx('inline-flex items-center gap-2 transition', className)}
    >
      <Heart size={18} strokeWidth={1.6} className={clsx('transition', saved && 'scale-110 fill-clay text-clay')} />
      {withLabel && (saved ? 'Saved' : 'Save')}
    </button>
  );
}
