import { getBackendHealth } from '../model/api/backend.api.js';

export async function loadBackendStatus() {
  try {
    const result = await getBackendHealth();
    return {
      label: result.data.database.connected ? 'DB connected' : 'DB unavailable',
      healthy: result.success && result.data.database.connected,
      latencyMs: result.data.database.latencyMs
    };
  } catch {
    return {
      label: 'Backend offline',
      healthy: false,
      latencyMs: null
    };
  }
}

