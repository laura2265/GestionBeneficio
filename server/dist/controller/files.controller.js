import { FilesService } from "../services/files.service.js";
// Convierte todos los BigInt a string de forma recursiva
const sanitizeBigInt = (value) => {
    if (typeof value === "bigint")
        return value.toString();
    if (Array.isArray(value))
        return value.map(sanitizeBigInt);
    if (value && typeof value === "object") {
        const out = {};
        for (const [k, v] of Object.entries(value))
            out[k] = sanitizeBigInt(v);
        return out;
    }
    return value;
};
export class FilesController {
    static async listByApplication(req, res, next) {
        try {
            const applicationId = Number(req.params.applicationId);
            if (isNaN(applicationId)) {
                return res.status(400).json({ message: "applicationId inválido" });
            }
            const files = await FilesService.listByApplicationId(applicationId);
            res.json(files);
        }
        catch (error) {
            next(error);
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
