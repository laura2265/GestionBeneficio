import { prisma } from "../db.js";
import { requerimentCreateSchema, requirementUpdateSchema } from "../Schemas/requeriments.schema.js";
export class RequerimentsService {
    static async list() {
        return prisma.application_requeriments.findMany({ orderBy: { id: 'asc' } });
    }
    static async get(id) {
        const item = await prisma.application_requeriments.findUnique({ where: { id } });
        if (!item) {
            throw {
                status: 404,
                message: 'Requisito no encontrado'
            };
        }
        return item;
    }
    static async create(payload) {
        const data = requerimentCreateSchema.parse(payload);
        return prisma.application_requeriments.create({ data });
    }
    static async update(id, payload) {
        const data = requirementUpdateSchema.parse(payload);
        return prisma.application_requeriments.update({
            where: { id },
            data,
        });
    }
    static async remove(id) {
        return prisma.application_requeriments.delete({
            where: { id }
        });
    }
}
