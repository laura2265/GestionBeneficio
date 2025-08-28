import { prisma } from "../db.js";
import { fileCreateSchema, fileUpdateSchema } from "../Schemas/file.schema.js";
export class FilesService {
    static async list({ appId, page = 1, size = 20 }) {
        const skip = (page - 1) * size;
        const where = {};
        if (appId)
            where.application_id = appId;
        const [items, total] = await Promise.all([
            prisma.application_files.findMany({ where, skip, take: size, orderBy: { id: 'desc' } }),
            prisma.application_files.count({ where })
        ]);
        return { items, total, page, size };
    }
    static async get(id) {
        const item = await prisma.application_files.findUnique({ where: { id } });
        if (!item) {
            throw { status: 404, message: 'Archivo no encontrado' };
        }
        return item;
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
