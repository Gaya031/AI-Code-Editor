import { getFileChunks } from '../services/code-chunk.service.js';
import {
  getProjectFile,
  listProjectFiles,
  saveProjectFile,
  uploadProjectFiles
} from '../services/file.service.js';
import { sendSuccess } from '../utils/response.js';

export async function listProjectFilesController(req, res, next) {
  try {
    const { projectId } = req.params;
    const result = await listProjectFiles(projectId);
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

export async function uploadProjectFilesController(req, res, next) {
  try {
    const { projectId } = req.params;
    const result = await uploadProjectFiles(projectId, req.body.files);
    return sendSuccess(res, result, 201);
  } catch (error) {
    return next(error);
  }
}

export async function getProjectFileController(req, res, next) {
  try {
    const { projectId } = req.params;
    const file = await getProjectFile(projectId, req.query.path);
    return sendSuccess(res, { file });
  } catch (error) {
    return next(error);
  }
}

export async function getProjectFileChunksController(req, res, next) {
  try {
    const { projectId } = req.params;
    const chunks = await getFileChunks(projectId, req.query.path);
    return sendSuccess(res, { chunks });
  } catch (error) {
    return next(error);
  }
}

export async function saveProjectFileController(req, res, next) {
  try {
    const { projectId } = req.params;
    const result = await saveProjectFile(projectId, req.body.path, req.body.content);
    return sendSuccess(res, {
      file: result.file,
      chunks: result.chunks
    });
  } catch (error) {
    return next(error);
  }
}
