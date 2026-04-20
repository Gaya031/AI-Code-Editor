import { useEffect, useState } from 'react';
import { loadBackendStatus } from '../../controllers/health.controller.js';

const projectFiles = [
  'backend/src/server.js',
  'backend/prisma/schema.prisma',
  'frontend/src/views/editor/EditorView.jsx'
];

export function Sidebar() {
  const [status, setStatus] = useState({
    label: 'Checking backend',
    healthy: false,
    latencyMs: null
  });

  useEffect(() => {
    let mounted = true;

    loadBackendStatus().then((nextStatus) => {
      if (mounted) {
        setStatus(nextStatus);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-line bg-surface">
      <div className="border-b border-line px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Proj Sart</p>
        <h1 className="mt-1 text-xl font-semibold text-ink">AI Code Editor</h1>
      </div>

      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center gap-2">
          <span className={status.healthy ? 'h-2 w-2 rounded-full bg-green-500' : 'h-2 w-2 rounded-full bg-red-500'} />
          <p className="text-sm font-medium text-ink">{status.label}</p>
        </div>
        {status.latencyMs !== null && <p className="mt-1 text-xs text-muted">{status.latencyMs}ms database check</p>}
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted">Workspace</p>
        <div className="mt-2 space-y-1">
          {projectFiles.map((file) => (
            <button
              className="block w-full rounded-md px-2 py-2 text-left font-mono text-xs text-ink hover:bg-white"
              key={file}
              type="button"
            >
              {file}
            </button>
          ))}
        </div>
      </nav>

      <div className="border-t border-line px-5 py-4 text-xs text-muted">
        Safe diffs and repo analysis come next.
      </div>
    </aside>
  );
}

