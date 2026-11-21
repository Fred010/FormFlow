# FormFlow

Form builder and submission management tool, split into three independently deployable tiers:

| Tier | Path | Stack |
| --- | --- | --- |
| Frontend | `frontend/` | React + TypeScript, Vite, Tailwind CSS, Lucide icons |
| Backend | `backend/` | Node.js + TypeScript, Express 5, `pg` (raw parameterized SQL) |
| Database | `database/` | PostgreSQL 13+ (`init.sql`: schema, indexes, seed form with 2 responses) |

## Quick start

```bash
# 1. Database (any Postgres 13+; Docker example): spin up for the database container
docker run -d --name formflow-db -p 5432:5432 \
  -e POSTGRES_USER=formflow -e POSTGRES_PASSWORD=formflow -e POSTGRES_DB=formflow \
  -v "$PWD/database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro" postgres:16-alpine
# or: psql "$DATABASE_URL" -f database/init.sql
verify the container is running: `docker ps`

# 2. Env files
backend/.env
frontend/.env

# 3. Install + run both tiers (frontend :5173, backend :4000)
npm run install:all
npm run dev

When everything works:
open `http://localhost:5173` in your browser
```

Vite proxies `/api` to `http://localhost:4000` in dev.

## Configuration

**Backend** (`backend/.env`): `PORT` (default `4000`), `DATABASE_URL`, `APP_VERSION`, `GIT_SHA`, `CORS_ORIGIN` (comma-separated; empty allows all).
The API retries the database connection with exponential backoff (10 attempts) before listening.

**Frontend** (`frontend/.env`): `VITE_API_URL` (default `/api`), `VITE_APP_VERSION` (default `dev`).

## API

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/health` | Status, DB connectivity, version, commit |
| GET | `/api/forms` | All forms with `response_count` |
| POST | `/api/forms` | Create form + ordered fields (one transaction) |
| GET | `/api/forms/:slug` | Form metadata + ordered `form_fields` |
| DELETE | `/api/forms/:id` | Delete form (cascades) |
| POST | `/api/forms/:slug/submissions` | Validate + store a submission (one transaction) |
| GET | `/api/forms/:id/submissions` | `{ form, fields, submissions[] }`, answers keyed by `field_id` |

`POST /api/forms` body:

```json
{
  "title": "Event RSVP",
  "description": "Optional",
  "fields": [
    { "label": "Name", "field_type": "short_text", "is_required": true },
    { "label": "Meal", "field_type": "radio", "options": ["Veg", "Chicken"] }
  ]
}
```

`POST /api/forms/:slug/submissions` body: `{ "answers": { "<field_id>": "text" | 42 | ["a", "b"] } }`.
Validation errors return `422` with `details` keyed by `field_id`.

Field types: `short_text`, `long_text`, `number`, `select`, `radio`, `checkbox`.

## Scripts

- `npm run dev`: backend + frontend via `concurrently`
- `npm run build`: compile backend to `backend/dist`, build frontend to `frontend/dist`
- `npm run typecheck`: type-check both tiers
