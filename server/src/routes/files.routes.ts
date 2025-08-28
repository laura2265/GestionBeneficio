import { Router } from "express";
import { FilesController } from "../controller/files.controller.js";

export const filesRouter = Router();
filesRouter.get('/', FilesController.list);
filesRouter.get('/:id', FilesController.get);
filesRouter.post('/', FilesController.create);
filesRouter.put('/:id', FilesController.update);


