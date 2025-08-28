import { prisma } from "../db.js";
import { pdfCreateSchema, pdfUpdateSchema } from "../Schemas/pdfs.schema.js";
export class PdfsService {
    static async list({ appId }) {
        const where = {};
        if (appId)
            where.application_id = appId;
        return prisma.application_pdfs.findMany({ where, orderBy: [{ application_id: 'desc' }, { version: 'desc' }] });
    }
    static async get(id) {
        const item = await prisma.application_pdfs.findUnique({ where: { id } });
        if (!item) {
            throw { status: 404, message: 'PDF no encontrado ' };
        }
        return item;
    }
    static async create(payload) {
        const data = pdfCreateSchema.parse(payload);
        return prisma.application_pdfs.create({ data });
    }
    static async update(id, payload) {
        const data = pdfUpdateSchema.parse(payload);
        return prisma.application_pdfs.update({ where: { id, data } });
    }
    static async remove(id) {
        return prisma.application_pdfs.delete({ where: { id } });
    }
}
