import { useState } from 'react';
import { FileTree } from './FileTree.jsx';

export function Sidebar({
  backendStatus,
  busy,
  onCreateProject,
  onProjectChange,
  onSelectFile,
  onUploadFiles,
  projects,
  selectedFile,
  selectedProject,
  tree
}) {
  const [projectName, setProjectName] = useState('');

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-line bg-surface">
      <div className="border-b border-line px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Proj Sart</p>
        <h1 className="mt-1 text-xl font-semibold text-ink">AI Code Editor</h1>
      </div>

      <div className="border-b border-line px-5 py-4">
        <div className="flex items-center gap-2">
          <span className={backendStatus.healthy ? 'h-2 w-2 rounded-full bg-green-500' : 'h-2 w-2 rounded-full bg-red-500'} />
          <p className="text-sm font-medium text-ink">{backendStatus.label}</p>
        </div>
        {backendStatus.latencyMs !== null && <p className="mt-1 text-xs text-muted">{backendStatus.latencyMs}ms database check</p>}
      </div>

      <div className="border-b border-line px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Project</p>
        <div className="mt-3 flex gap-2">
          <input
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-slate-400 focus:border-ink"
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="New project"
            value={projectName}
          />
          <button
            className="rounded-md bg-ink px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!projectName.trim() || busy.creatingProject}
            onClick={() => {
              onCreateProject(projectName.trim());
              setProjectName('');
            }}
            type="button"
          >
            {busy.creatingProject ? '...' : 'Add'}
          </button>
        </div>

        <select
          className="mt-3 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink"
          onChange={(event) => onProjectChange(event.target.value)}
          value={selectedProject?.id ?? ''}
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} ({project._count.files})
            </option>
          ))}
        </select>

        <label className="mt-3 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Upload files</span>
          <input
            className="block w-full text-xs text-muted file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink"
            multiple
            onChange={(event) => {
              onUploadFiles(event.target.files);
              event.target.value = '';
            }}
            type="file"
            webkitdirectory="true"
          />
        </label>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted">Files</p>
        <div className="mt-2">
          <FileTree onSelectFile={onSelectFile} selectedPath={selectedFile?.path} tree={tree} />
        </div>
      </nav>

      <div className="border-t border-line px-5 py-4 text-xs text-muted">
        {selectedProject ? selectedProject.name : 'Select a project to browse files.'}
      </div>
    </aside>
  );
}
