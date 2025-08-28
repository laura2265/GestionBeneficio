"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const db_1 = require("../db");
const file_schema_1 = require("../Schemas/file.schema");
class FilesService {
    static async list({ appId, page = 1, size = 20 }) {
        const skip = (page - 1) * size;
        const where = {};
        if (appId)
            where.application_id = appId;
        const [items, total] = await Promise.all([
            db_1.prisma.application_files.findMany({ where, skip, take: size, orderBy: { id: 'desc' } }),
            db_1.prisma.application_files.count({ where })
        ]);
        return { items, total, page, size };
    }
    static async get(id) {
        const item = await db_1.prisma.application_files.findUnique({ where: { id } });
        if (!item) {
            throw { status: 404, message: 'Archivo no encontrado' };
        }
        return item;
    }
    static async create(payload) {
        const data = file_schema_1.fileCreateSchema.parse(payload);
        return db_1.prisma.application_files.create({ data });
    }
    static async update(id, payload) {
        const data = file_schema_1.fileUpdateSchema.parse(payload);
        return db_1.prisma.application_files.update({
            where: { id },
            data,
        });
    }
    static async remove(id) {
        return db_1.prisma.application_files.delete({
            where: { id }
        });
    }
}
exports.FilesService = FilesService;
