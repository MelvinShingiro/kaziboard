import type { CreateProjectInput } from "./projects.schema";
import {prisma} from "../../config/db"


export async function createProject(input: CreateProjectInput, ownerId: number) {
  const { name, description } = input;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId,
      columns: {
        create: [
          { name: "To Do", position: 1 },
          { name: "In Progress", position: 2 },
          { name: "Done", position: 3 },
        ],
      },
    },
  });

  return project;
}


export async function getUserProjects(ownerId: number) {
  const projects = await prisma.project.findMany({
    where: {
      ownerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return projects;
}

export async function getProjectById(projectId: number, ownerId: number) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
}


export async function deleteProject() {}