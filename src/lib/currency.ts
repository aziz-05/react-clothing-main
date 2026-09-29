import type { CurrencyCode } from './types';

// Fixed demo exchange rates relative to USD. A real store would refresh these
// from a rates provider; keeping them static keeps prices reproducible.
export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string; rate: number }[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar', rate: 1 },
  { code: 'EUR', symbol: '€', label: 'Euro', rate: 0.92 },
  { code: 'GBP', symbol: '£', label: 'British Pound', rate: 0.79 },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen', rate: 149 },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar', rate: 1.52 },
];

export const CURRENCY_COOKIE = 'tl-currency';

export function isCurrency(v: unknown): v is CurrencyCode {
  return CURRENCIES.some((c) => c.code === v);
}

/** Converts USD cents to the minor units' major amount in the target currency. */
export function convert(usdCents: number, code: CurrencyCode) {
  const c = CURRENCIES.find((x) => x.code === code)!;
  const amount = (usdCents / 100) * c.rate;
  // JPY has no minor unit; everything else rounds to cents.
  return code === 'JPY' ? Math.round(amount) : Math.round(amount * 100) / 100;
}

export function formatMoney(amount: number, code: CurrencyCode) {
  return new Intl.NumberFormat(code === 'EUR' ? 'de-AT' : 'en-US', {
    style: 'currency',
    currency: code,
    maximumFractionDigits: code === 'JPY' ? 0 : 2,
  }).format(amount);
}

export type Money = { amount: number; currency: CurrencyCode; formatted: string };

export function money(usdCents: number, code: CurrencyCode): Money {
  const amount = convert(usdCents, code);
  return { amount, currency: code, formatted: formatMoney(amount, code) };
}
