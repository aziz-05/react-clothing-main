import 'server-only';
import { cookies } from 'next/headers';
import { graphql } from 'graphql';
import { CURRENCY_COOKIE, isCurrency } from '@/lib/currency';
import type { CurrencyCode } from '@/lib/types';
import { schema } from './schema';

export async function currentCurrency(): Promise<CurrencyCode> {
  const value = (await cookies()).get(CURRENCY_COOKIE)?.value;
  return isCurrency(value) ? value : 'USD';
}

/**
 * Runs a GraphQL operation in-process for Server Components: the exact same
 * schema and resolvers that serve /api/graphql, without an HTTP round trip.
 */
export async function query<T>(source: string, variableValues?: Record<string, unknown>): Promise<T> {
  const result = await graphql({ schema, source, variableValues, contextValue: { currency: await currentCurrency() } });
  if (result.errors?.length) throw new Error(result.errors.map((e) => e.message).join('; '));
  // graphql-js builds results with null prototypes, which React refuses to pass
  // to Client Components; normalise to plain JSON (what an HTTP client would see).
  return JSON.parse(JSON.stringify(result.data)) as T;
}
