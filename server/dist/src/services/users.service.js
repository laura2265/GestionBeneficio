"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = exports.userUpdateSchema = exports.userCreateSchema = void 0;
const db_1 = require("../db");
const zod_1 = require("zod");
exports.userCreateSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string().optional(),
});
exports.userUpdateSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(3).optional(),
    phone: zod_1.z.string().optional()
});
class UsersService {
    static async list({ page = 1, size = 10, onlyActive = true }) {
        const skip = (page - 1) * size;
        const where = onlyActive ? { is_active: true } : undefined;
        const [items, total] = await Promise.all([
            db_1.prisma.users.findMany({
                where,
                skip,
                take: size,
                orderBy: { id: 'desc' }
            }),
            db_1.prisma.users.count({ where })
        ]);
        return {
            items,
            total,
            page,
            size
        };
    }
    static async get(id) {
        const user = await db_1.prisma.users.findUnique({
            where: { id }
        });
        if (!user)
            throw { status: 404, message: 'Usuario no encontrado' };
        return user;
    }
    static async create(payload) {
        const data = exports.userCreateSchema.parse(payload);
        return db_1.prisma.users.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                is_active: true
            }
        });
    }
    static async update(id, payload) {
        const data = exports.userUpdateSchema.parse(payload);
        return db_1.prisma.user.update({
            where: { id },
            data: {
                ...(data.fullName ? { fullName: data.fullName } : {}),
                ...(data.phone ? { phone: data.phone } : {})
            }
        });
    }
    static async deactivate(id) {
        return db_1.prisma.users.update({
            where: { id },
            data: {
                is_active: false
            }
        });
    }
}
exports.UsersService = UsersService;
