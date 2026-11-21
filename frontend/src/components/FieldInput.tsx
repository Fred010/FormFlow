import type { AnswerValue, FormField } from '../lib/types';

interface Props {
  field: FormField;
  value: AnswerValue | undefined;
  error?: string;
  onChange: (v: AnswerValue) => void;
}

export default function FieldInput({ field, value, error, onChange }: Props) {
  const id = `field-${field.id}`;
  const errCls = error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : '';

  const control = (() => {
    switch (field.field_type) {
      case 'short_text':
        return <input id={id} className={`input ${errCls}`} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} />;
      case 'long_text':
        return <textarea id={id} rows={4} className={`input ${errCls}`} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)} />;
      case 'number':
        return (
          <input id={id} type="number" inputMode="decimal" className={`input ${errCls}`}
            value={value === undefined ? '' : String(value)} onChange={(e) => onChange(e.target.value)} />
        );
      case 'select':
        return (
          <select id={id} className={`input ${errCls}`} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)}>
            <option value="">Select an option…</option>
            {field.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        );
      case 'radio':
      case 'checkbox': {
        const multi = field.field_type === 'checkbox';
        const selected = multi ? ((value as string[]) ?? []) : [];
        return (
          <div className="space-y-2">
            {field.options.map((o) => {
              const checked = multi ? selected.includes(o) : value === o;
              return (
                <label key={o} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition ${checked ? 'border-indigo-500 bg-indigo-50/60' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input
                    type={multi ? 'checkbox' : 'radio'}
                    name={id}
                    className="h-4 w-4 accent-indigo-600"
                    checked={checked}
                    onChange={() => onChange(multi ? (checked ? selected.filter((s) => s !== o) : [...selected, o]) : o)}
                  />
                  {o}
                </label>
              );
            })}
          </div>
        );
      }
    }
  })();

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-800">
        {field.label}
        {field.is_required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {control}
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
