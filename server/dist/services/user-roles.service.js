import { prisma } from "../db.js";
export class UserRoleService {
    static list(userId) {
        return prisma.user_roles.findMany({
            where: { user_id: userId },
            include: {
                roles: true,
                users: true
            }
        });
    }
    static assign(userId, roleId) {
        return prisma.user_roles.create({
            data: { user_id: userId, role_id: roleId }
        });
    }
    static unassign(userId, roleId) {
        return prisma.user_roles.delete({
            where: { user_id_role_id: { user_id: userId, role_id: roleId } }
        });
    }
}
