import { chooseBoundary, countLines, getLines, isProbablyBinary } from './chunking.utils.js';

const DEFAULT_MIN_LINES = 50;
const DEFAULT_MAX_LINES = 80;

export function fallbackChunker(file, options = {}) {
  const minLines = options.minLines ?? DEFAULT_MIN_LINES;
  const maxLines = options.maxLines ?? DEFAULT_MAX_LINES;

  if (!file.content?.trim() || isProbablyBinary(file.content)) {
    return [];
  }

  const lines = getLines(file.content);
  const totalLines = countLines(file.content);
  const chunks = [];
  let startIndex = 0;
  let blockIndex = 1;

  while (startIndex < totalLines) {
    const remaining = totalLines - startIndex;
    const maxEndIndex = startIndex + Math.min(maxLines, remaining);
    const minEndIndex = startIndex + Math.min(minLines, remaining);
    const endIndex = chooseBoundary(lines, startIndex, minEndIndex, maxEndIndex);
    const startLine = startIndex + 1;
    const endLine = Math.max(endIndex, startLine);
    const content = lines.slice(startIndex, endLine).join('\n').trimEnd();

    if (content.trim()) {
      chunks.push({
        type: 'block',
        name: `fallback_block_${blockIndex}`,
        content,
        startLine,
        endLine
      });

      blockIndex += 1;
    }

    if (endLine <= startIndex) {
      break;
    }

    startIndex = endLine;
  }

  return chunks;
}

