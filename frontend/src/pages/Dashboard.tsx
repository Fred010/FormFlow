import { BarChart3, Check, Copy, ExternalLink, FileText, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, EmptyState, ErrorBanner, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { formatDate, shareUrl } from '../lib/format';
import type { FormSummary } from '../lib/types';

export default function Dashboard() {
  const [forms, setForms] = useState<FormSummary[] | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    api.listForms().then(setForms).catch((e) => setError(e.message));
  }, []);

  const copy = async (slug: string) => {
    const url = shareUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy this link:', url);
      return;
    }
    setCopied(slug);
    setTimeout(() => setCopied((c) => (c === slug ? '' : c)), 1500);
  };

  const remove = async (form: FormSummary) => {
    if (!confirm(`Delete "${form.title}" and all ${form.response_count} responses? This cannot be undone.`)) return;
    try {
      await api.deleteForm(form.id);
      setForms((fs) => fs?.filter((f) => f.id !== form.id) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const total = forms?.reduce((n, f) => n + f.response_count, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your forms</h1>
          {forms && (
            <p className="mt-1 text-sm text-slate-500">
              {forms.length} {forms.length === 1 ? 'form' : 'forms'} · {total} total responses
            </p>
          )}
        </div>
        <Link to="/builder">
          <Button><Plus className="h-4 w-4" /> New Form</Button>
        </Link>
      </div>

      {error && <ErrorBanner message={error} />}
      {!forms && !error && <Spinner />}
      {forms?.length === 0 && (
        <EmptyState icon={<FileText className="h-5 w-5" />} title="No forms yet">
          Create your first form to start collecting responses.
        </EmptyState>
      )}

      {forms && forms.length > 0 && (
        <ul className="card divide-y divide-slate-100">
          {forms.map((f) => (
            <li key={f.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6">
              <div className="min-w-0 flex-1">
                <Link to={`/forms/${f.id}/responses`} className="font-medium text-slate-900 hover:text-indigo-600">
                  {f.title}
                </Link>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                  <span>{f.field_count} fields</span>
                  <span>Created {formatDate(f.created_at)}</span>
                  <span className="font-mono text-slate-400">/f/{f.slug}</span>
                </div>
              </div>
              <Link
                to={`/forms/${f.id}/responses`}
                className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
              >
                <BarChart3 className="h-3.5 w-3.5" /> {f.response_count} {f.response_count === 1 ? 'response' : 'responses'}
              </Link>
              <div className="flex items-center gap-1">
                <Button variant="ghost" onClick={() => copy(f.slug)} title="Copy public link">
                  {copied === f.slug ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span className="text-xs">{copied === f.slug ? 'Copied' : 'Copy link'}</span>
                </Button>
                <a href={`/f/${f.slug}`} target="_blank" rel="noreferrer" title="Open public form"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
                  <ExternalLink className="h-4 w-4" />
                </a>
                <Button variant="danger" onClick={() => remove(f)} title="Delete form" aria-label={`Delete ${f.title}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
