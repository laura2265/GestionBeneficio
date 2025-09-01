// rbac.service.ts
import { prisma } from "../db.js";
export async function hasRole(userId, code) {
    return !!(await prisma.user_roles.findFirst({
        where: {
            user_id: BigInt(userId),
            roles: { is: { code } },
        },
        include: { roles: true },
    }));
}
export async function ensureRole(userId, code) {
    // BYPASS en desarrollo
    if (process.env.DEV_NOAUTH === 'true')
        return;
    const ok = await hasRole(userId, code);
    if (!ok) {
        const err = new Error('No autorizado');
        err.status = 403;
        throw err;
    }
}
