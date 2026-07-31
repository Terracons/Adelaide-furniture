import { STATUS_STYLES } from '@/lib/format';

export default function Badge({ children, tone, className = '' }) {
  const style = STATUS_STYLES[tone] || 'bg-gold-100 text-gold-800';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${style} ${className}`}>
      {children}
    </span>
  );
}
