#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let randomState = 0x5a17c0de;
Math.random = () => {
  randomState = (randomState + 0x6d2b79f5) | 0;
  let value = Math.imul(randomState ^ (randomState >>> 15), 1 | randomState);
  value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

const L = require('../skills/synapse-excalidraw/scripts/layout');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'docs/assets/diagrams');
const SOURCE = path.join(OUTPUT_DIR, 'synapse-pipeline.excalidraw');
const SVG = path.join(OUTPUT_DIR, 'synapse-pipeline.svg');
const CONVERTER = path.join(ROOT, 'skills/synapse-excalidraw/scripts/exc-to-svg.js');

const BG = '#F0ECE6';
const INK = '#4A4338';
const MUTED = '#908878';
const ACCENT = { fill: '#F7E5D8', stroke: '#C45A20' };
const PAPER = { fill: '#FAFAF7', stroke: '#B0A898' };

function addCanvas() {
  L.elements.push({
    type: 'rectangle', id: 'readme_canvas', x: 20, y: 20, width: 1160, height: 860,
    strokeColor: BG, backgroundColor: BG, fillStyle: 'solid', strokeWidth: 1,
    roughness: 0, opacity: 100, angle: 0, seed: 1, groupIds: [],
    boundElements: [], roundness: null, isDeleted: false, link: null, locked: true,
  });
}

function addText(x, y, width, text, fontSize, color = INK, align = 'left') {
  L.elements.push({
    type: 'text', id: `readme_text_${L.elements.length}`, x, y, width,
    height: text.split('\n').length * fontSize * 1.3, text, fontSize,
    fontFamily: 1, textAlign: align, verticalAlign: 'top', strokeColor: color,
    backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1,
    roughness: 2, opacity: 100, angle: 0, seed: 100 + L.elements.length,
    groupIds: [], boundElements: [], lineHeight: 1.3,
  });
}

function fixedPoint(shape, x, y) {
  const nx = Math.abs(x - shape.x) < 1 ? 0 : Math.abs(x - (shape.x + shape.width)) < 1 ? 1 : 0.5;
  const ny = Math.abs(y - shape.y) < 1 ? 0 : Math.abs(y - (shape.y + shape.height)) < 1 ? 1 : 0.5;
  return [nx, ny];
}

function finalizeBindings() {
  const byId = new Map(L.elements.map((element) => [element.id, element]));
  for (const arrow of L.elements.filter((element) => element.type === 'arrow')) {
    if (!arrow.startBinding || !arrow.endBinding) continue;
    const source = byId.get(arrow.startBinding.elementId);
    const target = byId.get(arrow.endBinding.elementId);
    const [start, end] = arrow.points;
    arrow.startBinding.fixedPoint = fixedPoint(source, arrow.x + start[0], arrow.y + start[1]);
    arrow.endBinding.fixedPoint = fixedPoint(target, arrow.x + end[0], arrow.y + end[1]);
  }
}

function main() {
  L.reset();
  L.configure({
    tokens: { ink: INK, inkMuted: MUTED, step: ACCENT, insight: PAPER },
    defaults: { roughness: 2, strokeWidth: 2, fontFamily: 1 },
  });
  const p = L.morandi('warm');
  addCanvas();

  addText(70, 72, 1060, 'SYNAPSE · THE HIGH-PRESSURE LOGIC FORGE', 30, INK, 'center');
  addText(180, 126, 840, 'Turn noisy source material into an argument people can see.', 18, MUTED, 'center');

  const labels = [
    '01 · INPUT\nURLs · files · notes',
    '02 · FORGE\nextract · verify · synthesize',
    '03 · DSL\nargument spine',
    '04 · COMPOSE\ndesign · type · diagrams',
    '05 · PUBLISH\nslides · blog · motion',
  ];
  const palette = [p.embedding, p.attention, PAPER, p.feedforward, ACCENT];
  const boxes = labels.map((label, index) =>
    L.place(65 + index * 224, 280, 176, 100, 'rectangle', palette[index], label, 15),
  );
  boxes.slice(1).forEach((box, index) => L.arrowBetween(boxes[index], box, INK, 2));

  L.place(65, 485, 310, 105, 'rectangle', PAPER,
    'TRACEABLE INPUT\nKeep claims, evidence, and local assets\nconnected to their sources.', 15);
  L.place(445, 485, 310, 105, 'rectangle', PAPER,
    'ONE LOGIC CORE\nThe same DSL drives slides, articles,\ndiagrams, and animation.', 15);
  L.place(825, 485, 310, 105, 'rectangle', PAPER,
    'FINISHED VISUALS\nShip real embedded assets—not prompts\npretending to be pictures.', 15);

  L.place(165, 710, 870, 76, 'rectangle', ACCENT,
    'THE PAYOFF  ·  Less formatting drift. More reasoning density. One reproducible pipeline.', 17);
  addText(305, 825, 590, 'Why.J Engineering · v2.0.0 · Editable Excalidraw source included', 14, MUTED, 'center');

  const issues = L.validate(12);
  if (issues.length) throw new Error(`README diagram has ${issues.length} layout issue(s)`);
  finalizeBindings();

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  L.write(SOURCE, { bgColor: BG, source: 'synapse-readme-diagram' });
  execFileSync(process.execPath, [CONVERTER, SOURCE, SVG], { stdio: 'inherit' });
}

main();
