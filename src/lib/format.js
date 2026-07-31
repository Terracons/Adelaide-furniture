export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

/** 2450 -> "$2,450"   2450.5 -> "$2,450.50" */
export function money(value, { decimals } = {}) {
  const n = Number(value || 0);
  const showDecimals = decimals ?? (n % 1 !== 0);
  return (
    CURRENCY +
    n.toLocaleString('en-AU', {
      minimumFractionDigits: showDecimals ? 2 : 0,
      maximumFractionDigits: 2
    })
  );
}

export function percentOff(price, comparePrice) {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

export function formatDate(input, style = 'medium') {
  if (!input) return '';
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  if (style === 'short') return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
  if (style === 'long')
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function relativeDate(input) {
  const d = new Date(input);
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function slugify(text = '') {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function truncate(text = '', max = 120) {
  const clean = String(text).replace(/<[^>]*>/g, '');
  return clean.length > max ? clean.slice(0, max).trimEnd() + '...' : clean;
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

export const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped:    'bg-indigo-100 text-indigo-800',
  delivered:  'bg-emerald-100 text-emerald-800',
  cancelled:  'bg-rose-100 text-rose-800',
  paid:       'bg-emerald-100 text-emerald-800',
  refunded:   'bg-rose-100 text-rose-800',
  failed:     'bg-rose-100 text-rose-800',
  approved:   'bg-emerald-100 text-emerald-800',
  rejected:   'bg-rose-100 text-rose-800',
  published:  'bg-emerald-100 text-emerald-800',
  draft:      'bg-ink-100 text-ink-600',
  archived:   'bg-ink-100 text-ink-600',
  active:     'bg-emerald-100 text-emerald-800',
  blocked:    'bg-rose-100 text-rose-800'
};
