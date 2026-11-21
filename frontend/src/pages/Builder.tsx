import { Loader2, Plus, Save } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FieldEditor from '../components/FieldEditor';
import { Button, ErrorBanner } from '../components/ui';
import { api } from '../lib/api';
import { isChoiceType, type NewField } from '../lib/types';

let keySeq = 0;
const newField = (): NewField => ({ key: `f${++keySeq}`, label: '', field_type: 'short_text', options: [], is_required: false });

function validate(title: string, fields: NewField[]): string {
  if (!title.trim()) return 'Give your form a title.';
  const i = fields.findIndex((f) => !f.label.trim());
  if (i >= 0) return `Field ${i + 1} needs a label.`;
  const j = fields.findIndex((f) => isChoiceType(f.field_type) && !f.options.some((o) => o.trim()));
  if (j >= 0) return `Field ${j + 1} needs at least one option.`;
  return '';
}

export default function Builder() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<NewField[]>(() => [newField()]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (key: string, patch: Partial<NewField>) =>
    setFields((fs) => fs.map((f) => (f.key === key ? { ...f, ...patch } : f)));

  const move = (index: number, dir: -1 | 1) =>
    setFields((fs) => {
      const next = [...fs];
      [next[index], next[index + dir]] = [next[index + dir], next[index]];
      return next;
    });

  const save = async () => {
    const problem = validate(title, fields);
    if (problem) return setError(problem);
    setError('');
    setSaving(true);
    try {
      const payload = fields.map((f) => (isChoiceType(f.field_type) ? f : { ...f, options: [] }));
      await api.createForm({ title, description, fields: payload });
      navigate('/');
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">New form</h1>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save form
        </Button>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="card space-y-3 border-t-4 border-t-indigo-600 p-5">
        <input
          className="w-full border-0 bg-transparent p-0 text-xl font-semibold outline-none placeholder:text-slate-300"
          placeholder="Untitled form"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Form title"
        />
        <textarea
          className="input resize-none"
          rows={2}
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          aria-label="Form description"
        />
      </div>

      <div className="space-y-3">
        {fields.map((f, i) => (
          <FieldEditor
            key={f.key}
            field={f}
            index={i}
            count={fields.length}
            onChange={(patch) => update(f.key, patch)}
            onMove={(dir) => move(i, dir)}
            onRemove={() => setFields((fs) => fs.filter((x) => x.key !== f.key))}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setFields((fs) => [...fs, newField()])}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-4 text-sm font-medium text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600"
      >
        <Plus className="h-4 w-4" /> Add field
      </button>
    </div>
  );
}
