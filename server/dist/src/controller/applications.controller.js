"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsController = void 0;
const applications_service_1 = require("../services/applications.service");
class ApplicationsController {
    static async list(req, res, next) {
        try {
            const page = Number(req.query.page ?? 1);
            const size = Number(req.query.size ?? 10);
            const estado = req.query.estado;
            const tecnicoId = req.query.tecnicoId ? Number(req.query.tecnicoId) : undefined;
            const supervisorId = req.query.supervisorId ? Number(req.query.supervisorId) : undefined;
            const result = await applications_service_1.ApplicationsService.list({ page, size, estado, tecnicoId, supervisorId });
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async get(req, res, next) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id))
                return res.status(400).json({ message: "ID inválido" });
            const result = await applications_service_1.ApplicationsService.get(id);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const result = await applications_service_1.ApplicationsService.create(req.body);
            res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id))
                return res.status(400).json({ message: "ID inválido" });
            const result = await applications_service_1.ApplicationsService.update(id, req.body);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async deactivate(req, res, next) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id))
                return res.status(400).json({ message: "ID inválido" });
            const result = await applications_service_1.ApplicationsService.deactivate(id);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ApplicationsController = ApplicationsController;
