import { Router } from 'express';
import { pool } from '../db.js';
import { config } from '../config.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  let db: 'connected' | 'error' = 'connected';
  try {
    await pool.query('SELECT 1');
  } catch {
    db = 'error';
  }
  res.json({
    status: 'ok',
    db,
    version: config.appVersion,
    commit: config.gitSha,
    timestamp: new Date().toISOString(),
  });
});
