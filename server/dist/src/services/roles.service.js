"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const db_1 = require("../db");
class RoleService {
    static list() {
        return db_1.prisma.roles.findMany({ orderBy: { id: 'asc' } });
    }
}
exports.RoleService = RoleService;
