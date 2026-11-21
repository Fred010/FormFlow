import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL || 'postgres://formflow:formflow@localhost:5432/formflow',
  appVersion: process.env.APP_VERSION || 'dev',
  gitSha: process.env.GIT_SHA || 'local',
  corsOrigin: process.env.CORS_ORIGIN || '',
};
