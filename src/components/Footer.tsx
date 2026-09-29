import Link from 'next/link';
import Newsletter from './Newsletter';

export default function Footer() {
  return (
    <footer className='mt-24 bg-ink text-cream'>
      <div className='wrap grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]'>
        <div className='space-y-5'>
          <p className='font-serif text-3xl tracking-[0.18em]'>THREADLINE</p>
          <p className='max-w-sm text-cream/70'>Considered wardrobe essentials. Get 10% off your first order when you join the list.</p>
          <Newsletter dark />
        </div>
        {[
          { title: 'Shop', links: [['New in', '/shop/new'], ['Women', '/shop/women'], ['Men', '/shop/men'], ['Sale', '/shop/sale']] },
          { title: 'Help', links: [['Your bag', '/checkout'], ['Wishlist', '/wishlist'], ['Shipping & returns', '/shop']] },
          { title: 'Developers', links: [['GraphQL explorer', '/api/graphql'], ['Source code', 'https://github.com/aziz-05/react-clothing-main']] },
        ].map((col) => (
          <div key={col.title}>
            <p className='eyebrow mb-4 text-cream/50'>{col.title}</p>
            <ul className='space-y-2.5'>
              {col.links.map(([label, href]) => (
                <li key={label}>
                  {href.startsWith('http') || href.startsWith('/api') ? (
                    <a href={href} className='text-cream/80 hover:text-cream'>
                      {label}
                    </a>
                  ) : (
                    <Link href={href} className='text-cream/80 hover:text-cream'>
                      {label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className='border-t border-cream/10 py-6 text-center text-xs text-cream/50'>
        Portfolio project by{' '}
        <a href='https://abd-elaziz-hafallah.vercel.app' className='text-cream/80 hover:text-cream'>
          Abd Elaziz Hafallah
        </a>
        . Demo store: no orders are fulfilled. Product data from DummyJSON.
      </div>
    </footer>
  );
}
