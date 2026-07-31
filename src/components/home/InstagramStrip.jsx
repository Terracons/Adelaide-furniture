import Img from '@/components/ui/Img';
import { Instagram } from 'lucide-react';

const SHOTS = [
  '/images/products/adelaide-deep-seat-sofa-2.svg',
  '/images/products/aurea-brass-pendant-3.svg',
  '/images/products/ravello-oak-dining-table-2.svg',
  '/images/products/elna-curved-armchair-4.svg',
  '/images/products/halo-arch-mirror-2.svg',
  '/images/products/tessa-handknotted-rug-3.svg'
];

export default function InstagramStrip() {
  return (
    <section className="border-y border-ink-100 bg-white py-14">
      <div className="container">
        <div className="mb-7 flex flex-col items-center gap-2 text-center">
          <span className="eyebrow"><Instagram size={13} /> @adelaidefurniture</span>
          <h2 className="text-2xl font-semibold md:text-3xl">In your homes</h2>
        </div>
        <div className="grid grid-cols-3 gap-2.5 md:grid-cols-6">
          {SHOTS.map((src, i) => (
            <a key={src} href="https://instagram.com" target="_blank" rel="noreferrer noopener"
              className="group relative aspect-square overflow-hidden rounded-xl bg-cream-dark">
              <Img src={src} alt={`Customer photo ${i + 1}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 grid place-items-center bg-ink/50 opacity-0 transition group-hover:opacity-100">
                <Instagram size={20} className="text-cream" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
