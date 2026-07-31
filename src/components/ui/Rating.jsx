import { Star } from 'lucide-react';

export default function Rating({ value = 0, count, size = 14, className = '', showValue = false }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= rounded ? 'fill-gold-500 text-gold-500' : 'fill-ink-100 text-ink-200'}
          />
        ))}
      </div>
      {showValue && <span className="text-xs font-semibold text-ink-600">{Number(value).toFixed(1)}</span>}
      {count != null && <span className="text-xs text-ink-400">({count})</span>}
    </div>
  );
}
