"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EstratoController = void 0;
const estrato_service_1 = require("../services/estrato.service");
class EstratoController {
    static async list(req, res, next) {
        try {
            res.json(await estrato_service_1.EstratoService.list());
        }
        catch (err) {
            next(err);
        }
    }
}
exports.EstratoController = EstratoController;
