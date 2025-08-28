"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryService = void 0;
const history_schema_1 = require("../Schemas/history.schema");
const db_1 = require("../db");
class HistoryService {
    static async list({ appId }) {
        const where = {};
        if (appId)
            where.application_id = appId;
        return db_1.prisma.application_history.findMany({
            where: { application_id: appId },
            orderBy: [{ changed_at: 'desc' }]
        });
    }
    static async create(payload) {
        const data = history_schema_1.historyCreateSchema.parse(payload);
        return db_1.prisma.application_history.create({ data });
    }
    static async update(id, payload) {
        const data = history_schema_1.historyUpdateSchema.parse(payload);
        return db_1.prisma.application_history.update({
            where: { id },
            data
        });
    }
}
exports.HistoryService = HistoryService;
