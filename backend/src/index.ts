import { config } from './config.js';
import { pool, waitForDb } from './db.js';
import { createApp } from './app.js';

async function main() {
  await waitForDb(10);
  const server = createApp().listen(config.port, () => {
    console.log(`[api] FormFlow API v${config.appVersion} (${config.gitSha}) listening on :${config.port}`);
  });

  const shutdown = () => {
    server.close(() => pool.end().finally(() => process.exit(0)));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('[api] failed to start:', err);
  process.exit(1);
});
