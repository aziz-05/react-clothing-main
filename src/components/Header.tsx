'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import { Heart, Menu, Search, ShoppingBag, X } from 'lucide-react';
import type { CurrencyCode } from '@/lib/types';
import { useHydrated } from '@/lib/useHydrated';
import { bagCount, useBag, useWishlist } from '@/store/bag';
import BagDrawer from './BagDrawer';
import CurrencySwitcher from './CurrencySwitcher';
import SearchOverlay from './SearchOverlay';

const NAV = [
  { href: '/shop/new', label: 'New in' },
  { href: '/shop/women', label: 'Women' },
  { href: '/shop/men', label: 'Men' },
  { href: '/shop/accessories', label: 'Accessories' },
  { href: '/shop/sale', label: 'Sale', accent: true },
];

export default function Header({ currency }: { currency: CurrencyCode }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const count = useBag((s) => bagCount(s.items));
  const setOpen = useBag((s) => s.setOpen);
  const wish = useWishlist((s) => s.ids.length);
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const closeSearch = useCallback(() => setSearch(false), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenu(false), [pathname]);

  return (
    <>
      <div className='bg-ink py-2 text-center text-xs tracking-wide text-cream'>
        Free shipping over $150 · Use code <b>WELCOME10</b> for 10% off your first order
      </div>
      <header className={clsx('sticky top-0 z-40 border-b transition-colors', scrolled ? 'border-ink/10 bg-cream/95 backdrop-blur' : 'border-transparent bg-cream')}>
        <div className='wrap flex h-16 items-center gap-6'>
          <button className='lg:hidden' onClick={() => setMenu((m) => !m)} aria-label='Menu' aria-expanded={menu}>
            {menu ? <X /> : <Menu />}
          </button>
          <Link href='/' className='font-serif text-2xl font-medium tracking-[0.18em]'>
            THREADLINE
          </Link>
          <nav className='ml-6 hidden gap-7 text-sm lg:flex' aria-label='Main'>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={clsx(
                  'relative py-1 transition after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition hover:after:scale-x-100',
                  n.accent && 'text-clay',
                  pathname.startsWith(n.href) && 'after:scale-x-100'
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className='ml-auto flex items-center gap-4 sm:gap-5'>
            <span className='hidden sm:block'>
              <CurrencySwitcher value={currency} />
            </span>
            <button onClick={() => setSearch(true)} aria-label='Search' className='hover:text-clay'>
              <Search size={20} strokeWidth={1.6} />
            </button>
            <Link href='/wishlist' aria-label={`Wishlist (${hydrated ? wish : 0})`} className='relative hover:text-clay'>
              <Heart size={20} strokeWidth={1.6} />
              {hydrated && wish > 0 && <span className='absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 text-[10px] text-white'>{wish}</span>}
            </Link>
            <button onClick={() => setOpen(true)} aria-label={`Bag (${hydrated ? count : 0} items)`} className='relative hover:text-clay'>
              <ShoppingBag size={20} strokeWidth={1.6} />
              {hydrated && count > 0 && (
                <span key={count} className='absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] text-cream animate-rise'>
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {menu && (
          <nav className='wrap space-y-1 border-t border-ink/10 pb-6 pt-3 lg:hidden animate-fade-in' aria-label='Mobile'>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={clsx('block py-2 font-serif text-2xl', n.accent && 'text-clay')}>
                {n.label}
              </Link>
            ))}
            <div className='pt-3'>
              <CurrencySwitcher value={currency} />
            </div>
          </nav>
        )}
      </header>
      {search && <SearchOverlay onClose={closeSearch} />}
      <BagDrawer />
    </>
  );
}
