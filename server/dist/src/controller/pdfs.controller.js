"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfsController = void 0;
const pdfs_service_1 = require("../services/pdfs.service");
class PdfsController {
    static async list(req, res, next) {
        try {
            res.json(await pdfs_service_1.PdfsService.list({ appId: req.query.appId ? Number(req.query.appId) : undefined }));
        }
        catch (err) {
            next(err);
        }
    }
    static async get(req, res, next) {
        try {
            res.json(await pdfs_service_1.PdfsService.get(Number(req.params.id)));
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            res.json(await pdfs_service_1.PdfsService.create(req.body));
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            res.json(await pdfs_service_1.PdfsService.update(Number(req.params.id), req.body));
        }
        catch (err) {
            next(err);
        }
    }
    static async remove(req, res, next) {
        try {
            res.json(await pdfs_service_1.PdfsService.remove(Number(req.params.id)));
        }
        catch (err) {
            next(err);
        }
    }
}
exports.PdfsController = PdfsController;
