import { Router } from 'express';
import { pool, withTransaction } from '../db.js';
import { generateSlug } from '../slug.js';
import { HttpError } from '../types.js';
import { parseFormInput, UUID_RE } from '../validation.js';

export const formsRouter = Router();

const FORM_COLUMNS = 'f.id, f.slug, f.title, f.description, f.is_published, f.created_at';

export async function getFormWithFields(where: 'slug' | 'id', value: string) {
  const formRes = await pool.query(`SELECT ${FORM_COLUMNS} FROM forms f WHERE f.${where} = $1`, [value]);
  const form = formRes.rows[0];
  if (!form) throw new HttpError(404, 'Form not found');
  const fieldsRes = await pool.query(
    `SELECT id, label, field_type, options, is_required, position
       FROM form_fields WHERE form_id = $1 ORDER BY position ASC`,
    [form.id],
  );
  return { ...form, form_fields: fieldsRes.rows };
}

formsRouter.get('/forms', async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT ${FORM_COLUMNS},
            (SELECT COUNT(*)::int FROM form_fields ff WHERE ff.form_id = f.id) AS field_count,
            (SELECT COUNT(*)::int FROM submissions s WHERE s.form_id = f.id) AS response_count
       FROM forms f
      ORDER BY f.created_at DESC`,
  );
  res.json(rows);
});

formsRouter.post('/forms', async (req, res) => {
  const input = parseFormInput(req.body);
  const form = await withTransaction(async (client) => {
    let created;
    for (let attempt = 0; !created; attempt++) {
      const r = await client.query(
        `INSERT INTO forms (slug, title, description, is_published)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id, slug, title, description, is_published, created_at`,
        [generateSlug(input.title), input.title, input.description, input.is_published],
      );
      created = r.rows[0];
      if (!created && attempt >= 4) throw new HttpError(500, 'Could not allocate a unique slug');
    }
    const fields = [];
    for (const [position, f] of input.fields.entries()) {
      const r = await client.query(
        `INSERT INTO form_fields (form_id, label, field_type, options, is_required, position)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6)
         RETURNING id, label, field_type, options, is_required, position`,
        [created.id, f.label, f.field_type, JSON.stringify(f.options), f.is_required, position],
      );
      fields.push(r.rows[0]);
    }
    return { ...created, form_fields: fields };
  });
  res.status(201).json(form);
});

formsRouter.get('/forms/:slug', async (req, res) => {
  const form = await getFormWithFields('slug', req.params.slug);
  if (!form.is_published) throw new HttpError(404, 'Form not found');
  res.json(form);
});

formsRouter.delete('/forms/:id', async (req, res) => {
  if (!UUID_RE.test(req.params.id)) throw new HttpError(400, 'Invalid form id');
  const { rowCount } = await pool.query('DELETE FROM forms WHERE id = $1', [req.params.id]);
  if (!rowCount) throw new HttpError(404, 'Form not found');
  res.status(204).end();
});
