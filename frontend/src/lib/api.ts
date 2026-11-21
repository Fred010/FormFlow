import type { AnswerValue, FormSummary, FormWithFields, Health, NewField, SubmissionsResponse } from './types';

const BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: Record<string, string>) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error || `Request failed (${res.status})`, body.details);
  return body as T;
}

export const api = {
  health: () => request<Health>('/health'),
  listForms: () => request<FormSummary[]>('/forms'),
  getForm: (slug: string) => request<FormWithFields>(`/forms/${encodeURIComponent(slug)}`),
  createForm: (data: { title: string; description: string; fields: NewField[] }) =>
    request<FormWithFields>('/forms', {
      method: 'POST',
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        fields: data.fields.map(({ key: _key, ...f }) => f),
      }),
    }),
  deleteForm: (id: string) => request<void>(`/forms/${id}`, { method: 'DELETE' }),
  submit: (slug: string, answers: Record<string, AnswerValue>) =>
    request<{ id: string }>(`/forms/${encodeURIComponent(slug)}/submissions`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
  getSubmissions: (id: string) => request<SubmissionsResponse>(`/forms/${id}/submissions`),
};
