export const FILE_KINDS = [
    "CEDULA",
    "CONTRATO",
    "EVIDENCIA_ESTRATO_SISBEN",
    "FOTO_FACHADA",
    "PRUEBA_VELOCIDAD",
    "VERIFICACION_ENERGIA",
    "DECLARACION_JURAMENTADA",
    "OTRO",
];
export function normalizeKind(input) {
    switch (input) {
        case "RECIBO":
        case "RECIBO_PUBLICO":
            return "EVIDENCIA_ESTRATO_SISBEN";
        default:
            return input;
    }
}
