import { ApplicationsService } from "../services/applications.service.js";
import { normalizeKind } from "../domain/file_kind.js";
function jsonSafe(data) {
    return JSON.parse(JSON.stringify(data, (_k, v) => (typeof v === "bigint" ? v.toString() : v)));
}
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
    static async addFile(req, res, next) {
        try {
            console.log('Content-Type:', req.headers['content-type']);
            console.log('req.body:', req.body);
            console.log('req.file:', req.file);
            const appId = Number(req.params.id);
            const userId = Number(req.headers["x-user-id"]);
            if (!req.file)
                return res.status(400).json({ message: "Falta 'file'" });
            const bodyKind = (req.body?.kind ?? "").toString().replace(/"/g, "");
            const kind = normalizeKind(bodyKind);
            const storedName = req.file.filename; // p.ej. '1757..._archivo.png'
            const file_name = req.file.originalname; // nombre original para mostrar
            const mime_type = req.file.mimetype;
            const storage_path = `/uploads/${storedName}`;
            // 1) Guardar el archivo en BD
            const saved = await ApplicationsService.addFile(appId, userId, {
                kind: kind,
                file_name,
                storage_path,
                mime_type,
            });
            // 2) Si piden enviar al guardar, intentamos submit
            const autoSubmit = (req.body?.auto_submit ?? "false").toString().toLowerCase() === "true";
            if (!autoSubmit) {
                return res.status(201).json({ file: jsonSafe(saved), submitted: false });
            }
            try {
                const submittedApp = await ApplicationsService.submit(appId, userId);
                // Si tu submit cambia estado a 'ENVIADA' y hace validaciones internas, perfecto
                return res
                    .status(200)
                    .json({ file: jsonSafe(saved), submitted: true, application: jsonSafe(submittedApp) });
            }
            catch (e) {
                // Si aún faltan requisitos, devolvemos 201 con info del archivo y el motivo
                return res.status(201).json({
                    file: jsonSafe(saved),
                    submitted: false,
                    submit_error: e?.message || "No se pudo enviar la solicitud",
                });
            }
        }
        catch (err) {
            next(err);
        }
    }
    static async addFilesBatch(req, res, next) {
        try {
            const appId = Number(req.params.id);
            const userId = Number(req.headers["x-user-id"]);
            const entries = Object.entries(req.files);
            const saves = await Promise.all(entries.map(async ([k, arr]) => {
                const f = arr[0];
                const kind = normalizeKind(k);
                return ApplicationsService.addFile(appId, userId, {
                    kind,
                    file_name: f.originalname,
                    storage_path: f.path.replace(/\\/g, "/"),
                    mime_type: f.mimetype,
                });
            }));
            res.status(201).json({ uploaded: saves.length, items: saves });
        }
        catch (e) {
            next(e);
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
