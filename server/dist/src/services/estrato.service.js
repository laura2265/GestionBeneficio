"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstratoService = void 0;
const db_1 = require("../db");
class EstratoService {
    static async list() {
        return db_1.prisma.estrato_catalog.findMany({ orderBy: { value: 'asc' } });
    }
}
exports.EstratoService = EstratoService;
