import { getHealthStatus } from '../services/health.service.js';
import { sendSuccess } from '../utils/response.js';

export async function healthController(_req, res, next) {
  try {
    const health = await getHealthStatus();
    return sendSuccess(res, health);
  } catch (error) {
    return next(error);
  }
}

