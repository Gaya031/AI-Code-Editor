import { Router } from 'express';
import { z } from 'zod';
import {
  getProjectFileController,
  getProjectFileChunksController,
  listProjectFilesController,
  saveProjectFileController,
  uploadProjectFilesController
} from '../controllers/file.controller.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';

const fileQuerySchema = z.object({
  path: z.string().trim().min(1)
});

const uploadFilesSchema = z.object({
  files: z
    .array(
      z.object({
        path: z.string().trim().min(1).max(512),
        content: z.string().max(2_000_000)
      })
    )
    .min(1)
    .max(500)
});

const saveFileSchema = z.object({
  path: z.string().trim().min(1).max(512),
  content: z.string().max(2_000_000)
});

export const fileRouter = Router({ mergeParams: true });

fileRouter.get('/', listProjectFilesController);
fileRouter.get('/content', validateQuery(fileQuerySchema), getProjectFileController);
fileRouter.get('/chunks', validateQuery(fileQuerySchema), getProjectFileChunksController);
fileRouter.post('/upload', validateBody(uploadFilesSchema), uploadProjectFilesController);
fileRouter.put('/content', validateBody(saveFileSchema), saveProjectFileController);
