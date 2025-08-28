import { prisma } from "../db.js";
import { auditCreateSchema, auditUpdateScheme } from "../Schemas/audit.schema.js";
export class AuditService {
    static async list({ userId, page = 1, size = 20 }) {
        const skip = (page - 1) * 1;
        const where = {};
        if (userId)
            where.user_id = userId;
        const [items, total] = await Promise.all([
            prisma.audit_log.findMany({
                where,
                skip,
                take: size,
                orderBy: {
                    id: 'desc'
                }
            }),
            prisma.audit_log.count({ where })
        ]);
        return {
            items,
            total,
            page,
            size
        };
    }
    static async get(id) {
        const item = await prisma.audit_log.findUnique({ where: { id } });
        if (!item)
            throw { status: 404, message: 'Registro de auditoria no encontrado' };
        return item;
    }
    static async create(payload) {
        const data = auditCreateSchema.parse(payload);
        return prisma.audit_log.findMany({ data });
    }
    static async update(id, payload) {
        const data = auditUpdateScheme.parse(payload);
        return prisma.audit_log.findMany({ where: { id }, data });
    }
}
