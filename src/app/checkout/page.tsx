'use client';

import { useMutation } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { PromoForm, Totals, useBagQuote } from '@/components/BagDrawer';
import { gql } from '@/graphql/client';
import { useHydrated } from '@/lib/useHydrated';
import { bagCount, useBag } from '@/store/bag';

const COUNTRIES = ['Austria', 'Germany', 'Switzerland', 'France', 'Italy', 'United Kingdom', 'United States', 'Australia', 'Japan'];

type Shipping = { name: string; email: string; address: string; city: string; postalCode: string; country: string };

const PLACE_ORDER = /* GraphQL */ `
  mutation Place($input: PlaceOrderInput!) {
    placeOrder(input: $input) { id email itemCount estimatedDelivery total { formatted } }
  }
`;

export default function Checkout() {
  const hydrated = useHydrated();
  const router = useRouter();
  const { items, promoCode, clear } = useBag();
  const quote = useBagQuote();
  const [form, setForm] = useState<Shipping>({ name: '', email: '', address: '', city: '', postalCode: '', country: 'Austria' });

  const place = useMutation({
    mutationFn: () =>
      gql<{ placeOrder: { id: string; email: string; itemCount: number; estimatedDelivery: string; total: { formatted: string } } }>(PLACE_ORDER, {
        input: { items: items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })), shipping: form, promoCode },
      }).then((d) => d.placeOrder),
    onSuccess: (o) => {
      clear();
      const sp = new URLSearchParams({ id: o.id, email: o.email, total: o.total.formatted, items: String(o.itemCount), eta: o.estimatedDelivery });
      router.push(`/order-confirmation?${sp}`);
    },
  });

  if (!hydrated) return <div className='h-screen' />;

  if (items.length === 0) {
    return (
      <div className='wrap py-32 text-center'>
        <h1 className='display text-5xl'>Your bag is empty</h1>
        <Link href='/shop/new' className='btn-ink mt-8'>
          Discover new arrivals
        </Link>
      </div>
    );
  }

  const set = (k: keyof Shipping) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className='wrap grid gap-12 py-12 lg:grid-cols-[1fr_420px]'>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          place.mutate();
        }}
        className='space-y-10'
      >
        <h1 className='display text-5xl'>Checkout</h1>

        <fieldset className='space-y-4'>
          <legend className='eyebrow mb-4'>1 · Contact</legend>
          <input required type='email' value={form.email} onChange={set('email')} placeholder='Email' autoComplete='email' className='field' aria-label='Email' />
        </fieldset>

        <fieldset className='grid gap-4 sm:grid-cols-2'>
          <legend className='eyebrow mb-4'>2 · Shipping address</legend>
          <input required value={form.name} onChange={set('name')} placeholder='Full name' autoComplete='name' className='field sm:col-span-2' aria-label='Full name' />
          <input required value={form.address} onChange={set('address')} placeholder='Street and house number' autoComplete='street-address' className='field sm:col-span-2' aria-label='Address' />
          <input required value={form.city} onChange={set('city')} placeholder='City' autoComplete='address-level2' className='field' aria-label='City' />
          <input required value={form.postalCode} onChange={set('postalCode')} placeholder='Postal code' autoComplete='postal-code' className='field' aria-label='Postal code' />
          <select value={form.country} onChange={set('country')} className='field sm:col-span-2' aria-label='Country'>
            {COUNTRIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </fieldset>

        <fieldset>
          <legend className='eyebrow mb-4'>3 · Payment</legend>
          <p className='border border-dashed border-ink/30 bg-white/50 p-4 text-sm text-stone'>
            This is a demo store, so no payment is taken. Placing an order validates your bag and address on the
            server via the <code className='text-ink'>placeOrder</code> GraphQL mutation.
          </p>
        </fieldset>

        {place.error && <p className='bg-clay/10 px-4 py-3 text-sm text-clay'>{place.error.message}</p>}

        <button disabled={place.isPending || !quote.data} className='btn-ink w-full sm:w-auto'>
          {place.isPending ? <Loader2 size={16} className='animate-spin' /> : <Lock size={15} />}
          Place order {quote.data && `· ${quote.data.total.formatted}`}
        </button>
      </form>

      <aside className='h-fit space-y-6 bg-sand/60 p-6 lg:sticky lg:top-24'>
        <h2 className='font-serif text-2xl'>Order summary ({bagCount(items)})</h2>
        <ul className='space-y-4'>
          {items.map((i) => {
            const line = quote.data?.lines.find((l) => l.product.id === i.productId && (l.size ?? undefined) === i.size);
            return (
              <li key={i.key} className='flex gap-4'>
                <span className='relative h-20 w-16 shrink-0 bg-sand'>
                  <Image src={i.image} alt='' fill sizes='64px' className='object-cover' />
                  <span className='absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-ink text-[11px] text-cream'>{i.quantity}</span>
                </span>
                <span className='min-w-0 flex-1 text-sm'>
                  <span className='block truncate font-medium'>{i.title}</span>
                  <span className='text-stone'>{i.size ? `Size ${i.size}` : i.brand}</span>
                </span>
                <span className='text-sm'>{line?.lineTotal.formatted ?? '…'}</span>
              </li>
            );
          })}
        </ul>
        <PromoForm />
        {quote.data ? <Totals quote={quote.data} /> : <Loader2 className='animate-spin text-stone' />}
      </aside>
    </div>
  );
}
