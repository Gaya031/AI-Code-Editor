export function getLines(content) {
  return content.split(/\r?\n/);
}

export function sliceLines(content, startLine, endLine) {
  const lines = getLines(content);
  return lines.slice(Math.max(startLine - 1, 0), endLine).join('\n').trimEnd();
}

export function countLines(content) {
  return getLines(content).length;
}

export function isProbablyBinary(content) {
  if (!content) {
    return false;
  }

  return content.includes('\u0000');
}

export function chooseBoundary(lines, startIndex, minEndIndex, maxEndIndex) {
  const safeMax = Math.min(maxEndIndex, lines.length);

  for (let index = safeMax; index > minEndIndex; index -= 1) {
    const line = lines[index - 1]?.trim() ?? '';

    if (!line || line === '}' || line.endsWith(';') || line.endsWith('}') || line.endsWith('{')) {
      return index;
    }
  }

  return safeMax;
}

