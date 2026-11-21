import { CHOICE_TYPES, FIELD_TYPES, HttpError, type AnswerValue, type FieldType, type FormField } from './types.js';

export interface FieldInput {
  label: string;
  field_type: FieldType;
  options: string[];
  is_required: boolean;
}

export interface FormInput {
  title: string;
  description: string | null;
  is_published: boolean;
  fields: FieldInput[];
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseFormInput(body: unknown): FormInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const title = typeof b.title === 'string' ? b.title.trim() : '';
  if (!title) throw new HttpError(400, 'Title is required');
  if (!Array.isArray(b.fields) || b.fields.length === 0) throw new HttpError(400, 'At least one field is required');

  const fields = b.fields.map((raw, i): FieldInput => {
    const f = (raw ?? {}) as Record<string, unknown>;
    const label = typeof f.label === 'string' ? f.label.trim() : '';
    if (!label) throw new HttpError(400, `Field ${i + 1}: label is required`);
    const fieldType = f.field_type as FieldType;
    if (!FIELD_TYPES.includes(fieldType)) throw new HttpError(400, `Field ${i + 1}: invalid field_type`);
    let options: string[] = [];
    if (CHOICE_TYPES.includes(fieldType)) {
      const rawOpts = Array.isArray(f.options) ? f.options : [];
      options = [...new Set(rawOpts.filter((o): o is string => typeof o === 'string').map((o) => o.trim()).filter(Boolean))];
      if (options.length === 0) throw new HttpError(400, `Field ${i + 1}: choice fields need at least one option`);
    }
    return { label, field_type: fieldType, options, is_required: f.is_required === true };
  });

  const description = typeof b.description === 'string' && b.description.trim() ? b.description.trim() : null;
  return { title, description, is_published: b.is_published !== false, fields };
}

function isEmpty(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);
}

function normalize(field: FormField, v: unknown): AnswerValue {
  switch (field.field_type) {
    case 'short_text':
    case 'long_text':
      if (typeof v !== 'string') throw new Error('must be text');
      return v.trim();
    case 'number': {
      const n = typeof v === 'number' ? v : Number(v);
      if (!Number.isFinite(n)) throw new Error('must be a number');
      return n;
    }
    case 'select':
    case 'radio':
      if (typeof v !== 'string' || !field.options.includes(v)) throw new Error('must be one of the options');
      return v;
    case 'checkbox':
      if (!Array.isArray(v) || !v.every((x) => typeof x === 'string' && field.options.includes(x))) {
        throw new Error('must be a list of valid options');
      }
      return [...new Set(v as string[])];
  }
}

export function validateAnswers(fields: FormField[], body: unknown): Map<string, AnswerValue> {
  const raw = ((body as Record<string, unknown>)?.answers ?? {}) as Record<string, unknown>;
  if (typeof raw !== 'object' || Array.isArray(raw)) throw new HttpError(400, 'answers must be an object keyed by field_id');

  const errors: Record<string, string> = {};
  const answers = new Map<string, AnswerValue>();
  for (const field of fields) {
    const v = raw[field.id];
    if (isEmpty(v)) {
      if (field.is_required) errors[field.id] = `${field.label} is required`;
      continue;
    }
    try {
      answers.set(field.id, normalize(field, v));
    } catch (e) {
      errors[field.id] = `${field.label} ${(e as Error).message}`;
    }
  }
  if (Object.keys(errors).length) throw new HttpError(422, 'Validation failed', errors);
  return answers;
}
