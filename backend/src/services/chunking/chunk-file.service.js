import { fallbackChunker } from "./fallback-chunker.service.js";
import { detectLanguage } from "./language-detector.service.js";
import { normalizeChunks } from "./normalize-chunks.service.js";
import { tryPrimaryParser } from "./primary-parser.service.js";
import { splitLargeChunks } from "./split-large-chunks.service.js";
import { enrichMetadata } from "./enrich-metadata.service.js";

export function chunkFile(file) {
  const language = detectLanguage(file.filePath);
  const preparedFile = {
    ...file,
    language,
  };

  let chunks = [];
  let fileMetadata = {
    imports: [],
    exports: [],
    dependencies: [],
  };

  try {
    const primaryResult = tryPrimaryParser(preparedFile, language);
    chunks = primaryResult.chunks;
    fileMetadata = primaryResult.metadata;
  } catch {
    chunks = [];
  }

  if (!chunks || chunks.length === 0) {
    chunks = fallbackChunker(preparedFile);
  }

  chunks = normalizeChunks(chunks, preparedFile);
  chunks = splitLargeChunks(chunks);
  chunks = enrichMetadata(chunks, preparedFile, fileMetadata);

  return chunks;
}
