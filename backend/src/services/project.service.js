import { prisma } from './database.service.js';
import { HttpError } from '../utils/http-error.js';

const DEFAULT_USER_EMAIL = 'owner@proj-sart.local';

export async function listProjects() {
  return prisma.project.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          files: true
        }
      }
    }
  });
}

export async function createProject({ name, userEmail }) {
  const email = userEmail ?? DEFAULT_USER_EMAIL;

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email }
  });

  return prisma.project.create({
    data: {
      name,
      userId: user.id
    },
    include: {
      _count: {
        select: {
          files: true
        }
      }
    }
  });
}

export async function getProjectOrThrow(projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new HttpError(404, 'Project not found');
  }

  return project;
}

