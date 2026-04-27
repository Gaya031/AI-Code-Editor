import { countLines } from './chunking.utils.js';

export function normalizeChunks(rawChunks, file) {
  const nameCounts = new Map();
  const fallbackBaseName = file.filePath.split('/').pop()?.split('.')[0] ?? 'chunk';

  return rawChunks
    .filter((chunk) => chunk?.content?.trim())
    .map((chunk, index) => {
      const type = chunk.type || 'block';
      const baseName = (chunk.name || `${type}_${fallbackBaseName}_${index + 1}`).replace(/\s+/g, '_');
      const seenCount = nameCounts.get(baseName) ?? 0;
      const uniqueName = seenCount === 0 ? baseName : `${baseName}_${seenCount + 1}`;
      nameCounts.set(baseName, seenCount + 1);

      const startLine = Number.isInteger(chunk.startLine) ? chunk.startLine : 1;
      const inferredEndLine = startLine + Math.max(countLines(chunk.content) - 1, 0);

      return {
        type,
        name: uniqueName,
        content: chunk.content.trimEnd(),
        filePath: file.filePath,
        language: file.language,
        startLine,
        endLine: Number.isInteger(chunk.endLine) ? chunk.endLine : inferredEndLine,
        imports: chunk.imports ?? [],
        exports: chunk.exports ?? [],
        dependencies: chunk.dependencies ?? []
      };
    });
}

