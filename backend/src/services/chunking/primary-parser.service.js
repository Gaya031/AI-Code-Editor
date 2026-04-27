import parser from '@babel/parser';
import traverseModule from '@babel/traverse';
import { fileBaseName } from '../../utils/file-path.js';
import { sliceLines } from './chunking.utils.js';

const traverse = traverseModule.default;

function parserPlugins(language) {
  const plugins = ['jsx', 'classProperties', 'dynamicImport', 'objectRestSpread', 'topLevelAwait'];

  if (language === 'typescript') {
    plugins.push('typescript');
  }

  return plugins;
}

function getBindingNames(pattern) {
  if (!pattern) {
    return [];
  }

  if (pattern.type === 'Identifier') {
    return [pattern.name];
  }

  if (pattern.type === 'ObjectPattern') {
    return pattern.properties.flatMap((property) => {
      if (property.type === 'RestElement') {
        return getBindingNames(property.argument);
      }

      return getBindingNames(property.value);
    });
  }

  if (pattern.type === 'ArrayPattern') {
    return pattern.elements.flatMap((element) => getBindingNames(element));
  }

  if (pattern.type === 'AssignmentPattern') {
    return getBindingNames(pattern.left);
  }

  return [];
}

function safeNodeContent(fileContent, node) {
  if (!node.loc) {
    return '';
  }

  return sliceLines(fileContent, node.loc.start.line, node.loc.end.line);
}

function containsEval(node) {
  if (!node || typeof node !== 'object') {
    return false;
  }

  if (
    node.type === 'CallExpression' &&
    node.callee?.type === 'Identifier' &&
    node.callee.name === 'eval'
  ) {
    return true;
  }

  return Object.values(node).some((value) => {
    if (Array.isArray(value)) {
      return value.some((entry) => containsEval(entry));
    }

    return containsEval(value);
  });
}

function createChunkCollector(file) {
  const seen = new Set();
  const counters = { anonymous: 0 };
  const fileKey = fileBaseName(file.filePath);

  return function collectChunk(node, type, name, extra = {}) {
    if (!node?.loc) {
      return null;
    }

    const key = `${type}:${node.loc.start.line}:${node.loc.end.line}:${name ?? 'anonymous'}`;

    if (seen.has(key)) {
      return null;
    }

    seen.add(key);

    counters.anonymous += 1;
    const finalName = name || `${type}_${fileKey}_${counters.anonymous}`;
    const content = safeNodeContent(file.content, node);

    if (!content.trim()) {
      return null;
    }

    return {
      type,
      name: finalName,
      content,
      startLine: node.loc.start.line,
      endLine: node.loc.end.line,
      ...extra
    };
  };
}

function extractFunctionName(path, filePath) {
  const node = path.node;
  const baseName = fileBaseName(filePath);

  if (node.id?.name) {
    return node.id.name;
  }

  if (path.parentPath?.isExportDefaultDeclaration()) {
    return `default_export_${baseName}`;
  }

  if (path.parentPath?.isVariableDeclarator()) {
    return path.parentPath.node.id?.name ?? null;
  }

  if (path.parentPath?.isAssignmentExpression()) {
    const left = path.parentPath.node.left;
    if (left.type === 'Identifier') {
      return left.name;
    }
  }

  if (path.parentPath?.isObjectProperty()) {
    const key = path.parentPath.node.key;
    if (key.type === 'Identifier') {
      return key.name;
    }
  }

  return null;
}

function extractClassName(path, filePath) {
  if (path.node.id?.name) {
    return path.node.id.name;
  }

  if (path.parentPath?.isExportDefaultDeclaration()) {
    return `default_export_${fileBaseName(filePath)}`;
  }

  return null;
}

function extractMethodName(path) {
  const className = path.parentPath?.parentPath?.node?.id?.name;
  const key = path.node.key;
  const keyName = key?.type === 'Identifier' ? key.name : key?.type === 'StringLiteral' ? key.value : 'method';

  return className ? `${className}.${keyName}` : keyName;
}

