import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { FIELD_TYPE_LABELS, FIELD_TYPES, isChoiceType, type FieldType, type NewField } from '../lib/types';
import { Button } from './ui';

interface Props {
  field: NewField;
  index: number;
  count: number;
  onChange: (patch: Partial<NewField>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}

export default function FieldEditor({ field, index, count, onChange, onMove, onRemove }: Props) {
  const choice = isChoiceType(field.field_type);
  const setOption = (i: number, v: string) => onChange({ options: field.options.map((o, j) => (j === i ? v : o)) });

  const changeType = (t: FieldType) =>
    onChange({ field_type: t, options: isChoiceType(t) && field.options.length === 0 ? ['Option 1', 'Option 2'] : field.options });

  return (
    <div className="card p-4">
      <div className="flex items-start gap-3">
        <span className="mt-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500">
          {index + 1}
        </span>
        <div className="flex-1 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              className="input flex-1"
              placeholder="Question label"
              value={field.label}
              onChange={(e) => onChange({ label: e.target.value })}
              aria-label={`Field ${index + 1} label`}
            />
            <select
              className="input sm:w-44"
              value={field.field_type}
              onChange={(e) => changeType(e.target.value as FieldType)}
              aria-label={`Field ${index + 1} type`}
            >
              {FIELD_TYPES.map((t) => <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>)}
            </select>
          </div>

          {choice && (
            <div className="space-y-2 rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Options</p>
              {field.options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className="input py-1.5" value={o} onChange={(e) => setOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`} aria-label={`Field ${index + 1} option ${i + 1}`} />
                  <button type="button" className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30"
                    disabled={field.options.length <= 1} aria-label="Remove option"
                    onClick={() => onChange({ options: field.options.filter((_, j) => j !== i) })}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                onClick={() => onChange({ options: [...field.options, `Option ${field.options.length + 1}`] })}>
                <Plus className="h-3.5 w-3.5" /> Add option
              </button>
            </div>
          )}

          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" className="h-4 w-4 accent-indigo-600" checked={field.is_required}
              onChange={(e) => onChange({ is_required: e.target.checked })} />
            Required
          </label>
        </div>
        <div className="flex flex-col gap-1">
          <Button variant="ghost" className="px-2" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up"><ArrowUp className="h-4 w-4" /></Button>
          <Button variant="ghost" className="px-2" disabled={index === count - 1} onClick={() => onMove(1)} aria-label="Move down"><ArrowDown className="h-4 w-4" /></Button>
          <Button variant="danger" className="px-2" disabled={count === 1} onClick={onRemove} aria-label="Remove field"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}
