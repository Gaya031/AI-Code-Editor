const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

async function request(pathname, options = {}) {
  const response = await fetch(`${API_BASE_URL}${pathname}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? 'Request failed');
  }

  return payload;
}

export async function getBackendHealth() {
  return request('/health', {
    method: 'GET'
  });
}

export async function fetchProjects() {
  return request('/projects', {
    method: 'GET'
  });
}

export async function createProject(body) {
  return request('/projects', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export async function fetchProjectFiles(projectId) {
  return request(`/projects/${projectId}/files`, {
    method: 'GET'
  });
}

export async function fetchFileContent(projectId, filePath) {
  const query = new URLSearchParams({ path: filePath });

  return request(`/projects/${projectId}/files/content?${query.toString()}`, {
    method: 'GET'
  });
}

export async function uploadFiles(projectId, body) {
  return request(`/projects/${projectId}/files/upload`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

export async function saveFileContent(projectId, body) {
  return request(`/projects/${projectId}/files/content`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
}

