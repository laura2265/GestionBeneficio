"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditUpdateScheme = exports.auditCreateSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.auditCreateSchema = zod_1.default.object({
    user_id: zod_1.default.number().int(),
    action: zod_1.default.string().min(2),
    entity: zod_1.default.string().min(2),
    entity_id: zod_1.default.number().int().optional(),
    details: zod_1.default.any().optional(),
});
exports.auditUpdateScheme = exports.auditCreateSchema.partial();
