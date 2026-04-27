import { prisma } from './database.service.js';
import { getProjectOrThrow } from './project.service.js';
import { chunkFile } from './chunking/chunk-file.service.js';
import { normalizePath } from '../utils/file-path.js';

export async function syncCodeChunksForFile(projectId, filePath, content) {
  await getProjectOrThrow(projectId);

  const normalizedPath = normalizePath(filePath);
  const chunks = chunkFile({
    filePath: normalizedPath,
    content
  });

  await prisma.$transaction([
    prisma.codeChunk.deleteMany({
      where: {
        projectId,
        filePath: normalizedPath
      }
    }),
    ...(chunks.length > 0
      ? [
          prisma.codeChunk.createMany({
            data: chunks.map((chunk) => ({
              projectId,
              filePath: normalizedPath,
              name: chunk.name,
              type: chunk.type,
              content: chunk.content,
              language: chunk.language,
              startLine: chunk.startLine,
              endLine: chunk.endLine,
              imports: chunk.imports,
              exports: chunk.exports,
              dependencies: chunk.dependencies
            }))
          })
        ]
      : [])
  ]);

  return chunks;
}

export async function getFileChunks(projectId, filePath) {
  await getProjectOrThrow(projectId);

  return prisma.codeChunk.findMany({
    where: {
      projectId,
      filePath: normalizePath(filePath)
    },
    orderBy: [{ startLine: 'asc' }, { name: 'asc' }]
  });
}