function gatherFileMetadata(ast) {
  const imports = new Set();
  const exports = new Set();
  const dependencies = new Set();

  ast.program.body.forEach((statement) => {
    if (statement.type === 'ImportDeclaration') {
      imports.add(statement.source.value);
      dependencies.add(statement.source.value);
    }

    if (statement.type === 'ExportNamedDeclaration') {
      statement.specifiers?.forEach((specifier) => exports.add(specifier.exported.name));

      if (statement.declaration?.type === 'FunctionDeclaration' && statement.declaration.id?.name) {
        exports.add(statement.declaration.id.name);
      }

      if (statement.declaration?.type === 'ClassDeclaration' && statement.declaration.id?.name) {
        exports.add(statement.declaration.id.name);
      }

      if (statement.declaration?.type === 'VariableDeclaration') {
        statement.declaration.declarations
          .flatMap((declaration) => getBindingNames(declaration.id))
          .forEach((name) => exports.add(name));
      }
    }

    if (statement.type === 'ExportDefaultDeclaration') {
      exports.add('default');
    }
  });

  traverse(ast, {
    noScope: true,
    CallExpression(path) {
      if (
        path.node.callee.type === 'Identifier' &&
        path.node.callee.name === 'require' &&
        path.node.arguments[0]?.type === 'StringLiteral'
      ) {
        dependencies.add(path.node.arguments[0].value);
      }
    }
  });

  return {
    imports: [...imports],
    exports: [...exports],
    dependencies: [...dependencies]
  };
}

function isFunctionLike(node) {
  return ['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration'].includes(node?.type);
}

function isStructuralStatement(statement) {
  if (!statement) {
    return false;
  }

  if (statement.type === 'FunctionDeclaration' || statement.type === 'ClassDeclaration') {
    return true;
  }

  if (statement.type === 'ExportDefaultDeclaration' || statement.type === 'ExportNamedDeclaration') {
    const declaration = statement.declaration;

    if (!declaration) {
      return false;
    }

    if (declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') {
      return true;
    }

    if (declaration.type === 'VariableDeclaration') {
      return declaration.declarations.every((entry) => isFunctionLike(entry.init) || entry.init?.type === 'ClassExpression');
    }
  }

  if (statement.type === 'VariableDeclaration') {
    return statement.declarations.every((entry) => isFunctionLike(entry.init) || entry.init?.type === 'ClassExpression');
  }

  return false;
}

function extractLogicalBlocks(ast, file, collectChunk) {
  const blocks = [];
  let currentStatements = [];

  const flush = () => {
    if (currentStatements.length === 0) {
      return;
    }

    const first = currentStatements[0];
    const last = currentStatements[currentStatements.length - 1];
    const tempNode = {
      loc: {
        start: first.loc.start,
        end: last.loc.end
      }
    };

    const block = collectChunk(
      tempNode,
      currentStatements.some((statement) => containsEval(statement)) ? 'unknown' : 'block',
      `block_${first.loc.start.line}`
    );

    if (block) {
      blocks.push(block);
    }

    currentStatements = [];
  };

  ast.program.body.forEach((statement) => {
    if (!statement.loc || statement.type === 'ImportDeclaration' || isStructuralStatement(statement)) {
      flush();
      return;
    }

    currentStatements.push(statement);
  });

  flush();
  return blocks;
}

export function tryPrimaryParser(file, language) {
  if (!['javascript', 'typescript'].includes(language)) {
    return {
      chunks: [],
      metadata: {
        imports: [],
        exports: [],
        dependencies: []
      }
    };
  }

  const ast = parser.parse(file.content, {
    sourceType: 'unambiguous',
    errorRecovery: true,
    plugins: parserPlugins(language)
  });

  const collectChunk = createChunkCollector(file);
  const chunks = [];

  traverse(ast, {
    noScope: true,
    FunctionDeclaration(path) {
      const chunk = collectChunk(path.node, 'function', extractFunctionName(path, file.filePath));
      if (chunk) {
        chunks.push(chunk);
      }
    },
    FunctionExpression(path) {
      const chunk = collectChunk(path.node, 'function', extractFunctionName(path, file.filePath));
      if (chunk) {
        chunks.push(chunk);
      }
    },
    ArrowFunctionExpression(path) {
      const chunk = collectChunk(path.node, 'function', extractFunctionName(path, file.filePath));
      if (chunk) {
        chunks.push(chunk);
      }
    },
    ClassDeclaration(path) {
      const chunk = collectChunk(path.node, 'class', extractClassName(path, file.filePath));
      if (chunk) {
        chunks.push(chunk);
      }
    },
    ClassExpression(path) {
      const chunk = collectChunk(path.node, 'class', extractClassName(path, file.filePath));
      if (chunk) {
        chunks.push(chunk);
      }
    },
    ClassMethod(path) {
      const chunk = collectChunk(path.node, 'method', extractMethodName(path));
      if (chunk) {
        chunks.push(chunk);
      }
    },
    ObjectMethod(path) {
      const chunk = collectChunk(path.node, 'function', extractMethodName(path));
      if (chunk) {
        chunks.push(chunk);
      }
    }
  });

  const metadata = gatherFileMetadata(ast);
  const logicalBlocks = extractLogicalBlocks(ast, file, collectChunk);

  return {
    chunks: [...chunks, ...logicalBlocks].sort((left, right) => left.startLine - right.startLine),
    metadata
  };
}
