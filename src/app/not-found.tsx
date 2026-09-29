import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='wrap py-32 text-center'>
      <p className='eyebrow'>404</p>
      <h1 className='display mt-3 text-6xl'>Out of stock, or never was.</h1>
      <p className='mt-4 text-stone'>We couldn’t find that page.</p>
      <Link href='/shop' className='btn-ink mt-8'>
        Browse the collection
      </Link>
    </div>
  );
}
