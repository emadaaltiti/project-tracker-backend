"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.ProjectService = {
    async getProjects(userId) {
        return prisma.project.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    },
    async getProjectById(id, userId) {
        return prisma.project.findFirst({
            where: { id, userId },
        });
    },
    async createProject(userId, data) {
        return prisma.project.create({
            data: {
                title: data.title,
                description: data.description || "",
                status: data.status || "active",
                userId,
            },
        });
    },
    async updateProject(id, userId, data) {
        const project = await prisma.project.findFirst({
            where: { id, userId },
        });
        if (!project)
            throw new Error("Project not found or unauthorized");
        return prisma.project.update({
            where: { id },
            data,
        });
    },
    async deleteProject(id, userId) {
        const project = await prisma.project.findFirst({
            where: { id, userId },
        });
        if (!project)
            throw new Error("Project not found or unauthorized");
        return prisma.project.delete({ where: { id } });
    },
};
