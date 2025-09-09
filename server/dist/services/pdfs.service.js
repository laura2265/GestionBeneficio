// imports (ajusta rutas a tu proyecto)
import path from "path";
import fs from "fs/promises";
import { prisma } from "../db.js";
import { generateResolutionPdfFile } from "../utils/generatePdfToFile.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library.js";
export class PdfsService {
    static async list(applicationId) {
        const pdfs = await prisma.application_pdfs.findMany({
            where: { application_id: applicationId },
            orderBy: { id: 'desc' }
        });
        return pdfs;
    }
    static async create(inputRaw, userId) {
        const applicationId = BigInt(inputRaw.application_id);
        const generatedBy = userId ?? null;
        const MAX_RETRIES = 2;
        let attempt = 0;
        while (true) {
            try {
                return await prisma.$transaction(async (tx) => {
                    // versión
                    const agg = await tx.application_pdfs.aggregate({
                        where: { application_id: applicationId },
                        _max: { version: true },
                    });
                    const nextVersion = (agg._max.version ?? 0) + 1;
                    // rutas
                    const fileName = `RESOLUCION_${applicationId}_v${nextVersion}.pdf`;
                    const storagePathPosix = path.posix.join("/storage/pdfs", String(applicationId), fileName);
                    const storageDirAbs = path.join(process.cwd(), "storage", "pdfs", String(applicationId));
                    const storageFileAbs = path.join(storageDirAbs, fileName);
                    await fs.mkdir(storageDirAbs, { recursive: true });
                    // GENERAR PDF (solo info, SIN adjuntos)
                    await generateResolutionPdfFile({
                        application_id: Number(applicationId),
                        tipo: "RESOLUCION",
                        decision: inputRaw.decision,
                        comentario: inputRaw.comentario,
                        motivo: inputRaw.motivo,
                        data: inputRaw.data ?? {},
                    }, storageFileAbs);
                    // guardar en DB
                    const created = await tx.application_pdfs.create({
                        data: {
                            application_id: applicationId,
                            version: nextVersion,
                            file_name: fileName,
                            storage_path: storagePathPosix,
                            generated_by: generatedBy,
                        },
                    });
                    return { ...created, url: storagePathPosix };
                });
            }
            catch (e) {
                const isUnique = e?.code === "P2002" ||
                    (e instanceof PrismaClientKnownRequestError && e.code === "P2002");
                if (isUnique && attempt < MAX_RETRIES) {
                    attempt++;
                    continue;
                }
                throw e;
            }
        }
    }
    static async remove(id) {
        return prisma.application_pdfs.delete({ where: { id: BigInt(id) } });
    }
}
