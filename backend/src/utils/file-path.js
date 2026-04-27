import path from 'node:path';

export function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\/+/, '').trim();
}

export function fileBaseName(filePath) {
  const normalizedPath = normalizePath(filePath);
  return path.basename(normalizedPath, path.extname(normalizedPath)) || 'file';
}

