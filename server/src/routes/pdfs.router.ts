import { Router } from "express";
import { PdfsController } from "../controller/pdfs.controller.js";

export const  pdfsRoutes = Router();

pdfsRoutes.get('/', PdfsController.list)
pdfsRoutes.get('/:id', PdfsController.get)
pdfsRoutes.post('/', PdfsController.create)
pdfsRoutes.put('/:id', PdfsController.update)
pdfsRoutes.put('/:id', PdfsController.remove)

