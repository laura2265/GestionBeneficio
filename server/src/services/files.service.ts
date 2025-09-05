import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { fileCreateSchema, fileUpdateSchema } from "../Schemas/file.schema.js";
import { hasRole } from "./rbac.service.js";
import { PrismaClient } from "@prisma/client/extension";

export class FilesService{

    static async listByApplicationId(applicationId: number) {
      const files = await prisma.application_files.findMany({
        where: { application_id: applicationId },
        orderBy: { id: 'desc' }
      });

      return files;
    }
    static async create(payload: unknown){
        const data=  fileCreateSchema.parse(payload);
        return prisma.application_files.create({ data })
    }
    static async update(id: number, payload: unknown){
        const data = fileUpdateSchema.parse(payload);
        return prisma.application_files.update({
            where: {id},
            data,
        });
    }

    static async remove(id: number){
        return prisma.application_files.delete({
            where: {id}
        })
    }
}
