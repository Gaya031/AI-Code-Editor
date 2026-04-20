import { getDatabaseHealth } from './database.service.js';

export async function getHealthStatus() {
  const database = await getDatabaseHealth();

  return {
    service: 'proj-sart-backend',
    status: 'ok',
    timestamp: new Date().toISOString(),
    database
  };
}

