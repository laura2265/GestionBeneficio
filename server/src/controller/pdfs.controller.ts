import { Request, Response, NextFunction } from "express";
import { PdfsService } from "../services/pdfs.service.js";

export class PdfsController{
    static async list(req:Request, res:Response, next: NextFunction){
        try{
            res.json(await PdfsService.list({appId: req.query.appId ? Number(req.query.appId): undefined}))
        }catch(err){
            next(err)
        }
    }

    static async get(req:Request, res:Response, next: NextFunction){
        try{
            res.json( await PdfsService.get(Number(req.params.id)))
        }catch(err){
            next(err)
        }
        
    }static async create(req:Request, res:Response, next: NextFunction){
        try{
            res.json(await PdfsService.create(req.body))
        }catch(err){
            next(err)
        }
        
    }

    static async update(req:Request, res:Response, next: NextFunction){
        try{
            res.json( await PdfsService.update(Number(req.params.id), req.body) )
        }catch(err){
            next(err)
        }
    }

    static async remove(req: Request, res:Response, next: NextFunction){
        try{
            res.json(await PdfsService.remove(Number(req.params.id)))
        }catch(err){
            next(err)
        }
    }
}