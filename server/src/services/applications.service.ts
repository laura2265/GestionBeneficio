import { prisma } from "../db.js";
import z from "zod";
import { ensureRole, hasRole } from "./rbac.service.js";
import { PrismaClient } from "@prisma/client/extension";
import { Prisma } from "@prisma/client";

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
})

export const applicationUpdateSchema =  applicationCreateSchema.partial();

type Estado = "BORRADOR" | "ENVIADA" | "APROBADA" | "RECHAZADA"

export class ApplicationsService {

    // LIST con scope por rol
    static async list(
      currentUserId: number,
      { page = 1, size = 10, estado }: { page?: number; size?: number; estado?: "BORRADOR"|"ENVIADA"|"APROBADA"|"RECHAZADA" } = {}
    ) {
      const skip = (page - 1) * size;
      const isSupervisor = await hasRole(currentUserId, "SUPERVISOR");
      const where: Prisma.applicationsWhereInput = {};
      if (estado) where.estado = estado;
      if (!isSupervisor) where.tecnico_id = BigInt(currentUserId); 
    
      const [items, total] = await Promise.all([
        prisma.applications.findMany({ where, skip, take: size, orderBy: { id: "desc" } }),
        prisma.applications.count({ where })
      ]);
      return { items, total, page, size };
    }
     static async get(id:number){
        const item = await prisma.applications.findUnique({where: {id}});
        if(!item){
            throw{status: 404, message: 'Aplicación no encontrada'}
        }
        return item; 
    }

    // UPDATE solo BORRADOR del técnico dueño
    static async update(id: number, payload: unknown, currentUserId: number) {
      await ensureRole(currentUserId, "TECNICO");
      const app = await prisma.applications.findUnique({ where: { id: BigInt(id) } });
      if (!app) throw { status: 404, message: "Solicitud no encontrada" };
      if (app.tecnico_id !== BigInt(currentUserId)) throw { status: 403, message: "No puedes editar esta solicitud" };
      if (app.estado !== "BORRADOR") throw { status: 400, message: "Solo se puede editar en BORRADOR" };
    
      const data = applicationUpdateSchema.parse(payload);
      return prisma.applications.update({ where: { id: app.id }, data });
    }

    static async listForUser(userId: number){
        const  isSupervisor = await prisma.user_roles.findFirst({
            where: {
                user_id: BigInt(userId), 
                roles: { is: { code: "SUPERVISOR" }}
            }
        });
        if(isSupervisor){
            return prisma.applications.findMany({orderBy: {id: 'desc'}})
        }

        return prisma.applications.findMany({
            where:{
                tecnico_id:BigInt(userId)
            },
            orderBy: {id: 'desc'}
        });
    }

    //Create tecnico y borrador
    static async create(payload: unknown, currentUserId: number){
        await ensureRole(currentUserId, "TECNICO");
        const data = applicationCreateSchema.parse(payload);

        return prisma.$transaction(async(tx: PrismaClient)=>{
            const app = await tx.applications.create({
                data: {
                    nombres: data.nombres,
                    apellidos: data.apellidos,
                    tipo_documento: data.tipo_documento as any,
                    numero_documento: data.numero_documento,
                    direccion: data.direccion ?? null,
                    barrio: data.barrio,
                    correo: data.correo ?? null,
                    numero_contacto: data.numero_contacto,
                    estrato_id: data.estrato_id ?? null,
                    declaracion_juramentada: data.declaracion_juramentada,
                    estado: "BORRADOR",
                    tecnico_id: BigInt(currentUserId)
                }
            });

            await tx.application_history.create({
                data:{
                    application_id: app.id,
                    from_status: null,
                    to_status: "BORRADOR",
                    change_by: BigInt(currentUserId),
                    Comment: 'creación de la aplicación'
                }
            })
            return app;
        })
    }

    //Cambia estado de borrador a enviado
    static  async submit(appId: number, currentUserId: number){
        await ensureRole(currentUserId, 'TECNICO');

        return prisma.$transaction(async (tx)=>{
            const app = await tx.applications.findUnique({where: {id: BigInt(appId)}});
            if(!app){
                throw {status: 404, message: "Aplicación no encontrada"};
            }

            if(app.tecnico_id !== BigInt(currentUserId)){
                throw { status: 403, message: `No puedes enviar una aplicacion de otro tecnico`};
            }
            if(app.estado !== "BORRADOR"){
                throw{ status: 400, message: `No puedes enviar desde estado  ${app.estado}`}
            }

            const updated = await tx.applications.update({
                where: { id: app.id },
                data: { estado: "ENVIADA", enviada_at: new Date() },
            });

            await tx.application_history.create({
                data: {
                    application_id: app.id,
                    from_status: "BORRADOR",
                    to_status: "ENVIADA",
                    changed_by: BigInt(currentUserId),
                    comment: "Envío para revisión"
                }
            });
            return updated;
        })
    }

