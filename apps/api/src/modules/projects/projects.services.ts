import type { CreateProjectInput } from "./projects.schema";
import {prisma} from "../../config/db"


export async function createProject(input:CreateProjectInput, ownerId: number) {
        const {name, description} = input;

        const project = await prisma.project.create({
                data: {
                        name: name,
                        description: description,
                        ownerId,
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

export async function getProjectById() {}


export async function deleteProject() {}