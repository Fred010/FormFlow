import { CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import FieldInput from '../components/FieldInput';
import { Button, ErrorBanner, Spinner } from '../components/ui';
import { api, ApiError } from '../lib/api';
import type { AnswerValue, FormField, FormWithFields } from '../lib/types';
import NotFound from './NotFound';

const isBlank = (v: AnswerValue | undefined) =>
  v === undefined || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && v.length === 0);

function validate(fields: FormField[], answers: Record<string, AnswerValue>) {
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const v = answers[f.id];
    if (isBlank(v)) {
      if (f.is_required) errors[f.id] = 'This field is required.';
    } else if (f.field_type === 'number' && !Number.isFinite(Number(v))) {
      errors[f.id] = 'Please enter a valid number.';
    }
  }
  return errors;
}

export default function PublicForm() {
  const { slug = '' } = useParams();
  const [form, setForm] = useState<FormWithFields | null>(null);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');

  useEffect(() => {
    api.getForm(slug).then((f) => {
      setForm(f);
      document.title = `${f.title} · FormFlow`;
    }).catch(setLoadError);
  }, [slug]);

  if (loadError) return loadError.status === 404 ? <NotFound message="This form doesn't exist or is no longer accepting responses." /> : <ErrorBanner message={loadError.message} />;
  if (!form) return <Spinner />;

  const setAnswer = (id: string, v: AnswerValue) => {
    setAnswers((a) => ({ ...a, [id]: v }));
    if (errors[id]) setErrors(({ [id]: _removed, ...rest }) => rest);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form.form_fields, answers);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`field-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus('submitting');
    setSubmitError('');
    const payload = Object.fromEntries(
      form.form_fields
        .filter((f) => !isBlank(answers[f.id]))
        .map((f) => [f.id, f.field_type === 'number' ? Number(answers[f.id]) : answers[f.id]]),
    );
    try {
      await api.submit(slug, payload);
      setStatus('done');
    } catch (err) {
      if (err instanceof ApiError && err.details) setErrors(err.details);
      setSubmitError((err as Error).message);
      setStatus('idle');
    }
  };

  if (status === 'done') {
    return (
      <div className="card flex flex-col items-center px-6 py-16 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <h1 className="mt-4 text-xl font-semibold">Thanks for your response!</h1>
        <p className="mt-1 text-sm text-slate-500">Your answers to “{form.title}” have been recorded.</p>
        <Button variant="secondary" className="mt-6" onClick={() => { setAnswers({}); setStatus('idle'); }}>
          Submit another response
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="card border-t-4 border-t-indigo-600 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">{form.title}</h1>
        {form.description && <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{form.description}</p>}
        {form.form_fields.some((f) => f.is_required) && <p className="mt-3 text-xs text-red-500">* Required</p>}
      </div>
      {form.form_fields.map((f) => (
        <div key={f.id} className="card p-5">
          <FieldInput field={f} value={answers[f.id]} error={errors[f.id]} onChange={(v) => setAnswer(f.id, v)} />
        </div>
      ))}
      {submitError && <ErrorBanner message={submitError} />}
      <div className="flex justify-end">
        <Button type="submit" disabled={status === 'submitting'} className="px-6">
          {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />} Submit
        </Button>
      </div>
    </form>
  );
}
