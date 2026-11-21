import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({ connectionString: config.databaseUrl });

pool.on('error', (err) => console.error('[db] idle client error:', err.message));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function waitForDb(maxAttempts = 10, baseDelayMs = 500): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await pool.query('SELECT 1');
      console.log(`[db] connected (attempt ${attempt})`);
      return;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      const delay = Math.min(baseDelayMs * 2 ** (attempt - 1), 30_000);
      console.warn(`[db] not ready (attempt ${attempt}/${maxAttempts}): ${(err as Error).message}. Retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
}

export async function withTransaction<T>(fn: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
