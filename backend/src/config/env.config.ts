export interface AppEnvironment {
  port: number;
  nodeEnv: string;
  mongodbUri: string;
  corsOrigins: string[];
}

export function loadEnvConfig(): { app: AppEnvironment } {
  const rawPort = process.env.PORT ?? '3000';
  const port = Number(rawPort);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`Invalid PORT environment variable: "${rawPort}"`);
  }

  const mongodbUri = (
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/life-os'
  ).trim();

  if (!mongodbUri) {
    throw new Error('MONGODB_URI must not be empty');
  }

  const corsOriginRaw =
    process.env.CORS_ORIGIN ?? 'http://localhost:4200,http://localhost:8080';
  const corsOrigins = corsOriginRaw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    app: {
      port,
      nodeEnv: process.env.NODE_ENV ?? 'development',
      mongodbUri,
      corsOrigins,
    },
  };
}

