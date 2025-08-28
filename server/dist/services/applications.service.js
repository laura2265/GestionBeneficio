import { prisma } from "../db.js";
import z from "zod";
export const applicationCreateSchema = z.object({
    nombre: z.string().min(3),
    apellidos: z.string().min(3),
    tipo_documento: z.enum(['CC', 'CE', 'PAS', 'NIT', 'OTRO']),
    numero_documento: z.string().min(3).max(10),
    direccion: z.string().min(3),
    barrio: z.string().min(2),
    correo: z.string().email().optional(),
    numero_contacto: z.string().optional(),
    estrato_id: z.number().int().optional(),
    declaracion_juramental: z.boolean().default(false),
    estado: z.enum(['BORRADOR', 'ENVIADA', 'APROVADA', 'RECHAZADA']).default('BORRADOR'),
    tecnico_id: z.number().int().optional(),
    enviada_at: z.string().datetime().optional(),
    revisada_at: z.string().datetime().optional(),
    aprobada_at: z.string().datetime().optional(),
    rechazada_at: z.string().datetime().optional(),
    motivo_rechazo: z.string().optional(),
});
export const applicationUpdateSchema = applicationCreateSchema.partial();
export class ApplicationsService {
    static async list({ page = 1, size = 10, estado, tecnicoId, supervisorId }) {
        const skip = (page - 1) * size;
        const where = {};
        if (estado)
            where.estado = estado;
        if (tecnicoId)
            where.tecnico_id = tecnicoId;
        if (supervisorId)
            where.supervisor_id = supervisorId;
        const [items, total] = await Promise.all([
            prisma.applications.findMany({
                where,
                skip,
                take: size,
                orderBy: { id: 'desc' }
            }),
            prisma.applications.count({ where })
        ]);
        return {
            items,
            total,
            page,
            size
        };
    }
    static async get(id) {
        const item = await prisma.applications.findUnique({ where: { id } });
        if (!item) {
            throw { status: 404, message: 'Solicitud no encontrada' };
        }
        return item;
    }
    static async create(payload) {
        const data = applicationCreateSchema.parse(payload);
        return prisma.applications.create({ data });
    }
    static async update(id, payload) {
        const data = applicationUpdateSchema.parse(payload);
        return prisma.applications.update({ where: { id }, data });
    }
    static async deactivate(id) {
        return prisma.applications.update({
            where: { id },
            data: { is_active: false }
        });
    }
}
