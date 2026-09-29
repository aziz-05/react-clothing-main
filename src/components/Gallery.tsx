'use client';

import Image from 'next/image';
import { useState } from 'react';
import clsx from 'clsx';

/** Product gallery with thumbnails and hover-to-zoom on the main image. */
export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className='flex flex-col-reverse gap-3 md:flex-row'>
      {images.length > 1 && (
        <div className='flex gap-3 md:flex-col'>
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={clsx('relative h-24 w-18 shrink-0 overflow-hidden bg-sand transition', i === active ? 'ring-1 ring-ink' : 'opacity-60 hover:opacity-100')}
            >
              <Image src={src} alt='' fill sizes='72px' className='object-cover' />
            </button>
          ))}
        </div>
      )}
      <div
        className='relative aspect-[3/4] flex-1 cursor-zoom-in overflow-hidden bg-sand'
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        <Image
          key={images[active]}
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes='(max-width: 768px) 100vw, 50vw'
          className='object-cover transition-transform duration-200 animate-fade-in'
          style={zoom ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
        />
      </div>
    </div>
  );
}
