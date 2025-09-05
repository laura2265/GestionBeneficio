import { historyCreateSchema, historyUpdateSchema } from "../Schemas/history.schema.js";
import { prisma } from "../db.js";

export class HistoryService{
    static async list(applicationId: number){
       const history = await prisma.application_history.findMany({
        where: { application_id: applicationId },
        orderBy: { id: 'desc' }
      });

      return history;
    }

    static async create(payload: unknown){
        const data = historyCreateSchema.parse(payload);
        return prisma.application_history.create({ data })
    }

    static async update(id: number, payload: unknown){
        const data = historyUpdateSchema.parse(payload);
        return prisma.application_history.update({
            where: {id},
            data
        })
    }

}