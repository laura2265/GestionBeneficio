import { RequerimentsService } from '../services/requeriments.service.js';
export class RequirementsController {
    static async list(_req, res, next) {
        try {
            res.json(await RequerimentsService.list());
        }
        catch (e) {
            next(e);
        }
    }
    static async get(req, res, next) {
        try {
            res.json(await RequerimentsService.get(Number(req.params.id)));
        }
        catch (e) {
            next(e);
        }
    }
    static async create(req, res, next) {
        try {
            res.status(201).json(await RequerimentsService.create(req.body));
        }
        catch (e) {
            next(e);
        }
    }
    static async update(req, res, next) {
        try {
            res.json(await RequerimentsService.update(Number(req.params.id), req.body));
        }
        catch (e) {
            next(e);
        }
    }
    static async remove(req, res, next) {
        try {
            res.json(await RequerimentsService.remove(Number(req.params.id)));
        }
        catch (e) {
            next(e);
        }
    }
}
