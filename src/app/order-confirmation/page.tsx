import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = { title: 'Order confirmed' };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function Confirmation({ searchParams }: Props) {
  const { id, email, total, items, eta } = await searchParams;
  const date = eta ? new Date(eta).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : null;

  return (
    <div className='wrap max-w-2xl py-24 text-center'>
      <CheckCircle2 size={48} strokeWidth={1.2} className='mx-auto text-moss' />
      <p className='eyebrow mt-6'>Order {id ?? ''}</p>
      <h1 className='display mt-3 text-5xl sm:text-6xl'>Thank you.</h1>
      <p className='mx-auto mt-5 max-w-md text-lg text-stone'>
        Your order of {items ?? 'your'} item{items === '1' ? '' : 's'}
        {total && <> totalling <b className='text-ink'>{total}</b></>} is confirmed. We’ve sent the details to{' '}
        <b className='text-ink'>{email ?? 'your inbox'}</b>.
      </p>
      {date && (
        <p className='mt-8 inline-block border border-ink/15 px-6 py-4'>
          Estimated delivery
          <b className='block font-serif text-2xl font-normal'>{date}</b>
        </p>
      )}
      <div className='mt-10'>
        <Link href='/shop/new' className='btn-ink'>
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
