'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { CURRENCIES, CURRENCY_COOKIE } from '@/lib/currency';
import type { CurrencyCode } from '@/lib/types';

/** Stores the currency in a cookie so the server renders prices in it, then refreshes. */
export default function CurrencySwitcher({ value }: { value: CurrencyCode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pending, start] = useTransition();

  return (
    <label className='relative flex items-center text-sm'>
      <span className='sr-only'>Currency</span>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => {
          document.cookie = `${CURRENCY_COOKIE}=${e.target.value}; path=/; max-age=31536000; samesite=lax`;
          start(() => {
            queryClient.invalidateQueries();
            router.refresh();
          });
        }}
        className='cursor-pointer appearance-none bg-transparent py-1 pr-1 font-medium outline-none disabled:opacity-50'
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.symbol} {c.code}
          </option>
        ))}
      </select>
    </label>
  );
}
