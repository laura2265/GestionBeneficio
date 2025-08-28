"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const audit_service_1 = require("../services/audit.service");
class AuditController {
    static async list(req, res, next) {
        try {
            const userId = req.query.userId ? Number(req.query.userId) : undefined;
            const page = Number(req.query.page ?? 1);
            const size = Number(req.query.size ?? 20);
            res.json(await audit_service_1.AuditService.list({ userId, page, size }));
        }
        catch (err) {
            next(err);
        }
    }
    static async get(req, res, next) {
        try {
            res.json(await audit_service_1.AuditService.get(Number(req.params.id)));
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            res.json(await audit_service_1.AuditService.create(req.body));
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            res.json(await audit_service_1.AuditService.update(Number(req.params.id), req.body));
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuditController = AuditController;
