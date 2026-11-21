-- FormFlow database initialization
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS forms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         VARCHAR(64) UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  description  TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS form_fields (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id     UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  field_type  VARCHAR(32) NOT NULL
              CHECK (field_type IN ('short_text', 'long_text', 'number', 'select', 'radio', 'checkbox')),
  options     JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN DEFAULT false,
  position    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id      UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission_answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  field_id      UUID NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
  value         JSONB NOT NULL,
  UNIQUE (submission_id, field_id)
);

CREATE INDEX IF NOT EXISTS idx_form_fields_form_position ON form_fields (form_id, position);
CREATE INDEX IF NOT EXISTS idx_submissions_form_submitted ON submissions (form_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_submission_answers_field ON submission_answers (field_id);
CREATE INDEX IF NOT EXISTS idx_forms_created_at ON forms (created_at DESC);

-- Seed: one sample form with two responses
INSERT INTO forms (id, slug, title, description, is_published, created_at) VALUES
  ('a1b2c3d4-0000-4000-8000-000000000001', 'product-feedback-q4',
   'Product Feedback Survey',
   'Help us improve FormFlow. This takes about 2 minutes and every answer is read by our product team.',
   true, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO form_fields (id, form_id, label, field_type, options, is_required, position) VALUES
  ('b1000000-0000-4000-8000-000000000001', 'a1b2c3d4-0000-4000-8000-000000000001',
   'Full name', 'short_text', '[]', true, 0),
  ('b1000000-0000-4000-8000-000000000002', 'a1b2c3d4-0000-4000-8000-000000000001',
   'Team size', 'select', '["Just me", "2-10", "11-50", "51-200", "200+"]', true, 1),
  ('b1000000-0000-4000-8000-000000000003', 'a1b2c3d4-0000-4000-8000-000000000001',
   'How likely are you to recommend us? (0-10)', 'number', '[]', true, 2),
  ('b1000000-0000-4000-8000-000000000004', 'a1b2c3d4-0000-4000-8000-000000000001',
   'Primary use case', 'radio', '["Customer surveys", "Lead capture", "Internal requests", "Event registration"]', false, 3),
  ('b1000000-0000-4000-8000-000000000005', 'a1b2c3d4-0000-4000-8000-000000000001',
   'Which features do you use?', 'checkbox', '["Form builder", "CSV export", "Share links", "Response table"]', false, 4),
  ('b1000000-0000-4000-8000-000000000006', 'a1b2c3d4-0000-4000-8000-000000000001',
   'Anything else you would like to share?', 'long_text', '[]', false, 5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO submissions (id, form_id, submitted_at) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'a1b2c3d4-0000-4000-8000-000000000001', NOW() - INTERVAL '3 days'),
  ('c1000000-0000-4000-8000-000000000002', 'a1b2c3d4-0000-4000-8000-000000000001', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO submission_answers (submission_id, field_id, value) VALUES
  ('c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', '"Ama Mensah"'),
  ('c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000002', '"11-50"'),
  ('c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000003', '9'),
  ('c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000004', '"Customer surveys"'),
  ('c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000005', '["Form builder", "CSV export"]'),
  ('c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000006', '"Love how fast it is to spin up a new survey. Conditional logic would be great."'),
  ('c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000001', '"Daniel Okoro"'),
  ('c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000002', '"2-10"'),
  ('c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000003', '7'),
  ('c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000004', '"Lead capture"'),
  ('c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000005', '["Share links", "Response table", "CSV export"]')
ON CONFLICT (submission_id, field_id) DO NOTHING;
