import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Health } from '../lib/types';

const FRONTEND_VERSION = import.meta.env.VITE_APP_VERSION || 'dev';

export default function Footer() {
  const [health, setHealth] = useState<Health | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const load = () =>
      api
        .health()
        .then((h) => active && (setHealth(h), setFailed(false)))
        .catch(() => active && setFailed(true));
    load();
    const timer = setInterval(load, 30_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const ok = health && !failed && health.db === 'connected';
  const dot = !health && !failed ? 'bg-slate-300' : ok ? 'bg-emerald-500' : 'bg-amber-500';
  const backend = failed ? 'unreachable' : health ? `v${health.version} (${health.commit})` : '…';
  const title = failed ? 'Backend unreachable' : health ? `API ok · DB ${health.db}` : 'Checking status';

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-xs text-slate-500 sm:px-6">
        <span>© FormFlow</span>
        <span className="flex items-center gap-2 font-mono" title={title}>
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          Frontend: v{FRONTEND_VERSION} | Backend: {backend}
        </span>
      </div>
    </footer>
  );
}
