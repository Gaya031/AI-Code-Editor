import {
  createProject,
  fetchFileContent,
  fetchProjectFiles,
  fetchProjects,
  getBackendHealth,
  saveFileContent,
  uploadFiles
} from '../model/api/backend.api.js';

export async function loadBackendStatus() {
  try {
    const result = await getBackendHealth();
    return {
      label: result.data.database.connected ? 'DB connected' : 'DB unavailable',
      healthy: result.success && result.data.database.connected,
      latencyMs: result.data.database.latencyMs
    };
  } catch {
    return {
      label: 'Backend offline',
      healthy: false,
      latencyMs: null
    };
  }
}

export async function loadProjects() {
  const result = await fetchProjects();
  return result.data.projects;
}

export async function createWorkspaceProject(name) {
  const result = await createProject({ name });
  return result.data.project;
}

export async function loadProjectTree(projectId) {
  const result = await fetchProjectFiles(projectId);
  return result.data;
}

export async function loadProjectFile(projectId, filePath) {
  const result = await fetchFileContent(projectId, filePath);
  return result.data.file;
}

export async function saveWorkspaceFile(projectId, payload) {
  const result = await saveFileContent(projectId, payload);
  return result.data.file;
}

export async function uploadWorkspaceFiles(projectId, files) {
  const result = await uploadFiles(projectId, { files });
  return result.data;
}

