'use client';

/** Minimal typed GraphQL client for Client Components (talks to /api/graphql). */
export class GraphQLRequestError extends Error {}

export async function gql<T>(query: string, variables?: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    signal,
  });
  const json = await res.json();
  if (json.errors?.length) throw new GraphQLRequestError(json.errors[0].message);
  return json.data as T;
}
