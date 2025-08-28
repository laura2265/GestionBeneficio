import { Router } from "express";
import { ApplicationsController } from "../controller/applications.controller.js";

export const ApplicationsRouter = Router();

ApplicationsRouter.get('/', ApplicationsController.list)
ApplicationsRouter.get('/:id', ApplicationsController.get)
ApplicationsRouter.post('/', ApplicationsController.create)
ApplicationsRouter.put('/:id', ApplicationsController.update)
ApplicationsRouter.put('/:id', ApplicationsController.deactivate);