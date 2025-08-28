import { HistoryService } from "../services/history.service.js";
export class HistoryController {
    static async list(req, res, next) {
        try {
            const appId = Number(req.query.appId);
            res.json(await HistoryService.list({ appId }));
        }
        catch (error) {
            next();
        }
    }
    static async create(req, res, next) {
        try {
            res.json(await HistoryService.create(req.body));
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            res.json(await HistoryService.update(Number(req.params.id), req.body));
        }
        catch (error) {
            next(error);
        }
    }
}
