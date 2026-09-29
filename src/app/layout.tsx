import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Providers from '@/components/Providers';
import { currentCurrency } from '@/graphql/server';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', axes: ['opsz'] });

export const metadata: Metadata = {
  title: { default: 'Threadline: considered wardrobe essentials', template: '%s · Threadline' },
  description: 'A fashion store built on a GraphQL API with Next.js 15: multi-currency pricing, filters, quick view, wishlist and checkout.',
};

export const viewport: Viewport = { themeColor: '#f6f3ee' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const currency = await currentCurrency();
  return (
    <html lang='en' className={`${inter.variable} ${fraunces.variable}`}>
      <body>
        <Providers>
          <Header currency={currency} />
          <main className='min-h-[60vh]'>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
