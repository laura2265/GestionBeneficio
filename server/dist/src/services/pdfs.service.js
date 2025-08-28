"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfsService = void 0;
const db_1 = require("../db");
const pdfs_schema_1 = require("../Schemas/pdfs.schema");
class PdfsService {
    static async list({ appId }) {
        const where = {};
        if (appId)
            where.application_id = appId;
        return db_1.prisma.application_pdfs.findMany({ where, orderBy: [{ application_id: 'desc' }, { version: 'desc' }] });
    }
    static async get(id) {
        const item = await db_1.prisma.application_pdfs.findUnique({ where: { id } });
        if (!item) {
            throw { status: 404, message: 'PDF no encontrado ' };
        }
        return item;
    }
    static async create(payload) {
        const data = pdfs_schema_1.pdfCreateSchema.parse(payload);
        return db_1.prisma.application_pdfs.create({ data });
    }
    static async update(id, payload) {
        const data = pdfs_schema_1.pdfUpdateSchema.parse(payload);
        return db_1.prisma.application_pdfs.update({ where: { id, data } });
    }
    static async remove(id) {
        return db_1.prisma.application_pdfs.delete({ where: { id } });
    }
}
exports.PdfsService = PdfsService;
