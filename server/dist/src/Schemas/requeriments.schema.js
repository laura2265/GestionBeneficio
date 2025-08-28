"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirementUpdateSchema = exports.requerimentCreateSchema = void 0;
const zod_1 = require("zod");
const file_schema_1 = require("./file.schema");
exports.requerimentCreateSchema = zod_1.z.object({
    kind: file_schema_1.fileKindEnum,
    is_required: zod_1.z.boolean().default(false),
    observacion: zod_1.z.string().optional(),
});
exports.requirementUpdateSchema = exports.requerimentCreateSchema.partial();
