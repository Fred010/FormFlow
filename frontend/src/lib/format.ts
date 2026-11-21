import type { AnswerValue, FormField, Submission } from './types';

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export const formatAnswer = (v: AnswerValue | undefined) =>
  v === undefined || v === null ? '' : Array.isArray(v) ? v.join(', ') : String(v);

export const shareUrl = (slug: string) => `${window.location.origin}/f/${slug}`;

const csvCell = (s: string) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

export function downloadCsv(filename: string, fields: FormField[], submissions: Submission[]) {
  const header = ['Submitted at', ...fields.map((f) => f.label)];
  const rows = submissions.map((s) => [
    new Date(s.submitted_at).toISOString(),
    ...fields.map((f) => {
      const v = s.answers[f.id];
      return Array.isArray(v) ? v.join('; ') : formatAnswer(v);
    }),
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  URL.revokeObjectURL(url);
}
