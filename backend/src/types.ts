export const FIELD_TYPES = ['short_text', 'long_text', 'number', 'select', 'radio', 'checkbox'] as const;
export type FieldType = (typeof FIELD_TYPES)[number];
export const CHOICE_TYPES: FieldType[] = ['select', 'radio', 'checkbox'];

export interface FormField {
  id: string;
  label: string;
  field_type: FieldType;
  options: string[];
  is_required: boolean;
  position: number;
}

export type AnswerValue = string | number | string[];

export class HttpError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}
