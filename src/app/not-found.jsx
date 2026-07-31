import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <section className="container flex min-h-[70vh] flex-col items-center justify-center gap-5 py-20 text-center">
      <p className="font-display text-[100px] font-semibold leading-none text-gold-500 md:text-[140px]">404</p>
      <h1 className="text-2xl font-semibold md:text-3xl">We could not find that page</h1>
      <p className="max-w-md text-sm leading-relaxed text-ink-500">
        The link may be out of date, or the piece may have sold out and been retired from the
        catalogue. Try the shop, or search for what you were after.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary"><Home size={15} /> Back home</Link>
        <Link href="/shop/" className="btn-outline"><Search size={15} /> Browse the shop</Link>
      </div>
    </section>
  );
}
