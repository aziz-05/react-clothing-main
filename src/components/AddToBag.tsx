'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { Check } from 'lucide-react';
import { useBag } from '@/store/bag';
import WishlistButton from './WishlistButton';

type Props = {
  product: { id: string; slug: string; title: string; brand: string; thumbnail: string; sizes: string[]; stock: number };
  onAdded?: () => void;
};

export default function AddToBag({ product, onAdded }: Props) {
  const add = useBag((s) => s.add);
  const [size, setSize] = useState<string>();
  const [error, setError] = useState(false);
  const [added, setAdded] = useState(false);
  const needsSize = product.sizes.length > 0;
  const soldOut = product.stock === 0;

  const onAdd = () => {
    if (needsSize && !size) {
      setError(true);
      return;
    }
    add({ productId: product.id, slug: product.slug, title: product.title, brand: product.brand, image: product.thumbnail, size });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    onAdded?.();
  };

  return (
    <div className='space-y-5'>
      {needsSize && (
        <fieldset>
          <legend className='mb-3 flex w-full justify-between text-sm'>
            <span>
              Size{size && <b className='ml-1'>{size}</b>}
            </span>
            <span className='text-stone'>{/^\d/.test(product.sizes[0]) ? 'EU sizing' : 'Regular fit'}</span>
          </legend>
          <div className='grid grid-cols-5 gap-2 sm:grid-cols-6'>
            {product.sizes.map((s) => (
              <button
                key={s}
                type='button'
                onClick={() => {
                  setSize(s);
                  setError(false);
                }}
                aria-pressed={size === s}
                className={clsx(
                  'h-11 border text-sm transition',
                  size === s ? 'border-ink bg-ink text-cream' : 'border-ink/20 hover:border-ink'
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {error && <p className='mt-2 text-sm text-clay'>Please select a size.</p>}
        </fieldset>
      )}
      <div className='flex gap-3'>
        <button onClick={onAdd} disabled={soldOut} className='btn-ink flex-1'>
          {soldOut ? 'Sold out' : added ? (
            <>
              <Check size={17} /> Added to bag
            </>
          ) : (
            'Add to bag'
          )}
        </button>
        <WishlistButton id={product.id} className='grid h-12 w-12 shrink-0 place-items-center border border-ink/20 hover:border-ink' />
      </div>
      {!soldOut && product.stock <= 10 && <p className='text-sm text-clay'>Only {product.stock} left, so order soon.</p>}
    </div>
  );
}
