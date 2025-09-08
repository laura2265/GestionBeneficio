import { prisma } from "../db.js";
import z from "zod";
import { ensureRole, hasRole } from "./rbac.service.js";
import { PrismaClient, Prisma } from "@prisma/client";
import { FileKind } from "../domain/file_kind.js";

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
  UPZ: z.string().min(2),
  tecnico_id: z.number().int().optional(),
  supervisor_id: z.number().int().optional(),
});


export const applicationUpdateSchema =  applicationCreateSchema.partial();

type Estado = "BORRADOR" | "ENVIADA" | "APROBADA" | "RECHAZADA"

type ApplicationsWhere = Prisma.Args<typeof prisma.applications, 'findMany'>['where'];
type DbClient = PrismaClient | Prisma.TransactionClient;

export class ApplicationsService {
    
    static async list(
      currentApplicationId: number,
      { page = 1, size = 10, estado }: { page?: number; size?: number; estado?: "BORRADOR"|"ENVIADA"|"APROBADA"|"RECHAZADA" } = {}
    ) {
      const skip = (page - 1) * size;
      const isSupervisor = await (currentApplicationId);
    
      const where: ApplicationsWhere = {};
    
      if (estado) where.estado = estado as any;
      if (!isSupervisor) where.tecnico_id = BigInt(currentApplicationId);
    
      const [items, total] = await Promise.all([
        prisma.applications.findMany({ where, skip, take: size, orderBy: { id: "desc" } }),
        prisma.applications.count({ where }),
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
    static async create(payload: unknown, currentUserId: number) {
      
        await ensureRole(currentUserId, "TECNICO");
        
      const data = applicationCreateSchema.parse(payload);
        
      const tecnicoId = data.tecnico_id ?? currentUserId;
        
      return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Crear la aplicación
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
            ...(data.UPZ ? { UPZ: data.UPZ } : {}),
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
    static  async submit(appId: number, currentUserId: number){
        await ensureRole(currentUserId, 'TECNICO');

        return prisma.$transaction(async (tx: Prisma.TransactionClient)=>{
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
            const complete = await ApplicationsService.isComplete(app.id, tx);
            if (!complete) {
              throw { status: 400, message: 'Faltan documentos requeridos' };
            }

            const supervisors = await tx.user_roles.findMany({
              where: { roles: { is: { code: 'SUPERVISOR' } } },
              select: { user_id: true },
            });
            if (!supervisors.length) {
              throw { status: 409, message: 'No hay supervisores disponibles' };
            }
            const pick = supervisors[Math.floor(Math.random() * supervisors.length)].user_id;


            await tx.applications.update({
              where: { id: app.id },
              data: {
                estado: 'ENVIADA',
                enviada_at: new Date(),
                supervisor_id: pick,
              },
            });

            return updated;
        })
    }

    // Aprobar solicitud
    static async approve(appId: number, supervisorUserId: number, comment?: string){
        await ensureRole(supervisorUserId, "SUPERVISOR");

        return prisma.$transaction(async (tx: Prisma.TransactionClient) =>{
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
    static async reject(appId: number, supervisorUserId: number, comment: string){
        await ensureRole(supervisorUserId, "SUPERVISOR");

        return prisma.$transaction(async (tx: Prisma.TransactionClient) =>{
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
                estado: "RECHAZADA",
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
                    to_status: "RECHAZADA",
                    changed_by: BigInt(supervisorUserId),
                    comment: comment ?? "rechazada",
                }
            });

            return updated;
        })
    }

    //Adjuntar PDF
    static async addFile(appId: number, currentUserId: number, file: {kind: "CONTRATO" | "CEDULA" | "EVIDENCIA_ESTRATO_SISBEN" | "FOTO_FACHADA" | "PRUEBA_VELOCIDAD" | "VERIFICACION_ENERGIA" | "DECLARACION_JURAMENTADA" | "OTRO",
    file_name: string,
    storage_path: string,
    mime_type?: string | null,}){
        const isSupervisor = await hasRole(currentUserId, 'TECNICO');
        const app = await prisma.applications.findUnique({ where: { id: BigInt(appId) } });
        if (!app) throw { status: 400, message: 'Aplicación no encontrada' };

        // Regla recomendada: el TÉCNICO dueño puede adjuntar; el supervisor NO (o cámbialo a gusto)
        if (!isSupervisor && app.tecnico_id !== BigInt(currentUserId)) {
          throw { status: 403, message: 'No puedes adjuntar archivos a esta aplicación' };
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
        return await prisma.$transaction(async (tx: Prisma.TransactionClient)=>{
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
    static async isComplete(
      appId: number | bigint,
      db: DbClient = prisma
    ): Promise<boolean> {
        type KindRec = { kind: string | number | bigint };
        const required = await db.application_requirements.findMany({
          where: {},
          select: { kind: true } as const,
        });

        const files = await db.application_files.findMany({
          where: { application_id: BigInt(appId) },
          select: { kind: true } as const,
        });

        const have = new Set(files.map((f: KindRec) => String(f.kind)));
        return required.every((r: KindRec) => have.has(String(r.kind)));
    }
}


