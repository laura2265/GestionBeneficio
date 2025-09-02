import { ApplicationsService } from "../services/applications.service.js";
const getUserId = (req) => Number(req.auth?.user?.id ?? req.header('x-user-id') ?? NaN);
const getNumericParam = (value) => {
    const n = Number(value);
    if (Number.isNaN(n))
        throw { status: 400, message: "Parámetro numérico inválido" };
    return n;
};
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
export class ApplicationsController {
    static async list(req, res, next) {
        try {
            const userId = getUserId(req);
            if (Number.isNaN(userId))
                return res.status(401).json({ message: "No autenticado" });
            const page = req.query.page ? getNumericParam(req.query.page) : 1;
            const size = req.query.size ? getNumericParam(req.query.size) : 10;
            const estado = req.query.estado ?? undefined;
            const result = await ApplicationsService.list(userId, { page, size, estado });
            res.json(sanitizeBigInt(result));
        }
        catch (err) {
            next(err);
        }
    }
    // GET por id
    static async get(req, res, next) {
        try {
            const id = getNumericParam(req.params.id);
            const item = await ApplicationsService.get(id);
            res.json(item);
        }
        catch (err) {
            next(err);
        }
    }
    static async create(req, res, next) {
        try {
            const userId = getUserId(req);
            if (Number.isNaN(userId))
                return res.status(401).json({ message: "No autenticado" });
            const raw = { ...req.body };
            if (raw.nombre && !raw.nombres)
                raw.nombres = raw.nombre;
            const app = await ApplicationsService.create(raw, userId);
            return res.status(201).json(sanitizeBigInt(app));
        }
        catch (err) {
            next(err);
        }
    }
    // UPDATE: (opcional) solo si permites editar BORRADOR del técnico dueño
    static async update(req, res, next) {
        try {
            const id = getNumericParam(req.params.id);
            const userId = getUserId(req);
            if (Number.isNaN(userId))
                return res.status(401).json({ message: "No autenticado" });
            const result = await ApplicationsService.update(id, req.body, userId);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    // SUBMIT: el técnico dueño envía a revisión
    static async submit(req, res, next) {
        try {
            const id = getNumericParam(req.params.id);
            const userId = getUserId(req);
            if (Number.isNaN(userId))
                return res.status(401).json({ message: "No autenticado" });
            const result = await ApplicationsService.submit(id, userId);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    // APPROVE: solo SUPERVISOR (el service valida y verifica requisitos completos)
    static async approve(req, res, next) {
        try {
            const id = getNumericParam(req.params.id);
            const userId = getUserId(req);
            if (Number.isNaN(userId))
                return res.status(401).json({ message: "No autenticado" });
            const comment = req.body?.comment ?? undefined;
            const result = await ApplicationsService.approve(id, userId, comment);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    // REJECT: solo SUPERVISOR (requiere motivo)
    static async reject(req, res, next) {
        try {
            const id = getNumericParam(req.params.id);
            const userId = getUserId(req);
            if (Number.isNaN(userId))
                return res.status(401).json({ message: "No autenticado" });
            const motivo = String(req.body?.motivo ?? "");
            const result = await ApplicationsService.reject(id, userId, motivo);
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    // ADD FILE: técnico dueño o supervisor puede adjuntar por requirement/kind
    static async addFile(req, res, next) {
        try {
            const id = getNumericParam(req.params.id);
            const userId = getUserId(req);
            if (Number.isNaN(userId))
                return res.status(401).json({ message: "No autenticado" });
            const { kind, file_name, storage_path, mime_type } = req.body;
            const result = await ApplicationsService.addFile(id, userId, {
                kind: kind,
                file_name,
                storage_path,
                mime_type: mime_type ?? null,
            });
            res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    // ADD PDF versionado: técnico dueño o supervisor
    static async addPdf(req, res, next) {
        try {
            const id = getNumericParam(req.params.id);
            const userId = getUserId(req);
            if (Number.isNaN(userId))
                return res.status(401).json({ message: "No autenticado" });
            const { file_name, storage_path } = req.body;
            const result = await ApplicationsService.addPdf(id, userId, { file_name, storage_path });
            res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    }
}