    // Aprobar solicitud
    static async approve(appId: number, supervisorUserId: number, comment?: string){
        await ensureRole(supervisorUserId, "SUPERVISOR");

        return prisma.$transaction(async (tx) =>{
            const app = await tx.applications.findUnique({where: {id: BigInt(appId)}});
            if(!app){
                throw {status: 404, message: "Aplicación no encontrada"};
            }
            if(app.estado !== "ENVIADA"){
                throw {status: 400, message: "Solo se puede aprobar una aplicación Enviada"}
            }

            const complete = await ApplicationsService.isComplete(app.id, tx);
            if(!complete){
                throw {status: 400, message: "La aplicación no cumple todos los requisitos obligatorios"}   
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
                data:{
                    application_id: app.id,
                    from_status: "ENVIADA",
                    to_status: "APROBADA",
                    changed_by: BigInt(supervisorUserId),
                    comment: comment ?? "Aprobada",
                }
            });

            return updated;
        })
    }

    //Rechazar la solicitud
    static async reject(appId: number, supervisorUserId: number, motivo: string){
        await ensureRole(supervisorUserId, "SUPERVISOR");
        if(!motivo || !motivo.trim()){
            throw {status: 400, message: "Motivo de rechazo requerido"};
        }

        return prisma.$transaction(async(tx)=>{
            const app = await tx.applications.findUnique({where: {id: BigInt(appId)}})
            if(!app){
                throw {status: 404, message: "Aplicación no encontrada"}
            }
            if(app.estado === "ENVIADA"){
                throw {status: 404, message: 'Solo puede rechazar una aplicación Enviada'}
            }

            const update = await tx.applications.update({
                where: {id: app.id},
                data: {
                    estado: "RECHAZADA",
                    supervisor_id: BigInt(supervisorUserId),
                    revisada_at: new Date(),
                    rechazada_at: new Date(),
                    motivo_rechazo: motivo,
                }
            })

            await tx.application_history.create({
                data: {
                    application_id: app.id,
                    from_status: "ENVIADA",
                    to_status: "RECHAZADA",
                    changed_by: BigInt(supervisorUserId),
                    comment: motivo,
                }
            })

            return update;

        })
    }

    //Adjuntar PDF
    static async addFile(appId: number, currentUserId: number, file: {kind: "CONTRATO" | "CEDULA" | "EVIDENCIA_ESTRATO_SISBEN" | "FOTO_FACHADA" | "PRUEBA_VELOCIDAD" | "VERIFICACION_ENERGIA" | "DECLARACION_JURAMENTADA" | "OTRO",
    file_name: string,
    storage_path: string,
    mime_type?: string | null,}){
        const isSupervisor = await hasRole(currentUserId, "SUPERVISOR");
        const app = await prisma.applications.findUnique({
            where: {id: BigInt(appId)}
        });
        if(!app){
            throw {status: 400, message: "Aplicación no encontrada"}
        }
        if(isSupervisor && app.tecnico_id !== BigInt(currentUserId)){
            throw {status: 404, message: "No tienes permiso para adjuntar archivos a esta aplicación "}
        }

        return prisma.application_files.create({
            data:{
                application_id: app.id,
                kind: file.kind as any,
                file_name: file.file_name,
                storage_path: file.storage_path,
                mime_type: file.mime_type ?? null,
            }
        })

    }

    //version del pdf
    static async addPdf(appId: number, currentUserId: number, pdf:{    
        file_name: string,
        storage_path: string,
    }){
        const app = await prisma.applications.findUnique({where:{id: BigInt(appId)}});
        if(!app){
            throw {status: 400, message: 'Aplicación no encontrada'};
        }

        const isSupervisor = await hasRole(currentUserId, "SUPERVISOR" as any)
        if(!isSupervisor){
            throw {
                status: 400, message: 'No tienes permiso para adjuntar PDF a esta aplicación'
            }
        }
        return await prisma.$transaction(async (tx)=>{
            const agg = await tx.application_pdfs.aggregate({
                where: {application_id: BigInt(appId)},
                _max: {
                    version: true
                }
            })
            const nextVersion = (agg._max.version?? 0)+1;

            return tx.application_pdfs.create({
                data: {
                    application_id: app.id,
                    version: nextVersion,
                    file_name: pdf.file_name,
                    storage_path: pdf.storage_path,
                    generated_by: BigInt(currentUserId),
                }
            })
        })
    }

    //validacion de los requisitos
    static async isComplete(appId: bigint | number, tx?: PrismaClient) {
    const db = tx ?? prisma;

    const required = await db.application_requirements.findMany({
      where: { is_required: true },
      select: { kind: true },
    });
    if (required.length === 0) return true;

    const files = await db.application_files.findMany({
      where: { application_id: BigInt(appId) },
      select: { kind: true },
    });

    const have = new Set<string>(files.map((f: { kind: string }) => String(f.kind)));
    return required.every((r: { kind: string }) => have.has(String(r.kind)));
  }
}


