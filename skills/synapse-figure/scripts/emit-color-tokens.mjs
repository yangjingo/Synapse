import fs from "node:fs/promises";

function usage() {
  console.error("Usage: node emit-color-tokens.mjs <palette.json> [css|json]");
  process.exit(1);
}

const [, , palettePath, format = "css"] = process.argv;
if (!palettePath) usage();

const palette = JSON.parse(await fs.readFile(palettePath, "utf8"));

if (format === "json") {
  console.log(JSON.stringify(palette, null, 2));
  process.exit(0);
}

const lines = [":root {"];
for (const [key, value] of Object.entries(palette)) {
  lines.push(`  --fig-${key}: ${value};`);
}
lines.push("}");
console.log(lines.join("\n"));
