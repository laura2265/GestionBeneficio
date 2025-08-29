import { Request, Response, NextFunction } from "express";
import { ApplicationsService } from "../services/applications.service.js";

type AuthedRequest = Request & { auth?: { user?: { id?: number } } };

const getUserId = (req: AuthedRequest): number => Number(req.auth?.user?.id ?? NaN);

const getNumericParam = (value: unknown): number => {
  const n = Number(value);
  if (Number.isNaN(n)) throw { status: 400, message: "Parámetro numérico inválido" };
  return n;
};

export class ApplicationsController {
static async list(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      if (Number.isNaN(userId)) return res.status(401).json({ message: "No autenticado" });

      const page = req.query.page ? getNumericParam(req.query.page) : 1;
      const size = req.query.size ? getNumericParam(req.query.size) : 10;
      const estado = (req.query.estado as "BORRADOR" | "ENVIADA" | "APROBADA" | "RECHAZADA" | undefined) ?? undefined;

      const result = await ApplicationsService.list(userId, { page, size, estado });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // GET por id
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getNumericParam(req.params.id);
      const item = await ApplicationsService.get(id);
      res.json(item);
    } catch (err) {
      next(err);
    }
  } 

  // CREATE: solo TECNICO (el service valida el rol y marca tecnico_id + BORRADOR)
  static async create(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
      const userId = getUserId(req);
      if (Number.isNaN(userId)) return res.status(401).json({ message: "No autenticado" });

      const app = await ApplicationsService.create(req.body, userId);
      res.status(201).json(app);
    } catch (err) {
      next(err);
    }
  }

  // UPDATE: (opcional) solo si permites editar BORRADOR del técnico dueño
  static async update(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
      const id = getNumericParam(req.params.id);
      const userId = getUserId(req);
      if (Number.isNaN(userId)) return res.status(401).json({ message: "No autenticado" });

      const result = await ApplicationsService.update(id, req.body, userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // SUBMIT: el técnico dueño envía a revisión
  static async submit(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
      const id = getNumericParam(req.params.id);
      const userId = getUserId(req);
      if (Number.isNaN(userId)) return res.status(401).json({ message: "No autenticado" });

      const result = await ApplicationsService.submit(id, userId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // APPROVE: solo SUPERVISOR (el service valida y verifica requisitos completos)
  static async approve(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
      const id = getNumericParam(req.params.id);
      const userId = getUserId(req);
      if (Number.isNaN(userId)) return res.status(401).json({ message: "No autenticado" });

      const comment = (req.body?.comment as string | undefined) ?? undefined;
      const result = await ApplicationsService.approve(id, userId, comment);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // REJECT: solo SUPERVISOR (requiere motivo)
  static async reject(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
      const id = getNumericParam(req.params.id);
      const userId = getUserId(req);
      if (Number.isNaN(userId)) return res.status(401).json({ message: "No autenticado" });

      const motivo = String(req.body?.motivo ?? "");
      const result = await ApplicationsService.reject(id, userId, motivo);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  // ADD FILE: técnico dueño o supervisor puede adjuntar por requirement/kind
  static async addFile(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
      const id = getNumericParam(req.params.id);
      const userId = getUserId(req);
      if (Number.isNaN(userId)) return res.status(401).json({ message: "No autenticado" });

      const { kind, file_name, storage_path, mime_type } = req.body as {
        kind: string;
        file_name: string;
        storage_path: string;
        mime_type?: string | null;
      };

      const result = await ApplicationsService.addFile(id, userId, {
        kind: kind as any,
        file_name,
        storage_path,
        mime_type: mime_type ?? null,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  // ADD PDF versionado: técnico dueño o supervisor
  static async addPdf(req: AuthedRequest, res: Response, next: NextFunction) {
    try {
      const id = getNumericParam(req.params.id);
      const userId = getUserId(req);
      if (Number.isNaN(userId)) return res.status(401).json({ message: "No autenticado" });

      const { file_name, storage_path } = req.body as {
        file_name: string;
        storage_path: string;
      };

      const result = await ApplicationsService.addPdf(id, userId, { file_name, storage_path });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }
}
