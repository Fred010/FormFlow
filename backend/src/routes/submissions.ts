import { Router } from 'express';
import { pool, withTransaction } from '../db.js';
import { HttpError } from '../types.js';
import { UUID_RE, validateAnswers } from '../validation.js';
import { getFormWithFields } from './forms.js';

export const submissionsRouter = Router();

submissionsRouter.post('/forms/:slug/submissions', async (req, res) => {
  const form = await getFormWithFields('slug', req.params.slug);
  if (!form.is_published) throw new HttpError(404, 'Form not found');
  const answers = validateAnswers(form.form_fields, req.body);

  const submission = await withTransaction(async (client) => {
    const s = await client.query(
      'INSERT INTO submissions (form_id) VALUES ($1) RETURNING id, form_id, submitted_at',
      [form.id],
    );
    const row = s.rows[0];
    for (const [fieldId, value] of answers) {
      await client.query(
        'INSERT INTO submission_answers (submission_id, field_id, value) VALUES ($1, $2, $3::jsonb)',
        [row.id, fieldId, JSON.stringify(value)],
      );
    }
    return row;
  });
  res.status(201).json(submission);
});

submissionsRouter.get('/forms/:id/submissions', async (req, res) => {
  if (!UUID_RE.test(req.params.id)) throw new HttpError(400, 'Invalid form id');
  const { form_fields, ...form } = await getFormWithFields('id', req.params.id);
  const { rows } = await pool.query(
    `SELECT s.id, s.submitted_at,
            COALESCE(jsonb_object_agg(a.field_id, a.value) FILTER (WHERE a.field_id IS NOT NULL), '{}'::jsonb) AS answers
       FROM submissions s
       LEFT JOIN submission_answers a ON a.submission_id = s.id
      WHERE s.form_id = $1
      GROUP BY s.id
      ORDER BY s.submitted_at DESC`,
    [form.id],
  );
  res.json({ form, fields: form_fields, submissions: rows });
});
