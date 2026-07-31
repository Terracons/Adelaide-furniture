'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import Img from '@/components/ui/Img';

export default function Gallery({ images = [], alt }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const list = images.length ? images : ['/images/products/sena-ribbed-vase-1.svg'];

  const go = (dir) => setActive((i) => (i + dir + list.length) % list.length);

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-3 overflow-x-auto no-scrollbar sm:flex-col sm:overflow-visible">
        {list.map((src, i) => (
          <button key={src + i} onClick={() => setActive(i)} aria-label={`View image ${i + 1}`}
            className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-cream-dark ring-2 transition ${
              i === active ? 'ring-gold-500' : 'ring-transparent hover:ring-gold-200'
            }`}>
            <Img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      <div className="relative flex-1 overflow-hidden rounded-2xl bg-cream-dark">
        <Img src={list[active]} alt={alt} loading="eager"
          className={`aspect-square w-full object-cover transition-transform duration-500 ${zoom ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`}
          onClick={() => setZoom(!zoom)} />

        <button onClick={() => setZoom(!zoom)} aria-label="Toggle zoom"
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-soft transition hover:bg-gold-500 hover:text-white">
          <Expand size={15} />
        </button>

        {list.length > 1 && (
          <>
            <button onClick={() => go(-1)} aria-label="Previous image"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-soft transition hover:bg-gold-500 hover:text-white">
              <ChevronLeft size={17} />
            </button>
            <button onClick={() => go(1)} aria-label="Next image"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-soft transition hover:bg-gold-500 hover:text-white">
              <ChevronRight size={17} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {list.map((s, i) => (
                <button key={i} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-gold-500' : 'w-1.5 bg-white/80'}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
