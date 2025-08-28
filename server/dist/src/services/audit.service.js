"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const db_1 = require("../db");
const audit_schema_1 = require("../Schemas/audit.schema");
class AuditService {
    static async list({ userId, page = 1, size = 20 }) {
        const skip = (page - 1) * 1;
        const where = {};
        if (userId)
            where.user_id = userId;
        const [items, total] = await Promise.all([
            db_1.prisma.audit_log.findMany({
                where,
                skip,
                take: size,
                orderBy: {
                    id: 'desc'
                }
            }),
            db_1.prisma.audit_log.count({ where })
        ]);
        return {
            items,
            total,
            page,
            size
        };
    }
    static async get(id) {
        const item = await db_1.prisma.audit_log.findUnique({ where: { id } });
        if (!item)
            throw { status: 404, message: 'Registro de auditoria no encontrado' };
        return item;
    }
    static async create(payload) {
        const data = audit_schema_1.auditCreateSchema.parse(payload);
        return db_1.prisma.audit_log.findMany({ data });
    }
    static async update(id, payload) {
        const data = audit_schema_1.auditUpdateScheme.parse(payload);
        return db_1.prisma.audit_log.findMany({ where: { id }, data });
    }
}
exports.AuditService = AuditService;
