"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const files_service_1 = require("../services/files.service");
class FilesController {
    static async list(req, res, next) {
        try {
            res.json(await files_service_1.FilesService.list({ appId: req.query.appId ? Number(req.query.appId) : undefined }));
        }
        catch (error) {
            next(error);
        }
    }
    static async get(req, res, next) {
        try {
            res.json(await files_service_1.FilesService.get(Number(req.params.id)));
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            res.status(201).json(await files_service_1.FilesService.create(req.body));
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            res.json(await files_service_1.FilesService.update(Number(req.params.id), req.body));
        }
        catch (err) {
            next(err);
        }
    }
    static async remove(res, req, next) {
        try {
            res.json(await files_service_1.FilesService.remove(Number(req.params.id)));
        }
        catch (err) {
            next();
        }
    }
}
exports.FilesController = FilesController;
