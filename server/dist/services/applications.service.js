import { prisma } from "../db.js";
import z from "zod";
import { ensureRole, hasRole } from "./rbac.service.js";
export const applicationCreateSchema = z.object({
    nombres: z.string().min(2),
    apellidos: z.string().min(2),
    tipo_documento: z.enum(["CC", "CE", "PAS", "NIT", "OTRO"]),
    numero_documento: z.string().min(3).max(50),
    direccion: z.string().min(3).optional(),
    barrio: z.string().min(2),
    correo: z.string().email().optional(),
    numero_contacto: z.string().optional(),
    estrato_id: z.number().int().optional(),
    declaracion_juramentada: z.boolean().default(false),
    UPZ: z.string().min(2).optional(),
    tecnico_id: z.number().int().optional(),
    supervisor_id: z.number().int().optional(),
});
export const applicationUpdateSchema = applicationCreateSchema.partial();
export class ApplicationsService {
    static async list(currentApplicationId, { page = 1, size = 10, estado } = {}) {
        const skip = (page - 1) * size;
        const isSupervisor = await (currentApplicationId);
        const where = {};
        if (estado)
            where.estado = estado;
        if (!isSupervisor)
            where.tecnico_id = BigInt(currentApplicationId);
        const [items, total] = await Promise.all([
            prisma.applications.findMany({ where, skip, take: size, orderBy: { id: "desc" } }),
            prisma.applications.count({ where }),
        ]);
        return { items, total, page, size };
    }
    static async get(id) {
        const item = await prisma.applications.findUnique({ where: { id } });
        if (!item) {
            throw { status: 404, message: 'Aplicación no encontrada' };
        }
        return item;
    }
    // UPDATE solo BORRADOR del técnico dueño
    static async update(id, payload, currentUserId) {
        await ensureRole(currentUserId, "TECNICO");
        const app = await prisma.applications.findUnique({ where: { id: BigInt(id) } });
        if (!app)
            throw { status: 404, message: "Solicitud no encontrada" };
        if (app.tecnico_id !== BigInt(currentUserId))
            throw { status: 403, message: "No puedes editar esta solicitud" };
        if (app.estado !== "BORRADOR")
            throw { status: 400, message: "Solo se puede editar en BORRADOR" };
        const data = applicationUpdateSchema.parse(payload);
        return prisma.applications.update({ where: { id: app.id }, data });
    }
    static async listForUser(userId) {
        const isSupervisor = await prisma.user_roles.findFirst({
            where: {
                user_id: BigInt(userId),
                roles: { is: { code: "SUPERVISOR" } }
            }
        });
        if (isSupervisor) {
            return prisma.applications.findMany({ orderBy: { id: 'desc' } });
        }
        return prisma.applications.findMany({
            where: {
                tecnico_id: BigInt(userId)
            },
            orderBy: { id: 'desc' }
        });
    }
    //Create tecnico y borrador
    static async create(payload, currentUserId) {
        await ensureRole(currentUserId, "TECNICO");
        const data = applicationCreateSchema.parse(payload);
        const tecnicoId = data.tecnico_id ?? currentUserId;
        return prisma.$transaction(async (tx) => {
            const newApp = await prisma.applications.create({
                data: {
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    tipo_documento: data.tipo_documento,
                    numero_documento: data.numero_documento,
                    direccion: data.direccion,
                    barrio: data.barrio,
                    correo: data.correo,
                    numero_contacto: data.numero_contacto,
                    estrato_id: data.estrato_id,
                    declaracion_juramentada: data.declaracion_juramentada,
                    UPZ: data.UPZ ?? "",
                    estado: "BORRADOR",
                    tecnico_id: BigInt(tecnicoId)
                }
            });
            await tx.application_history.create({
                data: {
                    application_id: newApp.id,
                    from_status: null,
                    to_status: "BORRADOR",
                    changed_by: tecnicoId,
                    comment: "Creación de la aplicación"
                }
            });
            return {
                ...newApp,
                id: newApp.id.toString(),
                tecnico_id: newApp.tecnico_id?.toString(),
            };
        });
    }
    //Cambia estado de borrador a enviado
    static async submit(appId, currentUserId) {
        await ensureRole(currentUserId, 'TECNICO');
        return prisma.$transaction(async (tx) => {
            // 1) Cargar app y validar permisos/estado
            const app = await tx.applications.findUnique({
                where: { id: BigInt(appId) },
                select: { id: true, estado: true, tecnico_id: true },
            });
            if (!app)
                throw { status: 404, message: 'Aplicación no encontrada' };
            if (app.tecnico_id !== BigInt(currentUserId)) {
                throw { status: 403, message: 'No puedes enviar una aplicación de otro técnico' };
            }
            if (app.estado !== 'BORRADOR') {
                throw { status: 400, message: `No puedes enviar desde estado ${app.estado}` };
            }
            // 2) Verificar completitud ANTES de cambiar estado
            const complete = await ApplicationsService.isComplete(app.id, tx);
            if (!complete) {
                throw { status: 400, message: 'Faltan documentos requeridos' };
            }
            const whereSupervisor = {
                roles: { is: { code: 'SUPERVISOR' } },
            };
            const candidates = await tx.user_roles.findMany({
                where: whereSupervisor,
                select: { user_id: true },
            });
            console.log('datos: ', candidates);
            const uniqueIds = Array.from(new Set(candidates.map(r => r.user_id.toString()))).map(s => BigInt(s));
            if (uniqueIds.length === 0) {
                throw { status: 409, message: 'No hay supervisores disponibles' };
            }
            const supervisorId = uniqueIds[Math.floor(Math.random() * uniqueIds.length)];
            const updated = await tx.applications.update({
                where: { id: app.id },
                data: {
                    estado: 'ENVIADA',
                    enviada_at: new Date(),
                    supervisor_id: supervisorId,
                },
            });
            return updated;
        });
    }
    static async approve(appId, supervisorUserId, comment) {
        await ensureRole(supervisorUserId, "SUPERVISOR");
        return prisma.$transaction(async (tx) => {
            const app = await tx.applications.findUnique({ where: { id: BigInt(appId) } });
            if (!app) {
                throw { status: 404, message: "Aplicación no encontrada" };
            }
            if (app.estado !== "ENVIADA") {
                throw { status: 400, message: "Solo se puede aprobar una aplicación Enviada" };
            }
            const complete = await ApplicationsService.isComplete(app.id, tx);
            if (!complete) {
                throw { status: 400, message: "La aplicación no cumple todos los requisitos obligatorios" };
            }
            const updated = await tx.applications.update({
                where: { id: app.id },
                data: {
                    estado: "APROBADA",
                    supervisor_id: BigInt(supervisorUserId),
                    revisada_at: new Date(),
                    aprobada_at: new Date(),
                    motivo_rechazo: null,
                },
            });
            await tx.application_history.create({
                data: {
                    application_id: app.id,
                    from_status: "ENVIADA",
                    to_status: "APROBADA",
                    changed_by: BigInt(supervisorUserId),
                    comment: comment ?? "Aprobada",
                }
            });
            return updated;
        });
    }
    //Rechazar la solicitud
    static async reject(appId, supervisorUserId, comment) {
        await ensureRole(supervisorUserId, "SUPERVISOR");
        return prisma.$transaction(async (tx) => {
            const app = await tx.applications.findUnique({ where: { id: BigInt(appId) } });
            if (!app) {
                throw { status: 404, message: "Aplicación no encontrada" };
            }
            if (app.estado !== "ENVIADA") {
                throw { status: 400, message: "Solo se puede aprobar una aplicación Enviada" };
            }
            const complete = await ApplicationsService.isComplete(app.id, tx);
            if (!complete) {
                throw { status: 400, message: "La aplicación no cumple todos los requisitos obligatorios" };
            }
            const updated = await tx.applications.update({
                where: { id: app.id },
                data: {
                    estado: "RECHAZADA",
                    supervisor_id: BigInt(supervisorUserId),
                    revisada_at: new Date(),
                    aprobada_at: new Date(),
                    motivo_rechazo: null,
                },
            });
            await tx.application_history.create({
                data: {
                    application_id: app.id,
                    from_status: "ENVIADA",
                    to_status: "RECHAZADA",
                    changed_by: BigInt(supervisorUserId),
                    comment: comment ?? "rechazada",
                }
            });
            return updated;
        });
    }
    //Adjuntar PDF
    static async addFile(appId, currentUserId, file) {
        const isSupervisor = await hasRole(currentUserId, 'TECNICO');
        const app = await prisma.applications.findUnique({ where: { id: BigInt(appId) } });
        if (!app)
            throw { status: 400, message: 'Aplicación no encontrada' };
        // Regla recomendada: el TÉCNICO dueño puede adjuntar; el supervisor NO (o cámbialo a gusto)
        if (!isSupervisor && app.tecnico_id !== BigInt(currentUserId)) {
            throw { status: 403, message: 'No puedes adjuntar archivos a esta aplicación' };
        }
        return prisma.application_files.create({
            data: {
                application_id: app.id,
                kind: file.kind,
                file_name: file.file_name,
                storage_path: file.storage_path,
                mime_type: file.mime_type ?? null,
            }
        });
    }
    //version del pdf
    static async addPdf(appId, currentUserId, pdf) {
        const app = await prisma.applications.findUnique({ where: { id: BigInt(appId) } });
        if (!app) {
            throw { status: 400, message: 'Aplicación no encontrada' };
        }
        const isSupervisor = await hasRole(currentUserId, "SUPERVISOR");
        if (!isSupervisor) {
            throw {
                status: 400, message: 'No tienes permiso para adjuntar PDF a esta aplicación'
            };
        }
        return await prisma.$transaction(async (tx) => {
            const agg = await tx.application_pdfs.aggregate({
                where: { application_id: BigInt(appId) },
                _max: {
                    version: true
                }
            });
            const nextVersion = (agg._max.version ?? 0) + 1;
            return tx.application_pdfs.create({
                data: {
                    application_id: app.id,
                    version: nextVersion,
                    file_name: pdf.file_name,
                    storage_path: pdf.storage_path,
                    generated_by: BigInt(currentUserId),
                }
            });
        });
    }
    //validacion de los requisitos
    static async isComplete(appId, db = prisma) {
        const required = await db.application_requirements.findMany({
            where: {},
            select: { kind: true },
        });
        const files = await db.application_files.findMany({
            where: { application_id: BigInt(appId) },
            select: { kind: true },
        });
        const have = new Set(files.map((f) => String(f.kind)));
        return required.every((r) => have.has(String(r.kind)));
    }
}
