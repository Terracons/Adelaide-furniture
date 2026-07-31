import Link from 'next/link';

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, children }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-ink-200 bg-white/60 px-6 py-16 text-center">
      {Icon && (
        <div className="grid h-16 w-16 place-items-center rounded-full bg-gold-50 text-gold-500">
          <Icon size={26} />
        </div>
      )}
      <div className="space-y-1.5">
        <h3 className="text-xl font-semibold text-ink">{title}</h3>
        {description && <p className="mx-auto max-w-sm text-sm leading-relaxed text-ink-400">{description}</p>}
      </div>
      {actionHref && (
        <Link href={actionHref} className="btn-primary btn-sm mt-1">{actionLabel}</Link>
      )}
      {children}
    </div>
  );
}
