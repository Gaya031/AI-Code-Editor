export function enrichMetadata(chunks, file, fileMetadata) {
  return chunks.map((chunk) => ({
    ...chunk,
    filePath: file.filePath,
    language: file.language,
    imports: chunk.imports?.length ? chunk.imports : fileMetadata.imports,
    exports: chunk.exports?.length ? chunk.exports : fileMetadata.exports,
    dependencies: chunk.dependencies?.length ? chunk.dependencies : fileMetadata.dependencies
  }));
}

