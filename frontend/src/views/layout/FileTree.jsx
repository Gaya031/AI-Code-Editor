function TreeNode({ depth = 0, node, onSelectFile, selectedPath }) {
  const paddingLeft = 12 + depth * 14;

  if (node.type === 'file') {
    const isSelected = selectedPath === node.path;

    return (
      <button
        className={`block w-full rounded-md py-1.5 pr-2 text-left font-mono text-xs ${
          isSelected ? 'bg-white text-ink' : 'text-muted hover:bg-white hover:text-ink'
        }`}
        onClick={() => onSelectFile(node.path)}
        style={{ paddingLeft }}
        type="button"
      >
        {node.name}
      </button>
    );
  }

  return (
    <div>
      <p className="py-1.5 pr-2 text-xs font-semibold text-ink" style={{ paddingLeft }}>
        {node.name}
      </p>
      <div>
        {node.children?.map((childNode) => (
          <TreeNode
            depth={depth + 1}
            key={childNode.path}
            node={childNode}
            onSelectFile={onSelectFile}
            selectedPath={selectedPath}
          />
        ))}
      </div>
    </div>
  );
}

export function FileTree({ onSelectFile, selectedPath, tree }) {
  if (tree.length === 0) {
    return <p className="px-2 py-3 text-xs text-muted">No files yet.</p>;
  }

  return (
    <div className="space-y-0.5">
      {tree.map((node) => (
        <TreeNode key={node.path} node={node} onSelectFile={onSelectFile} selectedPath={selectedPath} />
      ))}
    </div>
  );
}

