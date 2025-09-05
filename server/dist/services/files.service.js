import { prisma } from "../db.js";
import { fileCreateSchema, fileUpdateSchema } from "../Schemas/file.schema.js";
export class FilesService {
    static async listByApplicationId(applicationId) {
        const files = await prisma.application_files.findMany({
            where: { application_id: applicationId },
            orderBy: { id: 'desc' }
        });
        return files;
    }
    static async create(payload) {
        const data = fileCreateSchema.parse(payload);
        return prisma.application_files.create({ data });
    }
    static async update(id, payload) {
        const data = fileUpdateSchema.parse(payload);
        return prisma.application_files.update({
            where: { id },
            data,
        });
    }
    static async remove(id) {
        return prisma.application_files.delete({
            where: { id }
        });
    }
}
