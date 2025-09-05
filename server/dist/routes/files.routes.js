import { Router } from "express";
import { FilesController } from "../controller/files.controller.js";
export const filesRouter = Router();
filesRouter.get('/:applicationId', FilesController.listByApplication);
filesRouter.post('/', FilesController.create);
filesRouter.put('/:id', FilesController.update);
