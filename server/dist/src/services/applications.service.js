"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsService = exports.applicationUpdateSchema = exports.applicationCreateSchema = void 0;
const db_1 = require("../db");
const zod_1 = __importDefault(require("zod"));
exports.applicationCreateSchema = zod_1.default.object({
    nombre: zod_1.default.string().min(3),
    apellidos: zod_1.default.string().min(3),
    tipo_documento: zod_1.default.enum(['CC', 'CE', 'PAS', 'NIT', 'OTRO']),
    numero_documento: zod_1.default.string().min(3).max(10),
    direccion: zod_1.default.string().min(3),
    barrio: zod_1.default.string().min(2),
    correo: zod_1.default.string().email().optional(),
    numero_contacto: zod_1.default.string().optional(),
    estrato_id: zod_1.default.number().int().optional(),
    declaracion_juramental: zod_1.default.boolean().default(false),
    estado: zod_1.default.enum(['BORRADOR', 'ENVIADA', 'APROVADA', 'RECHAZADA']).default('BORRADOR'),
    tecnico_id: zod_1.default.number().int().optional(),
    enviada_at: zod_1.default.string().datetime().optional(),
    revisada_at: zod_1.default.string().datetime().optional(),
    aprobada_at: zod_1.default.string().datetime().optional(),
    rechazada_at: zod_1.default.string().datetime().optional(),
    motivo_rechazo: zod_1.default.string().optional(),
});
exports.applicationUpdateSchema = exports.applicationCreateSchema.partial();
class ApplicationsService {
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
            db_1.prisma.applications.findMany({
                where,
                skip,
                take: size,
                orderBy: { id: 'desc' }
            }),
            db_1.prisma.applications.count({ where })
        ]);
        return {
            items,
            total,
            page,
            size
        };
    }
    static async get(id) {
        const item = await db_1.prisma.applications.findUnique({ where: { id } });
        if (!item) {
            throw { status: 404, message: 'Solicitud no encontrada' };
        }
        return item;
    }
    static async create(payload) {
        const data = exports.applicationCreateSchema.parse(payload);
        return db_1.prisma.applications.create({ data });
    }
    static async update(id, payload) {
        const data = exports.applicationUpdateSchema.parse(payload);
        return db_1.prisma.applications.update({ where: { id }, data });
    }
    static async deactivate(id) {
        return db_1.prisma.applications.update({
            where: { id },
            data: { is_active: false }
        });
    }
}
exports.ApplicationsService = ApplicationsService;
