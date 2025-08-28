import { z } from "zod";
export const pdfCreateSchema = z.object({
    application_id: z.number().int(),
    version: z.number().int().min(1),
    file_name: z.string().min(1),
    storage_path: z.string().min(1),
    generated_by: z.number().int().optional()
});
export const pdfUpdateSchema = pdfCreateSchema.partial();
