import request from "supertest";
import app from "../app";
import { prisma } from "../config/db";

const TEST_PREFIX = "jest-kaziboard";

export function buildTestEmail(label: string) {
  return `${TEST_PREFIX}-${label}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}@example.com`;
}

export async function registerTestUser(label: string) {
  const email = buildTestEmail(label);
  const password = "Password123!";

  const response = await request(app).post("/api/auth/register").send({
    name: "Jest User",
    email,
    password,
  });

  return {
    email,
    password,
    response,
    token: response.body.token as string,
    user: response.body.user,
  };
}

export async function createProjectForToken(token: string, name = "Test Project") {
  const response = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name,
      description: "Created by tests",
    });

  return response;
}

export async function getBoardForProject(token: string, projectId: number) {
  return request(app)
    .get(`/api/projects/${projectId}/board`)
    .set("Authorization", `Bearer ${token}`);
}

export async function cleanupTestData() {
  const testUsers = await prisma.user.findMany({
    where: {
      email: {
        startsWith: TEST_PREFIX,
      },
    },
    select: {
      id: true,
    },
  });

  const userIds = testUsers.map((user) => user.id);

  if (userIds.length === 0) {
    return;
  }

  const testProjects = await prisma.project.findMany({
    where: {
      ownerId: {
        in: userIds,
      },
    },
    select: {
      id: true,
    },
  });

  const projectIds = testProjects.map((project) => project.id);

  if (projectIds.length > 0) {
    const testColumns = await prisma.column.findMany({
      where: {
        projectId: {
          in: projectIds,
        },
      },
      select: {
        id: true,
      },
    });

    const columnIds = testColumns.map((column) => column.id);

    if (columnIds.length > 0) {
      await prisma.card.deleteMany({
        where: {
          columnId: {
            in: columnIds,
          },
        },
      });
    }

    await prisma.column.deleteMany({
      where: {
        projectId: {
          in: projectIds,
        },
      },
    });

    await prisma.project.deleteMany({
      where: {
        id: {
          in: projectIds,
        },
      },
    });
  }

  await prisma.user.deleteMany({
    where: {
      id: {
        in: userIds,
      },
    },
  });
}

export async function disconnectTestDb() {
  await prisma.$disconnect();
}
