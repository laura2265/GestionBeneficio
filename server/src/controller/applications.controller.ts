import { Request, Response, NextFunction } from "express";
import { ApplicationsService } from "../services/applications.service.js";

export class ApplicationsController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page ?? 1);
      const size = Number(req.query.size ?? 10);
      const estado = req.query.estado as string | undefined;
      const tecnicoId = req.query.tecnicoId ? Number(req.query.tecnicoId) : undefined;
      const supervisorId = req.query.supervisorId ? Number(req.query.supervisorId) : undefined;

      const result = await ApplicationsService.list({ page, size, estado, tecnicoId, supervisorId });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

      const result = await ApplicationsService.get(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ApplicationsService.create(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

      const result = await ApplicationsService.update(id, req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  static async deactivate(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "ID inválido" });

      const result = await ApplicationsService.deactivate(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
