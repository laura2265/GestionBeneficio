import { Router } from "express";
import { ApplicationsController } from "../controller/applications.controller.js";

export const ApplicationsRouter = Router();
    
ApplicationsRouter.get('/', ApplicationsController.list)
ApplicationsRouter.get('/:id', ApplicationsController.get)
ApplicationsRouter.post('/', ApplicationsController.create)
ApplicationsRouter.put('/:id', ApplicationsController.update)


// Acciones de glujo
ApplicationsRouter.post('/:id/submit', ApplicationsController.submit)
ApplicationsRouter.post('/:id/approve', ApplicationsController.approve)
ApplicationsRouter.post('/:id/reject', ApplicationsController.reject)


//Archivos y PDF
ApplicationsRouter.post('/:id/files', ApplicationsController.addFile)
ApplicationsRouter.post('/:id/pdfs', ApplicationsController.addPdf)