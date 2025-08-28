"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryController = void 0;
const history_service_1 = require("../services/history.service");
class HistoryController {
    static async list(req, res, next) {
        try {
            const appId = Number(req.query.appId);
            res.json(await history_service_1.HistoryService.list({ appId }));
        }
        catch (error) {
            next();
        }
    }
    static async create(req, res, next) {
        try {
            res.json(await history_service_1.HistoryService.create(req.body));
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            res.json(await history_service_1.HistoryService.update(Number(req.params.id), req.body));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.HistoryController = HistoryController;
