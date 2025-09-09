import puppeteer from "puppeteer";
import path from "path";
import fs from "fs/promises";

export type Decision = "APROBADA" | "RECHAZADA";

export type ResolutionPayload = {
  application_id: number;
  tipo: "RESOLUCION";
  decision: Decision;
  comentario?: string;
  motivo?: string;
  data: any;
};

const safe = (v: any) =>
  v === undefined || v === null || String(v).trim() === "" ? "—" : String(v);

export function renderResolutionHtml(p: ResolutionPayload) {
  const isAprobada = p.decision === "APROBADA";
  const field = (label: string, val?: any) => `
    <div class="row">
      <div class="label">${label}</div>
      <div class="value">${safe(val)}</div>
    </div>`;

  const created = (p.data?.created_at || "")
    .toString()
    .slice(0, 19)
    .replace("T", " ");
  const updated = (p.data?.updated_at || "")
    .toString()
    .slice(0, 19)
    .replace("T", " ");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Resolución — Solicitud #${p.application_id}</title>
  <style>
    @page { size: A4; margin: 20mm 18mm; }
    * { box-sizing: border-box; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial; }
    body { color: #111; font-size: 12px; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
    .brand { font-weight: 700; font-size: 14px; letter-spacing: .3px; }
    .muted { color: #6b7280; }
    h1 { font-size: 20px; margin: 6px 0 2px; }
    h2 { font-size: 14px; margin: 16px 0 6px; }

    .pill { display:inline-block; padding: 4px 8px; border-radius: 999px; font-weight:600; }
    .pill.aprobada { background:#059669; color:white; }
    .pill.rechazada { background:#dc2626; color:white; }

    .section { page-break-inside: avoid; margin-bottom: 10px; }
    .grid { display:grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
    .row { display:flex; gap: 8px; }
    .label { width: 40%; color:#374151; }
    .value { flex:1; color:#111827; font-weight:500; }
    .box { border:1px solid #e5e7eb; border-radius:10px; padding:10px; }
    .decision { display:flex; align-items:center; gap: 10px; }
    .note { border-left:3px solid #e5e7eb; padding:8px 10px; background:#f9fafb; border-radius:6px; }
    .hr { height:1px; background:#e5e7eb; margin:10px 0; }
  </style>
</head>
<body>
  <header>
    <div class="brand">Resolución del beneficio</div>
    <div class="muted">Solicitud #${p.application_id}</div>
  </header>

  <div class="section box">
    <div class="decision">
      <h1>Decisión</h1>
      <span class="pill ${isAprobada ? "aprobada" : "rechazada"}">
        ${isAprobada ? "APROBADA" : "RECHAZADA"}
      </span>
    </div>
    <div class="hr"></div>
    ${
      isAprobada
        ? `<div class="note"><strong>Comentario de aprobación:</strong><br>${safe(p.comentario)}</div>`
        : `<div class="note"><strong>Motivo del rechazo:</strong><br>${safe(p.motivo)}</div>`
    }
  </div>

  <div class="section box">
    <h2>Datos de la solicitud</h2>
    <div class="grid">
      ${field("Nombres", p.data?.nombres)}
      ${field("Apellidos", p.data?.apellidos)}
      ${field("Tipo documento", p.data?.tipo_documento)}
      ${field("Documento", p.data?.numero_documento)}
      ${field("Dirección", p.data?.direccion)}
      ${field("Barrio", p.data?.barrio)}
      ${field("UPZ", p.data?.UPZ)}
      ${field("Correo", p.data?.correo)}
      ${field("Teléfono", p.data?.numero_contacto)}
      ${field("Estrato", p.data?.estrato_id)}
      ${field("Declaración juramentada", String(p.data?.declaracion_juramentada))}
      ${field("Estado actual", p.data?.estado || p.data?.status)}
      ${field("Creado", created)}
      ${field("Actualizado", updated)}
    </div>
  </div>

  <footer>
    Generado automáticamente — ${new Date().toLocaleString()}
  </footer>
</body>
</html>`;
}

export async function generatePdfToFile({
  html,
  outPath,
  options,
}: {
  html: string;
  outPath: string;
  options?: {
    format?: "A4" | "Letter";
    margin?: { top: number | string; right: number | string; bottom: number | string; left: number | string };
    printBackground?: boolean;
    args?: string[];
  };
}) {
  const {
    format = "A4",
    margin = { top: "20mm", right: "18mm", bottom: "20mm", left: "18mm" },
    printBackground = true,
    args = ["--no-sandbox", "--font-render-hinting=medium"],
  } = options ?? {};

  await fs.mkdir(path.dirname(outPath), { recursive: true });

  const browser = await puppeteer.launch({ args });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.pdf({ path: outPath, format, margin, printBackground });
  } finally {
    await browser.close();
  }
}

export async function generateResolutionPdfFile(payload: ResolutionPayload, outPath: string) {
  const html = renderResolutionHtml(payload);
  await generatePdfToFile({ html, outPath });
  return outPath;
}
