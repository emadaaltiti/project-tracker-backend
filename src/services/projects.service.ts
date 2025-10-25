import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const ProjectService = {
  async getProjects(userId: string) {
    return prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProjectById(id: string, userId: string) {
    return prisma.project.findFirst({
      where: { id, userId },
    });
  },

  async createProject(userId: string, data: { title: string; description?: string; status?: string }) {
    return prisma.project.create({
      data: {
        title: data.title,
        description: data.description || "",
        status: data.status || "active",
        userId,
      },
    });
  },

  async updateProject(id: string, userId: string, data: { title?: string; description?: string; status?: string }) {
    const project = await prisma.project.findFirst({
      where: { id, userId },
    });
    if (!project) throw new Error("Project not found or unauthorized");

    return prisma.project.update({
      where: { id },
      data,
    });
  },

  async deleteProject(id: string, userId: string) {
    const project = await prisma.project.findFirst({
      where: { id, userId },
    });
    if (!project) throw new Error("Project not found or unauthorized");

    return prisma.project.delete({ where: { id } });
  },
};
