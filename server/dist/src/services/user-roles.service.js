"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoleService = void 0;
const db_1 = require("../db");
class UserRoleService {
    static listByUser(userId) {
        return db_1.prisma.user_roles.findMany({
            where: {
                user_id: userId
            },
            includes: {
                roles: true,
                users: true
            }
        });
    }
    static assign(userId, roleId) {
        return db_1.prisma.user_roles.create({
            data: {
                user_id: userId,
                role_id: roleId
            }
        });
    }
    static unassign(userId, roleId) {
        return db_1.prisma.user_roles.delete({
            where: {
                user_id_role_id: {
                    user_id: userId,
                    role_id: roleId
                }
            }
        });
    }
}
exports.UserRoleService = UserRoleService;
