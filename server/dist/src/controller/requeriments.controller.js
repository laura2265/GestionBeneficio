"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequirementsController = void 0;
const requeriments_service_1 = require("../services/requeriments.service");
class RequirementsController {
    static async list(_req, res, next) {
        try {
            res.json(await requeriments_service_1.RequerimentsService.list());
        }
        catch (e) {
            next(e);
        }
    }
    static async get(req, res, next) {
        try {
            res.json(await requeriments_service_1.RequerimentsService.get(Number(req.params.id)));
        }
        catch (e) {
            next(e);
        }
    }
    static async create(req, res, next) {
        try {
            res.status(201).json(await requeriments_service_1.RequerimentsService.create(req.body));
        }
        catch (e) {
            next(e);
        }
    }
    static async update(req, res, next) {
        try {
            res.json(await requeriments_service_1.RequerimentsService.update(Number(req.params.id), req.body));
        }
        catch (e) {
            next(e);
        }
    }
    static async remove(req, res, next) {
        try {
            res.json(await requeriments_service_1.RequerimentsService.remove(Number(req.params.id)));
        }
        catch (e) {
            next(e);
        }
    }
}
exports.RequirementsController = RequirementsController;
