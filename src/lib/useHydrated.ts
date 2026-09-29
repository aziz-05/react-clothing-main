'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** True only after hydration; guards UI that reads localStorage-backed stores. */
export function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
