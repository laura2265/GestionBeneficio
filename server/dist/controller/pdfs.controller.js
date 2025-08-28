import { PdfsService } from "../services/pdfs.service.js";
export class PdfsController {
    static async list(req, res, next) {
        try {
            res.json(await PdfsService.list({ appId: req.query.appId ? Number(req.query.appId) : undefined }));
        }
        catch (err) {
            next(err);
        }
    }
    static async get(req, res, next) {
        try {
            res.json(await PdfsService.get(Number(req.params.id)));
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            res.json(await PdfsService.create(req.body));
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            res.json(await PdfsService.update(Number(req.params.id), req.body));
        }
        catch (err) {
            next(err);
        }
    }
    static async remove(req, res, next) {
        try {
            res.json(await PdfsService.remove(Number(req.params.id)));
        }
        catch (err) {
            next(err);
        }
    }
}
