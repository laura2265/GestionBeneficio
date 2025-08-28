"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUpdateSchema = exports.fileCreateSchema = exports.fileKindEnum = void 0;
const zod_1 = require("zod");
exports.fileKindEnum = zod_1.z.enum(['CONTRATO', 'CEDULA', 'EVIDENCIA_ESTRATO_SISBEN', 'FOTO_FACHADA', 'PRUEBA_VELOCIDAD', 'VERIFICACION_ENERGIA', 'DECLARACION_JURAMENTADA', 'OTRO']);
exports.fileCreateSchema = zod_1.z.object({
    application_id: zod_1.z.number().int(),
    kind: exports.fileKindEnum,
    file_name: zod_1.z.string().min(1),
    storage_path: zod_1.z.string().min(1),
    mime_type: zod_1.z.string().optional(),
    byte_size: zod_1.z.number().int().optional(),
    sha256: zod_1.z.string().length(64).optional(),
    uploaded_by: zod_1.z.number().int().optional()
});
exports.fileUpdateSchema = exports.fileCreateSchema.partial();
