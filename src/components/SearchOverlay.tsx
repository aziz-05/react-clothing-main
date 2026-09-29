'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import { gql } from '@/graphql/client';

const POPULAR = ['dress', 'watch', 'sneakers', 'bag', 'shirt', 'sunglasses'];

type Hit = { id: string; slug: string; title: string; brand: string; thumbnail: string; price: { formatted: string } };

export default function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 200);
    return () => clearTimeout(t);
  }, [q]);

  const { data, isFetching } = useQuery({
    queryKey: ['search', debounced],
    queryFn: ({ signal }) =>
      gql<{ search: Hit[] }>(
        `query Search($q: String!) { search(query: $q, first: 6) { id slug title brand thumbnail price { formatted } } }`,
        { q: debounced },
        signal
      ).then((d) => d.search),
    enabled: debounced.length >= 2,
  });

  const go = (term: string) => {
    router.push(`/shop?q=${encodeURIComponent(term)}`);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 bg-cream/97 backdrop-blur-sm animate-fade-in' role='dialog' aria-modal='true' aria-label='Search'>
      <div className='wrap max-w-3xl pt-20'>
        <button onClick={onClose} className='absolute right-6 top-6 p-2 hover:text-clay' aria-label='Close search'>
          <X size={26} />
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) go(q.trim());
          }}
          className='flex items-center gap-4 border-b-2 border-ink pb-3'
        >
          <Search size={26} strokeWidth={1.5} />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Search dresses, watches, brands…'
            aria-label='Search products'
            className='w-full bg-transparent font-serif text-3xl font-light outline-none placeholder:text-stone/50 sm:text-4xl'
          />
          {isFetching && <Loader2 className='animate-spin text-stone' />}
        </form>

        {debounced.length < 2 ? (
          <div className='mt-10'>
            <p className='eyebrow mb-4'>Popular searches</p>
            <div className='flex flex-wrap gap-2'>
              {POPULAR.map((p) => (
                <button key={p} onClick={() => setQ(p)} className='border border-ink/20 px-4 py-2 text-sm capitalize hover:border-ink'>
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : data && data.length === 0 ? (
          <p className='mt-10 text-stone'>No results for “{debounced}”. Try another word.</p>
        ) : (
          <ul className='mt-8 grid gap-4 sm:grid-cols-2'>
            {data?.map((h) => (
              <li key={h.id} className='animate-rise'>
                <Link href={`/product/${h.slug}`} onClick={onClose} className='group flex items-center gap-4'>
                  <span className='relative h-20 w-16 shrink-0 overflow-hidden bg-sand'>
                    <Image src={h.thumbnail} alt='' fill sizes='64px' className='object-cover transition group-hover:scale-105' />
                  </span>
                  <span className='min-w-0'>
                    <span className='eyebrow block'>{h.brand}</span>
                    <span className='block truncate font-medium group-hover:text-clay'>{h.title}</span>
                    <span className='text-sm text-stone'>{h.price.formatted}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {debounced.length >= 2 && !!data?.length && (
          <button onClick={() => go(debounced)} className='mt-8 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 hover:text-clay'>
            See all results <ArrowRight size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
