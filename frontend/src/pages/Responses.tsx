import { ArrowLeft, CalendarClock, Download, ExternalLink, Inbox, ListChecks, Percent, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SummaryBar from '../components/SummaryBar';
import { Button, EmptyState, ErrorBanner, Spinner } from '../components/ui';
import { api, ApiError } from '../lib/api';
import { downloadCsv, formatAnswer, formatDate } from '../lib/format';
import type { SubmissionsResponse } from '../lib/types';
import NotFound from './NotFound';

export default function Responses() {
  const { id = '' } = useParams();
  const [data, setData] = useState<SubmissionsResponse | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    api.getSubmissions(id).then(setData).catch(setError);
  }, [id]);

  const completion = useMemo(() => {
    if (!data || !data.submissions.length || !data.fields.length) return 0;
    const answered = data.submissions.reduce((n, s) => n + Object.keys(s.answers).length, 0);
    return Math.round((answered / (data.submissions.length * data.fields.length)) * 100);
  }, [data]);

  if (error) return error.status === 404 || error.status === 400 ? <NotFound message="This form could not be found." /> : <ErrorBanner message={error.message} />;
  if (!data) return <Spinner />;

  const { form, fields, submissions } = data;
  const exportCsv = () => downloadCsv(`${form.slug}-responses.csv`, fields, submissions);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{form.title}</h1>
          <a href={`/f/${form.slug}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-indigo-600 hover:underline">
            /f/{form.slug} <ExternalLink className="h-3 w-3" />
          </a>
        </div>
        <Button variant="secondary" onClick={exportCsv} disabled={!submissions.length}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      <SummaryBar
        items={[
          { label: 'Responses', value: submissions.length, icon: <Users className="h-4 w-4" /> },
          { label: 'Fields', value: fields.length, icon: <ListChecks className="h-4 w-4" /> },
          { label: 'Completion', value: `${completion}%`, icon: <Percent className="h-4 w-4" /> },
          { label: 'Latest', value: submissions[0] ? formatDate(submissions[0].submitted_at) : '—', icon: <CalendarClock className="h-4 w-4" /> },
        ]}
      />

      {submissions.length === 0 ? (
        <EmptyState icon={<Inbox className="h-5 w-5" />} title="No responses yet">
          Share the public link to start collecting responses.
        </EmptyState>
      ) : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="whitespace-nowrap px-4 py-3">Submitted</th>
                {fields.map((f) => (
                  <th key={f.id} className="min-w-40 px-4 py-3">{f.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((s) => (
                <tr key={s.id} className="align-top hover:bg-slate-50/60">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDate(s.submitted_at)}</td>
                  {fields.map((f) => {
                    const text = formatAnswer(s.answers[f.id]);
                    return (
                      <td key={f.id} className="max-w-xs px-4 py-3 text-slate-800">
                        {text ? <span className="line-clamp-3" title={text}>{text}</span> : <span className="text-slate-300">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
