const extensionToLanguage = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.mts': 'typescript',
  '.cts': 'typescript'
};

export function detectLanguage(filePath) {
  const extension = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  return extensionToLanguage[extension] ?? 'unknown';
}

