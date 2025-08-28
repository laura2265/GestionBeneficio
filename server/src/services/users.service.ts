import { prisma } from "../db.js";
import { z } from "zod";

export const userCreateSchema = z.object({
    full_name: z.string().min(3),
    email: z.string().email(),
    phone: z.string().optional(),
});

export const userUpdateSchema = z.object({
    fullName: z.string().min(3).optional(),
    phone: z.string().optional()
})

export class UsersService{
    static async list({
        page = 1, size=10, onlyActive = true
    }){
        const skip = (page - 1) * size;
        const where = onlyActive ? { is_active: true }: undefined;
        const [items, total] = await Promise.all([
            prisma.users.findMany({
                where,
                skip,
                take: size,
                orderBy: {id: 'desc'}
            }),
            prisma.users.count({where})
        ])
        return{
            items,
            total,
            page,
            size
        };
    }
    static async get(id: number){
        const user= await prisma.users.findUnique({
            where: {id}
        });
        if(!user) throw {status: 404, message: 'Usuario no encontrado'};
        return user;
    }
    static async create(payload: unknown) {
      const data = userCreateSchema.parse(payload);
      return prisma.users.create({
        data: {
          full_name: data.full_name,        
          email: data.email,
          phone: data.phone ?? null,
          is_active: true,
        }
      });
    }

    static async update(id: number, payload: unknown){
        const data = userUpdateSchema.parse(payload);
        return prisma.user.update({
            where: {id},
            data: {
                ...(data.fullName ? {fullName: data.fullName}:{}),
                ...(data.phone ? {phone: data.phone} : {})
            }
        });
    }

    static async deactivate(id: number){
        return prisma.users.update({
            where: {id},
            data: {
                is_active: false
            }
        })
    }

}