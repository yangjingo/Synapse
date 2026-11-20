#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

let randomState = 0x51a7e5e;
Math.random = () => {
  randomState = (randomState + 0x6d2b79f5) | 0;
  let value = Math.imul(randomState ^ (randomState >>> 15), 1 | randomState);
  value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

const L = require('../skills/synapse/excalidraw/scripts/layout');

const ROOT = path.resolve(__dirname, '..');
const SVG_CONVERTER = path.join(ROOT, 'skills/synapse/excalidraw/scripts/exc-to-svg.js');
const BG = '#FAFAF7';
const INK = '#4A4338';
const MUTED = '#908878';
const ACCENT = { fill: '#FDF0E6', stroke: '#C45A20' };
const NEUTRAL = { fill: '#E8E2DA', stroke: '#B0A898' };
let arrowCounter = 0;

function setup() {
  L.reset();
  arrowCounter = 0;
  const p = L.morandi('warm');
  L.configure({
    tokens: { ink: INK, inkMuted: MUTED, step: ACCENT, insight: NEUTRAL },
    defaults: { roughness: 2, strokeWidth: 2, fontFamily: 1 },
  });
  return p;
}

function boundArrow(from, to, x1, y1, x2, y2) {
  if (x1 !== x2 && y1 !== y2) throw new Error('Bound arrows must be axis-aligned');
  const id = `refresh_arrow_${arrowCounter++}`;
  const source = L.elements.find((element) => element.id === from.id);
  const target = L.elements.find((element) => element.id === to.id);
  const arrow = {
    type: 'arrow', id, x: x1, y: y1,
    width: Math.abs(x2 - x1), height: Math.abs(y2 - y1),
    points: [[0, 0], [x2 - x1, y2 - y1]],
    strokeColor: INK, backgroundColor: 'transparent', fillStyle: 'solid',
    strokeWidth: 2, roughness: 2, opacity: 100, angle: 0, seed: 1000 + arrowCounter,
    groupIds: [], boundElements: [], startArrowhead: null, endArrowhead: 'arrow',
    startBinding: { elementId: from.id, focus: 0, gap: 4, fixedPoint: fixedPoint(source, x1, y1) },
    endBinding: { elementId: to.id, focus: 0, gap: 4, fixedPoint: fixedPoint(target, x2, y2) },
  };
  source.boundElements.push({ id, type: 'arrow' });
  target.boundElements.push({ id, type: 'arrow' });
  L.elements.push(arrow);
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

function title(text) {
  L.text(600, 34, text, 28, INK);
}

function wrapWords(text, maxChars = 58) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && candidate.length > maxChars) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

function insight(text) {
  return L.place(300, 790, 600, 70, 'rectangle', ACCENT, wrapWords(text), 16);
}

function horizontalFlow(items, y, palette, x = 60, width = 180, gap = 32) {
  const boxes = items.map((item, index) =>
    L.place(x + index * (width + gap), y, width, 82, 'rectangle', palette[index % palette.length], item, 15),
  );
  boxes.slice(1).forEach((box, index) => L.arrowBetween(boxes[index], box));
  return boxes;
}

function verticalFlow(items, x, palette, y = 100, width = 250, height = 70, gap = 28) {
  const boxes = items.map((item, index) =>
    L.place(x, y + index * (height + gap), width, height, 'rectangle', palette[index % palette.length], item, 15),
  );
  boxes.slice(1).forEach((box, index) => L.arrowBetween(boxes[index], box));
  return boxes;
}

function save(relativeStem, build, mirrorStem = null) {
  const palette = setup();
  build(palette);
  const issues = L.validate(12);
  if (issues.length) throw new Error(`${relativeStem}: layout validation failed`);
  finalizeBindings();
  const excalidrawPath = path.join(ROOT, `${relativeStem}.excalidraw`);
  const svgPath = path.join(ROOT, `${relativeStem}.svg`);
  fs.mkdirSync(path.dirname(excalidrawPath), { recursive: true });
  L.write(excalidrawPath, { bgColor: BG, source: 'synapse-blog-figure-refresh' });
  execFileSync(process.execPath, [SVG_CONVERTER, excalidrawPath, svgPath], { stdio: 'inherit' });
  if (mirrorStem) {
    const mirrorExcalidraw = path.join(ROOT, `${mirrorStem}.excalidraw`);
    const mirrorSvg = path.join(ROOT, `${mirrorStem}.svg`);
    fs.mkdirSync(path.dirname(mirrorExcalidraw), { recursive: true });
    fs.copyFileSync(excalidrawPath, mirrorExcalidraw);
    fs.copyFileSync(svgPath, mirrorSvg);
  }
}

save('examples/opd/figure/figure1', (p) => {
  title('DeepSeek-R1 Post-Training Pipeline');
  horizontalFlow(['V3 Base', 'Reasoning RL\nGRPO', 'Cold-start SFT', 'Alignment RL', 'DeepSeek-R1'], 300,
    [p.embedding, p.attention, p.masked, p.cross, ACCENT], 35, 185, 46);
  insight('RL discovers reasoning → SFT stabilizes format → RL aligns behavior');
}, 'skills/synapse/excalidraw/examples/opd-figures/figure-01-r1-pipeline');

save('examples/opd/figure/figure2', (p) => {
  title('R1 Family Evolution');
  const [base, zero, r1, distilled] = horizontalFlow(
    ['DeepSeek-V3 Base', 'R1-Zero\nPure RL', 'DeepSeek-R1\nSFT + RL', 'Distilled Models\nQwen / Llama'],
    300, [p.embedding, p.attention, ACCENT, p.output], 45, 240, 50,
  );
  insight('Capability is staged: explore first, stabilize next, then compress');
}, 'skills/synapse/excalidraw/examples/opd-figures/figure-02-r1-family');

save('examples/opd/figure/figure3', (p) => {
  title('Multi-Teacher On-Policy Distillation');
  const experts = ['Math Expert', 'Code Expert', 'Reasoning Expert'].map((label, index) =>
    L.place(80 + index * 350, 150, 260, 70, 'rectangle', [p.attention, p.feedforward, p.embedding][index], label, 16),
  );
  const student = L.place(80, 350, 960, 86, 'rectangle', p.masked, 'Student Rollout · On-policy tokens', 16);
  const opd = L.place(80, 540, 960, 86, 'rectangle', ACCENT, 'Multi-Teacher OPD · Dense token feedback', 16);
  const unified = L.place(430, 680, 260, 72, 'rectangle', p.output, 'Unified Model', 16);
  experts.forEach((expert) => boundArrow(expert, student, expert.cx, expert.bot, expert.cx, student.y));
  boundArrow(student, opd, student.cx, student.bot, opd.cx, opd.y);
  boundArrow(opd, unified, opd.cx, opd.bot, unified.cx, unified.y);
  insight('Experts teach along the student’s own trajectory—not a frozen answer set');
}, 'skills/synapse/excalidraw/examples/opd-figures/figure-03-multi-teacher-opd');

save('examples/opd/figure/figure4', (p) => {
  title('Forward KL vs. Reverse KL');
  L.text(290, 120, 'Forward KL · off-policy', 20, INK);
  const left = verticalFlow(['Teacher response', 'Fixed dataset', 'Student imitates'], 165,
    [p.attention, NEUTRAL, p.embedding], 175, 250, 72, 42);
  L.text(910, 120, 'Reverse KL · on-policy', 20, INK);
  const right = verticalFlow(['Student rollout', 'Teacher scores tokens', 'Student updates'], 785,
    [p.embedding, ACCENT, p.output], 175, 250, 72, 42);
  L.place(130, 620, 320, 86, 'rectangle', NEUTRAL, 'Sparse supervision\nTeacher distribution', 15);
  L.place(750, 620, 320, 86, 'rectangle', ACCENT, 'Dense supervision\nStudent distribution', 15);
  insight('The direction changes who generates the trajectory—and how dense the signal becomes');
}, 'skills/synapse/excalidraw/examples/opd-figures/figure-04-forward-reverse-kl');

save('examples/opd/figure/figure5', (p) => {
  title('MiMo-V2-Flash: Three Post-Training Stages');
  horizontalFlow(['Stage 1\nGeneral SFT', 'Stage 2\nDomain Experts', 'Search · Code\nMath · Reasoning', 'Stage 3\nMOPD', 'Unified Model'], 310,
    [p.embedding, p.attention, p.feedforward, ACCENT, p.output], 35, 185, 45);
  insight('SFT builds the floor; experts specialize; MOPD transfers token- and sequence-level signal');
}, 'skills/synapse/excalidraw/examples/opd-figures/figure-05-mimo-pipeline');

save('examples/opd/figure/figure6', (p) => {
  title('DeepSeek-V4 Expert Integration');
  const base = L.place(80, 110, 960, 76, 'rectangle', p.embedding, 'Base Model', 16);
  const experts = ['Prover Expert', 'Math Expert', 'Coder Expert'].map((label, index) =>
    L.place(80 + index * 350, 290, 260, 70, 'rectangle', [p.attention, p.masked, p.feedforward][index], label, 16),
  );
  const opd = L.place(80, 480, 960, 86, 'rectangle', ACCENT, 'Multi-Teacher OPD · Merge incremental knowledge', 16);
  const model = L.place(430, 670, 260, 76, 'rectangle', p.output, 'DeepSeek-V4 Unified', 16);
  experts.forEach((expert) => {
    boundArrow(base, expert, expert.cx, base.bot, expert.cx, expert.y);
    boundArrow(expert, opd, expert.cx, expert.bot, expert.cx, opd.y);
  });
  boundArrow(opd, model, opd.cx, opd.bot, model.cx, model.y);
  insight('Train specialists to the limit, then fuse their incremental knowledge into one policy');
}, 'skills/synapse/excalidraw/examples/opd-figures/figure-06-v4-expert-integration');

save('examples/opd/figure/figure7', (p) => {
  title('Why On-Policy Distillation Carries More Signal');
  L.text(300, 130, 'Forward KL', 20, INK);
  horizontalFlow(['Prompt', 'Teacher answer', 'One target'], 180,
    [NEUTRAL, p.attention, p.masked], 40, 150, 25);
  L.text(900, 130, 'Reverse KL / OPD', 20, INK);
  horizontalFlow(['Student rollout', 'Token scores', 'Dense updates'], 180,
    [p.embedding, ACCENT, p.output], 660, 150, 25);
  L.place(130, 470, 340, 100, 'rectangle', NEUTRAL, 'O(1) response-level signal\nMode-covering imitation', 16);
  L.place(730, 470, 340, 100, 'rectangle', ACCENT, 'O(N) token-level signal\nMode-seeking correction', 16);
  insight('Compatibility + new teacher knowledge determine whether the dense signal helps');
}, 'skills/synapse/excalidraw/examples/opd-figures/figure-07-token-signal');

save('examples/quant-agent/figures/fig-01-quantagent-pipeline', (p) => {
  title('QuantAgent: Fixed Multi-Agent Pipeline');
  const chain = verticalFlow(['OHLC Bars', 'Indicator Agent\nTA-Lib', 'Pattern Agent\nVision LLM', 'Trend Agent\nOLS + Vision', 'Risk Agent\nStop / Take-profit', 'Decision\nLONG / SHORT'], 110,
    [NEUTRAL, p.attention, p.masked, p.feedforward, p.cross, ACCENT], 100, 270, 62, 25);
  L.place(650, 220, 430, 260, 'rectangle', NEUTRAL,
    'Contrast: oh-my-quant\n\n1 Agent + 12 Tools\nDeterministic calculations\nHuman makes the decision', 17);
  insight('QuantAgent automates the decision chain; oh-my-quant keeps the human review gate');
});

save('examples/quant-agent/figures/fig-02-whyj-architecture', (p) => {
  title('oh-my-quant: One Agent, Twelve Tools');
  const slash = L.place(135, 120, 280, 70, 'rectangle', p.masked, '/slash command\nDeterministic', 15);
  const natural = L.place(785, 120, 280, 70, 'rectangle', p.embedding, 'Natural language\nAgent orchestration', 15);
  const agent = L.place(135, 270, 930, 82, 'rectangle', ACCENT, 'pi Agent · Single control loop', 17);
  boundArrow(slash, agent, slash.cx, slash.bot, slash.cx, agent.y);
  boundArrow(natural, agent, natural.cx, natural.bot, natural.cx, agent.y);
  const data = L.place(115, 470, 400, 120, 'rectangle', p.attention,
    'MCP Data Tools · 7\ntushare · llmquant · financial data', 15);
  const compute = L.place(685, 470, 400, 120, 'rectangle', p.feedforward,
    'Compute Tools · 5\nfactor · backtest · risk · score · dashboard', 15);
  boundArrow(agent, data, data.cx, agent.bot, data.cx, data.y);
  boundArrow(agent, compute, compute.cx, agent.bot, compute.cx, compute.y);
  L.place(115, 680, 400, 72, 'rectangle', NEUTRAL, '.ohquant/ local cache', 16);
  L.place(685, 680, 400, 72, 'rectangle', ACCENT, 'Human review · final decision', 16);
  insight('Deterministic math lives in tools; the LLM only sequences work and handles exceptions');
});

console.log('Refreshed 9 blog figures.');
