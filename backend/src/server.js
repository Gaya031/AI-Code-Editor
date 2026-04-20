import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './services/database.service.js';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`);
    console.log('Database connection established');
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch((error) => {
  console.error('Failed to start backend');
  console.error(error);
  process.exit(1);
});

