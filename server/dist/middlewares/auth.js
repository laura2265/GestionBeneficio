import * as jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET || "dev";
function getBearer(req) {
    const h = req.headers.authorization;
    if (!h)
        return null;
    const [scheme, token] = h.split(" ");
    if (scheme !== "Bearer" || !token)
        return null;
    return token;
}
// ✅ PROD: verifica JWT "Authorization: Bearer <token>"
export function auth(req, res, next) {
    const token = getBearer(req);
    if (!token)
        return res.status(401).json({ message: "No autenticado" });
    try {
        const decoded = jwt.verify(token, SECRET);
        const payload = typeof decoded === "string" ? {} : decoded;
        const userId = Number(payload.id ?? payload.sub);
        if (!userId)
            return res.status(401).json({ message: "No autenticado" });
        req.auth = { user: { id: userId } };
        next();
    }
    catch {
        return res.status(401).json({ message: "No autenticado" });
    }
}
// ✅ DEV: inyecta userId desde header (sin JWT)
export function devInjectUser(req, _res, next) {
    const id = Number(req.header("x-user-id") ?? 1); // por defecto 1
    req.auth = { user: { id } };
    next();
}
// ✅ Selector: usa dev o prod según variable de entorno
export function maybeAuth(req, res, next) {
    try {
        if (process.env.DEV_NOAUTH === 'true') {
            const headerId = req.header('x-user-id');
            if (headerId) {
                req.auth = { user: { id: Number(headerId) } };
            }
            return next();
        }
        return next();
    }
    catch (e) {
        return next(e);
    }
}
