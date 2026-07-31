import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-ink-400">
      <Link href="/" className="transition hover:text-gold-600">Home</Link>
      {items.map((item, i) => (
        <span key={item.href || item.label} className="flex items-center gap-1.5">
          <ChevronRight size={13} className="text-ink-300" />
          {item.href && i < items.length - 1 ? (
            <Link href={item.href} className="transition hover:text-gold-600">{item.label}</Link>
          ) : (
            <span className="font-medium text-ink-600">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
