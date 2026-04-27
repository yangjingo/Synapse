import fs from "node:fs/promises";
import path from "node:path";

function esc(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function usage() {
  console.error("Usage: node make-svg-scaffold.mjs <spec.json> <output.svg>");
  process.exit(1);
}

const [, , specPath, outputPath] = process.argv;
if (!specPath || !outputPath) usage();

const spec = JSON.parse(await fs.readFile(specPath, "utf8"));
const width = spec.width ?? 1600;
const height = spec.height ?? 900;
const title = spec.title ?? "Technical Figure";
const palette = {
  bg: "#F8FAFC",
  panel: "#FFFFFF",
  border: "#CBD5E1",
  text: "#0F172A",
  muted: "#475569",
  primary: "#0EA5E9",
  secondary: "#F59E0B",
  success: "#10B981",
  ...spec.palette,
};

const blocks = (spec.blocks ?? []).map((block) => {
  const fill = block.fill ? palette[block.fill] ?? block.fill : palette.panel;
  const stroke = block.stroke ? palette[block.stroke] ?? block.stroke : palette.border;
  const rx = block.rx ?? 16;
  const label = block.label
    ? `<text x="${block.x + 20}" y="${block.y + 34}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="20" font-weight="600" fill="${palette.text}">${esc(block.label)}</text>`
    : "";
  const body = block.body
    ? `<text x="${block.x + 20}" y="${block.y + 66}" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="14" fill="${palette.muted}">${esc(block.body)}</text>`
    : "";
  return [
    `<rect x="${block.x}" y="${block.y}" width="${block.width}" height="${block.height}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`,
    label,
    body,
  ].join("\n");
});

const arrows = (spec.arrows ?? []).map((arrow) => {
  const color = palette[arrow.color] ?? arrow.color ?? palette.primary;
  const label = arrow.label
    ? `<text x="${arrow.labelX ?? (arrow.x1 + arrow.x2) / 2}" y="${arrow.labelY ?? (arrow.y1 + arrow.y2) / 2 - 8}" text-anchor="middle" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="13" fill="${palette.muted}">${esc(arrow.label)}</text>`
    : "";
  return [
    `<line x1="${arrow.x1}" y1="${arrow.y1}" x2="${arrow.x2}" y2="${arrow.y2}" stroke="${color}" stroke-width="3" marker-end="url(#arrowhead)" />`,
    label,
  ].join("\n");
});

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="${palette.primary}" />
    </marker>
  </defs>
  <rect width="${width}" height="${height}" fill="${palette.bg}" />
  <text x="48" y="64" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="30" font-weight="700" fill="${palette.text}">${esc(title)}</text>
  ${blocks.join("\n")}
  ${arrows.join("\n")}
</svg>`;

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, svg, "utf8");
console.log(`Wrote ${outputPath}`);
