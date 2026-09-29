'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { BagItem } from '@/lib/types';

type BagState = {
  items: BagItem[];
  promoCode: string | null;
  open: boolean;
  add: (item: Omit<BagItem, 'key' | 'quantity'> & { quantity?: number }) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setPromo: (code: string | null) => void;
  setOpen: (open: boolean) => void;
};

const keyOf = (productId: string, size?: string) => `${productId}:${size ?? ''}`;

export const useBag = create<BagState>()(
  persist(
    (set) => ({
      items: [],
      promoCode: null,
      open: false,
      add: ({ quantity = 1, ...item }) =>
        set((s) => {
          const key = keyOf(item.productId, item.size);
          const found = s.items.find((i) => i.key === key);
          const items = found
            ? s.items.map((i) => (i.key === key ? { ...i, quantity: Math.min(10, i.quantity + quantity) } : i))
            : [...s.items, { ...item, key, quantity }];
          return { items, open: true };
        }),
      setQuantity: (key, quantity) =>
        set((s) => ({
          items: quantity <= 0 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => (i.key === key ? { ...i, quantity: Math.min(10, quantity) } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [], promoCode: null }),
      setPromo: (promoCode) => set({ promoCode }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: 'threadline-bag',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items, promoCode: s.promoCode }),
    }
  )
);

export const bagCount = (items: BagItem[]) => items.reduce((n, i) => n + i.quantity, 0);

type WishlistState = { ids: string[]; toggle: (id: string) => boolean };

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const has = get().ids.includes(id);
        set({ ids: has ? get().ids.filter((x) => x !== id) : [id, ...get().ids] });
        return !has;
      },
    }),
    { name: 'threadline-wishlist', storage: createJSONStorage(() => localStorage) }
  )
);
