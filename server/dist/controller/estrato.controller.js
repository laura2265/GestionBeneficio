import { EstratoService } from "../services/estrato.service.js";
export class EstratoController {
    static async list(req, res, next) {
        try {
            res.json(await EstratoService.list());
        }
        catch (err) {
            next(err);
        }
    }
}
