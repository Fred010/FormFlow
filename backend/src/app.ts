import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { config } from './config.js';
import { formsRouter } from './routes/forms.js';
import { healthRouter } from './routes/health.js';
import { submissionsRouter } from './routes/submissions.js';
import { HttpError } from './types.js';

export function createApp() {
  const app = express();
  const origins = config.corsOrigin.split(',').map((o) => o.trim()).filter(Boolean);
  app.use(cors({ origin: origins.length ? origins : true }));
  app.use(express.json({ limit: '1mb' }));

  app.use('/api', healthRouter, formsRouter, submissionsRouter);
  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message, details: err.details });
      return;
    }
    if (err?.type === 'entity.parse.failed') {
      res.status(400).json({ error: 'Invalid JSON body' });
      return;
    }
    console.error('[api] unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  };
  app.use(errorHandler);
  return app;
}
