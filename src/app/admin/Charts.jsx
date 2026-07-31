'use client';

import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { money } from '@/lib/format';

const GOLDS = ['#C69A3C', '#D3AF5A', '#E0C687', '#AC7F2C', '#8A6323', '#33413A', '#584F46', '#EDDCB4'];

export default function Charts({ stats }) {
  const statusData = Object.entries(stats.statusCounts || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <section className="rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="font-semibold">Revenue by month</h2>
        <p className="text-xs text-ink-400">Excludes cancelled orders</p>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.revenueByMonth} margin={{ top: 5, right: 5, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C69A3C" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#C69A3C" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#7C746A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7C746A' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} />
              <Tooltip formatter={(v) => money(v, { decimals: false })}
                contentStyle={{ borderRadius: 12, border: '1px solid #E8E5E0', fontSize: 12 }} />
              <Area type="monotone" dataKey="total" stroke="#C69A3C" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="font-semibold">Orders by status</h2>
        <p className="text-xs text-ink-400">All time</p>
        <div className="mt-2 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={3}>
                {statusData.map((entry, i) => <Cell key={entry.name} fill={GOLDS[i % GOLDS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8E5E0', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="grid grid-cols-2 gap-1.5 text-[11px]">
          {statusData.map((s, i) => (
            <li key={s.name} className="flex items-center gap-1.5 capitalize text-ink-500">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: GOLDS[i % GOLDS.length] }} />
              {s.name} ({s.value})
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-soft lg:col-span-2">
        <h2 className="font-semibold">Products per category</h2>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.byCategory} margin={{ top: 5, right: 5, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E5E0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7C746A', textTransform: 'capitalize' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7C746A' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: '#FBF7EE' }} contentStyle={{ borderRadius: 12, border: '1px solid #E8E5E0', fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {stats.byCategory.map((c, i) => <Cell key={c.name} fill={GOLDS[i % GOLDS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
