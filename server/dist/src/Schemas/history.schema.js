"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyUpdateSchema = exports.historyCreateSchema = exports.estadoEnum = void 0;
const zod_1 = require("zod");
exports.estadoEnum = zod_1.z.enum(['BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA']);
exports.historyCreateSchema = zod_1.z.object({
    application_id: zod_1.z.number().int(),
    from_status: exports.estadoEnum.optional(),
    to_status: exports.estadoEnum,
    changed_by: zod_1.z.number().int().optional(),
    comment: zod_1.z.string().optional()
});
exports.historyUpdateSchema = exports.historyCreateSchema.partial();
