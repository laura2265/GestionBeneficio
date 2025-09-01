import { prisma } from '../db.js';
import { auditCreateSchema, auditUpdateScheme } from "../Schemas/audit.schema.js";
const toBigInt = (v) => (v === null || v === undefined || v === '') ? null : BigInt(v);
export class AuditService {
    static async list({ userId, page = 1, size = 20, }) {
        const pageNum = Number.isFinite(page) && page > 0 ? Number(page) : 1;
        const sizeNum = Number.isFinite(size) && size > 0 ? Number(size) : 20;
        const skip = (pageNum - 1) * sizeNum;
        const where = {};
        if (userId)
            where.user_id = toBigInt(userId);
        const [items, total] = await Promise.all([
            prisma.audit_log.findMany({
                where,
                skip,
                take: sizeNum,
                orderBy: { id: 'desc' },
            }),
            prisma.audit_log.count({ where }),
        ]);
        return {
            items,
            total,
            page: pageNum,
            size: sizeNum,
            pages: Math.ceil(total / sizeNum) || 1,
        };
    }
    static async get(id) {
        const bid = toBigInt(id);
        const item = await prisma.audit_log.findUnique({
            where: { id: bid },
        });
        if (!item)
            throw { status: 404, message: 'Registro de auditoría no encontrado' };
        return item;
    }
    static async create(payload) {
        const result = auditCreateSchema.parse(payload);
        return prisma.audit_log.create({
            data: {
                user_id: toBigInt(result.user_id), // BigInt o null
                action: result.action,
                entity: result.entity,
                entity_id: toBigInt(result.entity_id), // BigInt o null
                details: (() => {
                    const d = result.details;
                    if (d === undefined || d === null)
                        return null;
                    return typeof d === 'string' ? d : JSON.stringify(d);
                })(),
            },
        });
    }
    static async update(id, payload) {
        const bid = toBigInt(id);
        const dataParsed = auditUpdateScheme.parse(payload);
        const data = {};
        if ('user_id' in dataParsed)
            data.user_id = toBigInt(dataParsed.user_id);
        if ('action' in dataParsed)
            data.action = dataParsed.action;
        if ('entity' in dataParsed)
            data.entity = dataParsed.entity;
        if ('entity_id' in dataParsed)
            data.entity_id = toBigInt(dataParsed.entity_id);
        if ('details' in dataParsed) {
            const d = dataParsed.details;
            data.details = d === undefined || d === null ? null : (typeof d === 'string' ? d : JSON.stringify(d));
        }
        return prisma.audit_log.update({
            where: { id: bid },
            data,
        });
    }
}
