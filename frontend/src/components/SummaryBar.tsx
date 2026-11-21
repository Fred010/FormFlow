import type { ReactNode } from 'react';

export default function SummaryBar({ items }: { items: { label: string; value: ReactNode; icon: ReactNode }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((it) => (
        <div key={it.label} className="card flex items-center gap-3 p-4">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">{it.icon}</div>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{it.label}</p>
            <p className="truncate text-lg font-semibold text-slate-900">{it.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
