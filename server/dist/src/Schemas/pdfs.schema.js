"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfUpdateSchema = exports.pdfCreateSchema = void 0;
const zod_1 = require("zod");
exports.pdfCreateSchema = zod_1.z.object({
    application_id: zod_1.z.number().int(),
    version: zod_1.z.number().int().min(1),
    file_name: zod_1.z.string().min(1),
    storage_path: zod_1.z.string().min(1),
    generated_by: zod_1.z.number().int().optional()
});
exports.pdfUpdateSchema = exports.pdfCreateSchema.partial();
