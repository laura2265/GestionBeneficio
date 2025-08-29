import { prisma } from "../db.js";
import { z } from "zod";
import { UserRoleService } from "./user-roles.service.js";
import { PrismaClient } from "@prisma/client/extension";

export const userCreateSchema = z.object({
    full_name: z.string().min(3),
    email: z.string().email(),
    phone: z.string().optional(),
    role_id: z.number().int().positive().optional(),
    role_code:  z.enum(["ADIM","SUPERVISOR","TECNICO"]).optional
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

    static async create(data: z.infer<typeof userCreateSchema>) {
    return prisma.$transaction(async (tx: PrismaClient) => {
      // 1) Crear usuario
      const user = await tx.users.create({
        data: {
          full_name: data.full_name,
          email: data.email,
          ...(data.phone ? { phone: data.phone } : {})
        }
      });

      // 2) Resolver el role a asignar (por id, por code o default)
      let roleIdToAssign: number | null = null;

      if (data.role_id) {
        roleIdToAssign = data.role_id;
      } else if (data.role_code) {
        const role = await tx.roles.findUnique({ where: { code: data.role_code } });
        if (!role) throw new Error(`Rol no encontrado: ${data.role_code}`);
        roleIdToAssign = role.id;
      } else {
        // Rol por defecto si no envían nada (cámbialo si quieres)
        const def = await tx.roles.findUnique({ where: { code: "TECNICO" } });
        roleIdToAssign = def?.id ?? null;
      }

      // 3) Guardar en user_roles
      if (roleIdToAssign) {
        await tx.user_roles.create({
          data: { user_id: user.id, role_id: roleIdToAssign }
        });
      }

      return user;
    });
  }

    static async update(id: number, payload: unknown){
        const data = userUpdateSchema.parse(payload);
        return prisma.users.update({
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