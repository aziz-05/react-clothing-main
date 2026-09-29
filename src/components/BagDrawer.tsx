'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Loader2, Minus, Plus, ShoppingBag, Tag, X } from 'lucide-react';
import { gql } from '@/graphql/client';
import { QUOTE_BAG, type BagQuote } from '@/graphql/fragments';
import { useHydrated } from '@/lib/useHydrated';
import { bagCount, useBag } from '@/store/bag';

/** Prices the bag on the server (quoteBag mutation) whenever its contents change. */
export function useBagQuote() {
  const hydrated = useHydrated();
  const { items, promoCode } = useBag();
  const payload = items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity }));
  return useQuery({
    queryKey: ['quote', payload, promoCode],
    queryFn: ({ signal }) => gql<{ quoteBag: BagQuote }>(QUOTE_BAG, { items: payload, promoCode }, signal).then((d) => d.quoteBag),
    enabled: hydrated && items.length > 0,
    placeholderData: (prev) => prev,
    retry: false,
  });
}

export function PromoForm() {
  const { promoCode, setPromo } = useBag();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const quote = useBagQuote();

  // The server rejects unknown codes; surface that and drop the code.
  useEffect(() => {
    if (quote.error && promoCode) {
      setError(quote.error.message);
      setPromo(null);
    }
  }, [quote.error, promoCode, setPromo]);

  if (promoCode) {
    return (
      <p className='flex items-center justify-between text-sm'>
        <span className='inline-flex items-center gap-2 text-moss'>
          <Tag size={14} /> Code <b>{promoCode}</b> applied
        </span>
        <button onClick={() => setPromo(null)} className='text-stone underline'>
          Remove
        </button>
      </p>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setError(undefined);
        setPromo(code.trim().toUpperCase());
        setCode('');
      }}
    >
      <div className='flex'>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder='Promo code (try WELCOME10)' aria-label='Promo code' className='field h-10 text-sm' />
        <button className='h-10 bg-ink px-4 text-xs font-medium uppercase tracking-wide text-cream hover:bg-clay'>Apply</button>
      </div>
      {error && <p className='mt-1.5 text-xs text-clay'>{error}</p>}
    </form>
  );
}

export function Totals({ quote }: { quote: BagQuote }) {
  const progress = quote.freeShippingRemaining.amount === 0;
  return (
    <div className='space-y-2 text-sm'>
      {!progress && (
        <p className='bg-sand px-3 py-2 text-xs'>
          Add <b>{quote.freeShippingRemaining.formatted}</b> more for free shipping.
        </p>
      )}
      <div className='flex justify-between'>
        <span>Subtotal</span>
        <span>{quote.subtotal.formatted}</span>
      </div>
      {quote.discount.amount > 0 && (
        <div className='flex justify-between text-moss'>
          <span>Discount ({quote.promoApplied})</span>
          <span>−{quote.discount.formatted}</span>
        </div>
      )}
      <div className='flex justify-between'>
        <span>Shipping</span>
        <span>{quote.shipping.amount === 0 ? 'Free' : quote.shipping.formatted}</span>
      </div>
      <div className='flex justify-between border-t border-ink/10 pt-3 font-serif text-lg'>
        <span>Total</span>
        <span>{quote.total.formatted}</span>
      </div>
      {quote.warnings.map((w) => (
        <p key={w} className='text-xs text-clay'>
          {w}
        </p>
      ))}
    </div>
  );
}

export default function BagDrawer() {
  const hydrated = useHydrated();
  const { items, open, setOpen, setQuantity, remove } = useBag();
  const quote = useBagQuote();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  if (!hydrated || !open) return null;

  const lineFor = (key: string) => {
    const [pid, size] = key.split(':');
    return quote.data?.lines.find((l) => l.product.id === pid && (l.size ?? '') === size);
  };

  return (
    <div className='fixed inset-0 z-50' role='dialog' aria-modal='true' aria-label='Shopping bag'>
      <div className='absolute inset-0 bg-ink/40 animate-fade-in' onClick={() => setOpen(false)} />
      <aside className='absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-cream shadow-2xl animate-slide-in'>
        <header className='flex items-center justify-between border-b border-ink/10 px-6 py-5'>
          <h2 className='font-serif text-2xl'>
            Your bag <span className='text-base text-stone'>({bagCount(items)})</span>
          </h2>
          <button onClick={() => setOpen(false)} aria-label='Close bag' className='p-1 hover:text-clay'>
            <X />
          </button>
        </header>

        {items.length === 0 ? (
          <div className='grid flex-1 place-items-center content-center gap-4 px-6 text-center'>
            <ShoppingBag size={40} strokeWidth={1.2} className='text-stone' />
            <p className='font-serif text-xl'>Your bag is empty</p>
            <Link href='/shop/new' onClick={() => setOpen(false)} className='btn-ink'>
              Shop new arrivals
            </Link>
          </div>
        ) : (
          <>
            <ul className='flex-1 divide-y divide-ink/10 overflow-y-auto px-6'>
              {items.map((i) => {
                const line = lineFor(i.key);
                return (
                  <li key={i.key} className='flex gap-4 py-5'>
                    <Link href={`/product/${i.slug}`} onClick={() => setOpen(false)} className='relative h-28 w-22 shrink-0 bg-sand'>
                      <Image src={i.image} alt={i.title} fill sizes='88px' className='object-cover' />
                    </Link>
                    <div className='flex min-w-0 flex-1 flex-col'>
                      <p className='eyebrow'>{i.brand}</p>
                      <p className='truncate font-medium'>{i.title}</p>
                      {i.size && <p className='text-sm text-stone'>Size {i.size}</p>}
                      <div className='mt-auto flex items-center justify-between'>
                        <div className='flex items-center border border-ink/20'>
                          <button onClick={() => setQuantity(i.key, i.quantity - 1)} aria-label='Decrease' className='p-2 hover:bg-sand'>
                            <Minus size={13} />
                          </button>
                          <span className='w-6 text-center text-sm'>{i.quantity}</span>
                          <button onClick={() => setQuantity(i.key, i.quantity + 1)} aria-label='Increase' className='p-2 hover:bg-sand'>
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className='text-sm font-medium'>{line?.lineTotal.formatted ?? '…'}</span>
                      </div>
                      <button onClick={() => remove(i.key)} className='mt-2 self-start text-xs text-stone underline hover:text-clay'>
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <footer className='space-y-4 border-t border-ink/10 px-6 py-5'>
              <PromoForm />
              {quote.data ? (
                <Totals quote={quote.data} />
              ) : (
                <p className='flex items-center gap-2 text-sm text-stone'>
                  <Loader2 size={14} className='animate-spin' /> Calculating…
                </p>
              )}
              <Link href='/checkout' onClick={() => setOpen(false)} className='btn-ink w-full'>
                Checkout
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
