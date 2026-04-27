import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createWorkspaceProject,
  loadBackendStatus,
  loadProjectFile,
  loadProjectTree,
  loadProjects,
  saveWorkspaceFile,
  uploadWorkspaceFiles
} from '../controllers/workspace.controller.js';
import { EditorLayout } from '../views/layout/EditorLayout.jsx';

function inferLanguage(filePath) {
  const extension = filePath.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'css':
      return 'css';
    case 'html':
      return 'html';
    case 'md':
      return 'markdown';
    case 'py':
      return 'python';
    default:
      return 'plaintext';
  }
}

export function App() {
  const [backendStatus, setBackendStatus] = useState({
    label: 'Checking backend',
    healthy: false,
    latencyMs: null
  });
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tree, setTree] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editorValue, setEditorValue] = useState('');
  const [savedValue, setSavedValue] = useState('');
  const [message, setMessage] = useState('Create a project to start.');
  const [busy, setBusy] = useState({
    creatingProject: false,
    loadingFile: false,
    savingFile: false,
    uploading: false
  });

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  const isDirty = selectedFile ? editorValue !== savedValue : false;

  const refreshProjects = useCallback(async () => {
    const nextProjects = await loadProjects();
    setProjects(nextProjects);
    setSelectedProjectId((current) => {
      if (current && nextProjects.some((project) => project.id === current)) {
        return current;
      }

      return nextProjects[0]?.id ?? '';
    });
  }, []);

  const refreshTree = useCallback(async (projectId) => {
    if (!projectId) {
      setTree([]);
      setSelectedFile(null);
      setEditorValue('');
      setSavedValue('');
      return;
    }

    const nextTree = await loadProjectTree(projectId);
    setTree(nextTree.tree);

    return nextTree;
  }, []);

  const handleSelectFile = useCallback(
    async (filePath) => {
      if (!selectedProjectId || !filePath) {
        return;
      }

      setBusy((current) => ({ ...current, loadingFile: true }));

      try {
        const file = await loadProjectFile(selectedProjectId, filePath);
        setSelectedFile(file);
        setEditorValue(file.content);
        setSavedValue(file.content);
        setMessage(`Loaded ${file.path}`);
      } catch (error) {
        setMessage(error.message);
      } finally {
        setBusy((current) => ({ ...current, loadingFile: false }));
      }
    },
    [selectedProjectId]
  );

  useEffect(() => {
    loadBackendStatus().then(setBackendStatus);
    refreshProjects().catch((error) => setMessage(error.message));
  }, [refreshProjects]);

  useEffect(() => {
    refreshTree(selectedProjectId).catch((error) => setMessage(error.message));
  }, [refreshTree, selectedProjectId]);

  const handleCreateProject = async (name) => {
    setBusy((current) => ({ ...current, creatingProject: true }));

    try {
      const project = await createWorkspaceProject(name);
      await refreshProjects();
      setSelectedProjectId(project.id);
      setMessage(`Created ${project.name}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy((current) => ({ ...current, creatingProject: false }));
    }
  };

  const handleUploadFiles = async (fileList) => {
    if (!selectedProjectId) {
      setMessage('Create or select a project first.');
      return;
    }

    const entries = Array.from(fileList ?? []);

    if (entries.length === 0) {
      return;
    }

    setBusy((current) => ({ ...current, uploading: true }));

    try {
      const results = await Promise.allSettled(
        entries.map(async (file) => ({
          path: file.webkitRelativePath || file.name,
          content: await file.text()
        }))
      );

      const uploadable = results
        .filter((result) => result.status === 'fulfilled')
        .map((result) => result.value);

      if (uploadable.length === 0) {
        throw new Error('No readable text files were selected');
      }

      await uploadWorkspaceFiles(selectedProjectId, uploadable);
      const nextTree = await refreshTree(selectedProjectId);
      setMessage(`Uploaded ${uploadable.length} file${uploadable.length > 1 ? 's' : ''}`);

      if (!selectedFile) {
        const firstFile = nextTree?.files?.[0];

        if (firstFile) {
          await handleSelectFile(firstFile.path);
        }
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy((current) => ({ ...current, uploading: false }));
    }
  };

  const handleSaveFile = async () => {
    if (!selectedProjectId || !selectedFile) {
      return;
    }

    setBusy((current) => ({ ...current, savingFile: true }));

    try {
      const file = await saveWorkspaceFile(selectedProjectId, {
        path: selectedFile.path,
        content: editorValue
      });

      setSelectedFile(file);
      setSavedValue(file.content);
      setMessage(`Saved ${file.path}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy((current) => ({ ...current, savingFile: false }));
    }
  };

  return (
    <EditorLayout
      backendStatus={backendStatus}
      busy={busy}
      editorLanguage={selectedFile ? inferLanguage(selectedFile.path) : 'plaintext'}
      editorValue={editorValue}
      isDirty={isDirty}
      message={message}
      onCreateProject={handleCreateProject}
      onEditorChange={setEditorValue}
      onProjectChange={setSelectedProjectId}
      onSaveFile={handleSaveFile}
      onSelectFile={handleSelectFile}
      onUploadFiles={handleUploadFiles}
      projects={projects}
      selectedFile={selectedFile}
      selectedProject={selectedProject}
      tree={tree}
    />
  );
}
