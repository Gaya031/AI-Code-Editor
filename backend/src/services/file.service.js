import { prisma } from './database.service.js';
import { HttpError } from '../utils/http-error.js';
import { syncCodeChunksForFile } from './code-chunk.service.js';
import { getProjectOrThrow } from './project.service.js';
import { normalizePath } from '../utils/file-path.js';

function buildTree(paths) {
  const root = [];
  const nodeMap = new Map();

  for (const originalPath of paths) {
    const filePath = normalizePath(originalPath);

    if (!filePath) {
      continue;
    }

    const parts = filePath.split('/').filter(Boolean);
    let parentKey = '';
    let currentLevel = root;

    parts.forEach((part, index) => {
      const currentKey = parentKey ? `${parentKey}/${part}` : part;
      const existing = nodeMap.get(currentKey);

      if (existing) {
        currentLevel = existing.children ?? [];
        parentKey = currentKey;
        return;
      }

      const isFile = index === parts.length - 1;
      const node = {
        name: part,
        path: currentKey,
        type: isFile ? 'file' : 'directory',
        children: isFile ? undefined : []
      };

      currentLevel.push(node);
      nodeMap.set(currentKey, node);
      currentLevel = node.children ?? [];
      parentKey = currentKey;
    });
  }

  return root;
}

export async function listProjectFiles(projectId) {
  await getProjectOrThrow(projectId);

  const files = await prisma.projectFile.findMany({
    where: { projectId },
    orderBy: { path: 'asc' },
    select: {
      id: true,
      path: true
    }
  });

  return {
    files,
    tree: buildTree(files.map((file) => file.path))
  };
}

export async function uploadProjectFiles(projectId, files) {
  await getProjectOrThrow(projectId);

  const payload = files
    .map((file) => ({
      path: normalizePath(file.path),
      content: file.content
    }))
    .filter((file) => file.path.length > 0);

  if (payload.length === 0) {
    throw new HttpError(400, 'At least one valid file is required');
  }

  await prisma.$transaction(
    payload.map((file) =>
      prisma.projectFile.upsert({
        where: {
          projectId_path: {
            projectId,
            path: file.path
          }
        },
        update: {
          content: file.content
        },
        create: {
          projectId,
          path: file.path,
          content: file.content
        }
      })
    )
  );

  const chunkResults = await Promise.all(
    payload.map(async (file) => {
      const chunks = await syncCodeChunksForFile(projectId, file.path, file.content);
      return {
        filePath: file.path,
        chunkCount: chunks.length,
        language: chunks[0]?.language ?? 'unknown'
      };
    })
  );

  return {
    uploaded: payload.length,
    chunksCreated: chunkResults.reduce((sum, result) => sum + result.chunkCount, 0),
    files: chunkResults
  };
}

export async function getProjectFile(projectId, filePath) {
  await getProjectOrThrow(projectId);

  const normalizedPath = normalizePath(filePath);
  const file = await prisma.projectFile.findUnique({
    where: {
      projectId_path: {
        projectId,
        path: normalizedPath
      }
    }
  });

  if (!file) {
    throw new HttpError(404, 'File not found');
  }

  return file;
}

export async function saveProjectFile(projectId, filePath, content) {
  await getProjectOrThrow(projectId);

  const normalizedPath = normalizePath(filePath);

  if (!normalizedPath) {
    throw new HttpError(400, 'File path is required');
  }

  const file = await prisma.projectFile.upsert({
    where: {
      projectId_path: {
        projectId,
        path: normalizedPath
      }
    },
    update: {
      content
    },
    create: {
      projectId,
      path: normalizedPath,
      content
    }
  });

  const chunks = await syncCodeChunksForFile(projectId, normalizedPath, content);

  return {
    file,
    chunks
  };
}
