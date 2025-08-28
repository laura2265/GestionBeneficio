import { Router } from "express";
import { UsersController } from "../controller/users.controller.js";
export const usersRouter = Router();
usersRouter.get('/', UsersController.list);
usersRouter.get('/:id', UsersController.get);
usersRouter.post('/', UsersController.create);
usersRouter.put('/:id', UsersController.update);
usersRouter.put('/:id/deactivate', UsersController.deactivate);
