import { createProject, listProjects } from '../services/project.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listProjectsController(_req, res, next) {
  try {
    const projects = await listProjects();
    return sendSuccess(res, { projects });
  } catch (error) {
    return next(error);
  }
}

export async function createProjectController(req, res, next) {
  try {
    const project = await createProject(req.body);
    return sendSuccess(res, { project }, 201);
  } catch (error) {
    return next(error);
  }
}

