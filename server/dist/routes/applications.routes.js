import { Router } from "express";
import { ApplicationsController } from "../controller/applications.controller.js";
import { upload } from "../middlewares/upload.js";
export const ApplicationsRouter = Router();
ApplicationsRouter.get('/', ApplicationsController.list);
ApplicationsRouter.get('/:id', ApplicationsController.get);
ApplicationsRouter.post('/', ApplicationsController.create);
ApplicationsRouter.put('/:id', ApplicationsController.update);
// Acciones de glujo
ApplicationsRouter.post('/:id/submit', ApplicationsController.submit);
ApplicationsRouter.post('/:id/approve', ApplicationsController.approve);
ApplicationsRouter.post('/:id/reject', ApplicationsController.reject);
//Archivos y PDF
ApplicationsRouter.post('/:id/files', upload.single('file'), ApplicationsController.addFile); // 👈 AQUI
ApplicationsRouter.post('/:id/pdfs', ApplicationsController.addPdf);
