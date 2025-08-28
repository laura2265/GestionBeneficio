import {z} from "zod";

export  const fileKindEnum = z.enum(['CONTRATO', 'CEDULA', 'EVIDENCIA_ESTRATO_SISBEN', 'FOTO_FACHADA', 'PRUEBA_VELOCIDAD', 'VERIFICACION_ENERGIA', 'DECLARACION_JURAMENTADA', 'OTRO']) 

export const fileCreateSchema = z.object({
    application_id: z.number().int(),
    kind: fileKindEnum,
    file_name: z.string().min(1),
    storage_path: z.string().min(1),
    mime_type: z.string().optional(),
    byte_size: z.number().int().optional(),
    sha256: z.string().length(64).optional(),
    uploaded_by: z.number().int().optional()
})

export const fileUpdateSchema = fileCreateSchema.partial();