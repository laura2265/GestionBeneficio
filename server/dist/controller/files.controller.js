import { FilesService } from "../services/files.service.js";
export class FilesController {
    static async list(req, res, next) {
        try {
            res.json(await FilesService.list({ appId: req.query.appId ? Number(req.query.appId) : undefined }));
        }
        catch (error) {
            next(error);
        }
    }
    static async get(req, res, next) {
        try {
            res.json(await FilesService.get(Number(req.params.id)));
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            res.status(201).json(await FilesService.create(req.body));
        }
        catch (err) {
            next(err);
        }
    }
    static async update(req, res, next) {
        try {
            res.json(await FilesService.update(Number(req.params.id), req.body));
        }
        catch (err) {
            next(err);
        }
    }
    static async remove(req, res, next) {
        try {
            res.json(await FilesService.remove(Number(req.params.id)));
        }
        catch (err) {
            next();
        }
    }
}
