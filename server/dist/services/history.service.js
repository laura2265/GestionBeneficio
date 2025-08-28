import { historyCreateSchema, historyUpdateSchema } from "../Schemas/history.schema.js";
import { prisma } from "../db.js";
export class HistoryService {
    static async list({ appId }) {
        const where = {};
        if (appId)
            where.application_id = appId;
        return prisma.application_history.findMany({
            where: { application_id: appId },
            orderBy: [{ changed_at: 'desc' }]
        });
    }
    static async create(payload) {
        const data = historyCreateSchema.parse(payload);
        return prisma.application_history.create({ data });
    }
    static async update(id, payload) {
        const data = historyUpdateSchema.parse(payload);
        return prisma.application_history.update({
            where: { id },
            data
        });
    }
}
