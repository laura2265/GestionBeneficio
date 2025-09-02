import { prisma } from "../db.js";
import { z } from "zod";
import argon2 from "argon2";
export const userCreateSchema = z.object({
    full_name: z.string().min(3),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string(),
    role_id: z.number().int().positive().optional(),
    role_code: z.enum(["ADIM", "SUPERVISOR", "TECNICO"]).optional
});
export const userUpdateSchema = z.object({
    fullName: z.string().min(3).optional(),
    phone: z.string().optional()
});
export class UsersService {
    static async list({ page = 1, size = 10, onlyActive = true }) {
        const skip = (page - 1) * size;
        const where = onlyActive ? { is_active: true } : undefined;
        const [items, total] = await Promise.all([
            prisma.users.findMany({
                where,
                skip,
                take: size,
                orderBy: { id: 'desc' }
            }),
            prisma.users.count({ where })
        ]);
        return {
            items,
            total,
            page,
            size
        };
    }
    static async get(id) {
        const user = await prisma.users.findUnique({
            where: { id }
        });
        if (!user)
            throw { status: 404, message: 'Usuario no encontrado' };
        return user;
    }
    static async create(data) {
        return prisma.$transaction(async (tx) => {
            const email = data.email.trim().toLowerCase();
            const hash = await argon2.hash(data.password, { type: argon2.argon2d });
            const user = await tx.users.create({
                data: {
                    full_name: data.full_name,
                    email,
                    ...(data.phone ? { phone: data.phone } : {}),
                    password: hash,
                },
                select: {
                    id: true, full_name: true, email: true, phone: true,
                    is_active: true, created_at: true, updated_at: true,
                },
            });
            let roleIdToAssign = null;
            if (data.role_id) {
                roleIdToAssign = data.role_id;
            }
            else if (data.role_code) {
                const role = await tx.roles.findUnique({ where: { code: data.role_code } });
                if (!role)
                    throw new Error(`Rol no encontrado: ${data.role_code}`);
                roleIdToAssign = role.id;
            }
            else {
                const def = await tx.roles.findUnique({ where: { code: "TECNICO" } });
                roleIdToAssign = def?.id ?? null;
            }
            if (roleIdToAssign) {
                await tx.user_roles.create({
                    data: { user_id: user.id, role_id: roleIdToAssign }
                });
            }
            return user;
        });
    }
    static async update(id, payload) {
        const data = userUpdateSchema.parse(payload);
        return prisma.users.update({
            where: { id },
            data: {
                ...(data.fullName ? { fullName: data.fullName } : {}),
                ...(data.phone ? { phone: data.phone } : {})
            }
        });
    }
    static async deactivate(id) {
        return prisma.users.update({
            where: { id },
            data: {
                is_active: false
            }
        });
    }
}
