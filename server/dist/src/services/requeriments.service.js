"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequerimentsService = void 0;
const db_1 = require("../db");
const requeriments_schema_1 = require("../Schemas/requeriments.schema");
class RequerimentsService {
    static async list() {
        return db_1.prisma.application_requeriments.findMany({ orderBy: { id: 'asc' } });
    }
    static async get(id) {
        const item = await db_1.prisma.application_requeriments.findUnique({ where: { id } });
        if (!item) {
            throw {
                status: 404,
                message: 'Requisito no encontrado'
            };
        }
        return item;
    }
    static async create(payload) {
        const data = requeriments_schema_1.requerimentCreateSchema.parse(payload);
        return db_1.prisma.application_requeriments.create({ data });
    }
    static async update(id, payload) {
        const data = requeriments_schema_1.requirementUpdateSchema.parse(payload);
        return db_1.prisma.application_requeriments.update({
            where: { id },
            data,
        });
    }
    static async remove(id) {
        return db_1.prisma.application_requeriments.delete({
            where: { id }
        });
    }
}
exports.RequerimentsService = RequerimentsService;
