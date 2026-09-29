'use client';

import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { gql } from '@/graphql/client';

export default function Newsletter({ dark }: { dark?: boolean }) {
  const [email, setEmail] = useState('');
  const m = useMutation({
    mutationFn: (email: string) =>
      gql<{ subscribeNewsletter: { ok: boolean; message: string } }>(
        `mutation Sub($email: String!) { subscribeNewsletter(email: $email) { ok message } }`,
        { email }
      ).then((d) => d.subscribeNewsletter),
  });

  if (m.data?.ok) return <p className={dark ? 'text-cream' : 'text-moss'}>{m.data.message}</p>;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        m.mutate(email);
      }}
      className='w-full max-w-md'
    >
      <div className={`flex border-b ${dark ? 'border-cream/40' : 'border-ink'}`}>
        <input
          type='email'
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder='Your email address'
          aria-label='Email address'
          className='h-12 w-full bg-transparent outline-none placeholder:opacity-60'
        />
        <button aria-label='Subscribe' className='px-2 hover:text-clay' disabled={m.isPending}>
          {m.isPending ? <Loader2 className='animate-spin' size={20} /> : <ArrowRight size={20} />}
        </button>
      </div>
      {m.data && !m.data.ok && <p className='mt-2 text-sm text-clay'>{m.data.message}</p>}
    </form>
  );
}
