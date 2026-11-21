export const FIELD_TYPES = ['short_text', 'long_text', 'number', 'select', 'radio', 'checkbox'] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  short_text: 'Short text',
  long_text: 'Long text',
  number: 'Number',
  select: 'Dropdown',
  radio: 'Single choice',
  checkbox: 'Checkboxes',
};

export const isChoiceType = (t: FieldType) => t === 'select' || t === 'radio' || t === 'checkbox';

export type AnswerValue = string | number | string[];

export interface FormField {
  id: string;
  label: string;
  field_type: FieldType;
  options: string[];
  is_required: boolean;
  position: number;
}

export interface Form {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
}

export interface FormSummary extends Form {
  field_count: number;
  response_count: number;
}

export interface FormWithFields extends Form {
  form_fields: FormField[];
}

export interface Submission {
  id: string;
  submitted_at: string;
  answers: Record<string, AnswerValue>;
}

export interface SubmissionsResponse {
  form: Form;
  fields: FormField[];
  submissions: Submission[];
}

export interface Health {
  status: string;
  db: 'connected' | 'error';
  version: string;
  commit: string;
  timestamp: string;
}

export interface NewField {
  key: string;
  label: string;
  field_type: FieldType;
  options: string[];
  is_required: boolean;
}
