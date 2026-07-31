import { TrendingDown, TrendingUp } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, delta, tone = 'gold', hint }) {
  const tones = {
    gold: 'bg-gold-50 text-gold-600',
    green: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    rose: 'bg-rose-50 text-rose-600'
  };
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${tones[tone]}`}><Icon size={19} /></span>
        {delta != null && (
          <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${
            delta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>
            {delta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-ink-400">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-semibold">{value}</p>
      {hint && <p className="mt-1 text-[11px] text-ink-400">{hint}</p>}
    </div>
  );
}
