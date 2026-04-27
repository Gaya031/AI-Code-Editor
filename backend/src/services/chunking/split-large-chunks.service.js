import { chooseBoundary, getLines } from './chunking.utils.js';

const MAX_LINES_PER_CHUNK = 100;
const MIN_SPLIT_LINES = 60;

export function splitLargeChunks(chunks) {
  return chunks.flatMap((chunk) => {
    const lineCount = chunk.endLine - chunk.startLine + 1;

    if (lineCount <= MAX_LINES_PER_CHUNK) {
      return chunk;
    }

    const lines = getLines(chunk.content);
    const splitChunks = [];
    let startIndex = 0;
    let partIndex = 1;

    while (startIndex < lines.length) {
      const remaining = lines.length - startIndex;
      const maxEndIndex = startIndex + Math.min(MAX_LINES_PER_CHUNK, remaining);
      const minEndIndex = startIndex + Math.min(MIN_SPLIT_LINES, remaining);
      const endIndex = chooseBoundary(lines, startIndex, minEndIndex, maxEndIndex);

      if (endIndex <= startIndex) {
        break;
      }

      splitChunks.push({
        ...chunk,
        name: `${chunk.name}_part_${partIndex}`,
        content: lines.slice(startIndex, endIndex).join('\n').trimEnd(),
        startLine: chunk.startLine + startIndex,
        endLine: chunk.startLine + endIndex - 1
      });

      startIndex = endIndex;
      partIndex += 1;
    }

    return splitChunks;
  });
}

