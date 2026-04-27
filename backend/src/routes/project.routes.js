import { Router } from 'express';
import { z } from 'zod';
import { createProjectController, listProjectsController } from '../controllers/project.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  userEmail: z.string().email().optional()
});

export const projectRouter = Router();

projectRouter.get('/', listProjectsController);
projectRouter.post('/', validateBody(createProjectSchema), createProjectController);

