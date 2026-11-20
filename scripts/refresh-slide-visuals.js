#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PAPER = '#FAFAF7';
const INK = '#4A4338';
const MUTED = '#908878';
const ACCENT = '#C45A20';
const ACCENT_FILL = '#FDF0E6';
const SAGE = '#DDE5D8';
const BLUE = '#DCE5EA';
const SAND = '#E8E2D8';

const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function text(x, y, value, options = {}) {
  const { size = 22, weight = 650, anchor = 'middle', fill = INK, family = 'Arial, sans-serif' } = options;
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(value)}</text>`;
}

function box(x, y, w, h, label, options = {}) {
  const { fill = PAPER, stroke = INK, size = 20, sub = '', dashed = false } = options;
  return [
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="2.5"${dashed ? ' stroke-dasharray="8 7"' : ''}/>` ,
    text(x + w / 2, y + h / 2 + (sub ? -3 : 7), label, { size }),
    sub ? text(x + w / 2, y + h / 2 + 24, sub, { size: 14, weight: 500, fill: MUTED }) : '',
  ].join('');
}

function arrow(x1, y1, x2, y2, label = '', options = {}) {
  const { stroke = ACCENT, dashed = false } = options;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return [
    `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="3"${dashed ? ' stroke-dasharray="8 7"' : ''} marker-end="url(#arrow)"/>`,
    label ? text(mx, my - 10, label, { size: 14, weight: 600, fill: stroke }) : '',
  ].join('');
}

function svg(title, subtitle, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="460" viewBox="0 0 760 460" role="img" aria-labelledby="title desc">
  <title id="title">${esc(title)}</title>
  <desc id="desc">${esc(subtitle)}</desc>
  <defs>
    <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="${ACCENT}"/></marker>
  </defs>
  <rect width="760" height="460" fill="${PAPER}"/>
  ${text(42, 47, title, { anchor: 'start', size: 26, weight: 750 })}
  ${text(42, 75, subtitle, { anchor: 'start', size: 15, weight: 500, fill: MUTED })}
  <path d="M42 91 C180 88, 310 94, 452 90" fill="none" stroke="${ACCENT}" stroke-width="3"/>
  ${body}
</svg>`;
}

function flow(nodes, options = {}) {
  const { y = 205, start = 55, gap = 34, width = 135, height = 76 } = options;
  const parts = [];
  nodes.forEach((node, index) => {
    const x = start + index * (width + gap);
    parts.push(box(x, y, width, height, node.label, { fill: node.fill || (index === nodes.length - 1 ? ACCENT_FILL : SAND), sub: node.sub || '' }));
    if (index < nodes.length - 1) parts.push(arrow(x + width, y + height / 2, x + width + gap - 6, y + height / 2, node.edge || ''));
  });
  return parts.join('');
}

function layers(items, options = {}) {
  const { x = 165, y = 125, width = 430, height = 54, gap = 14 } = options;
  return items.map((item, index) => box(x, y + index * (height + gap), width, height, item.label, {
    fill: item.fill || [ACCENT_FILL, SAGE, BLUE, SAND][index % 4],
    dashed: item.dashed,
    sub: item.sub || '',
  })).join('');
}

function hub(center, nodes) {
  const cx = 380;
  const cy = 260;
  const positions = [[70, 145], [535, 145], [70, 320], [535, 320]];
  const parts = [box(292, 220, 176, 82, center, { fill: ACCENT_FILL, stroke: ACCENT })];
  nodes.forEach((node, index) => {
    const [x, y] = positions[index];
    parts.push(box(x, y, 155, 64, node, { fill: index % 2 ? BLUE : SAGE, size: 17 }));
    parts.push(arrow(x < cx ? x + 155 : x, y + 32, x < cx ? 286 : 474, cy, ''));
  });
  return parts.join('');
}

function compare(left, right, centerLabel) {
  return [
    box(70, 145, 240, 190, left.title, { fill: SAND, sub: left.sub }),
    box(450, 145, 240, 190, right.title, { fill: ACCENT_FILL, stroke: ACCENT, sub: right.sub }),
    arrow(320, 240, 440, 240, centerLabel),
    text(190, 300, left.note, { size: 16, weight: 550, fill: MUTED }),
    text(570, 300, right.note, { size: 16, weight: 650, fill: ACCENT }),
  ].join('');
}

function grid(items) {
  return items.map((item, index) => {
    const x = index % 2 === 0 ? 90 : 405;
    const y = index < 2 ? 135 : 270;
    return box(x, y, 265, 100, item.label, { fill: item.fill, stroke: item.stroke || INK, sub: item.sub });
  }).join('');
}

const diagrams = {
  'cli-revolution/figure-03-agent-layer.svg': svg('CLI = Agent Layer', 'Two product shifts converge on one machine-readable interface', [
    box(70, 150, 200, 74, 'SaaS', { fill: SAND, sub: 'less UI' }),
    box(70, 292, 200, 74, 'Agent', { fill: BLUE, sub: 'more code' }),
    arrow(270, 187, 475, 238, 'interface'),
    arrow(270, 329, 475, 278, 'execution'),
    box(480, 205, 210, 108, 'CLI', { fill: ACCENT_FILL, stroke: ACCENT, sub: 'shared agent layer' }),
  ].join('')),
  'cli-revolution/figure-04-cli-mother-tongue.svg': svg('CLI is the model’s mother tongue', 'Text streams compose without visual-state reconstruction', hub('LLM', ['grep', 'pipe', 'stdout', 'exit code'])),
  'cli-revolution/figure-05-interaction-cost.svg': svg('Interaction cost collapses', 'Fewer state transitions bring execution closer to intent', [
    box(100, 130, 465, 62, 'GUI', { fill: SAND, sub: '5 stateful steps' }),
    box(100, 225, 310, 62, 'Tool call', { fill: BLUE, sub: '3 structured steps' }),
    box(100, 320, 155, 62, 'CLI', { fill: ACCENT_FILL, stroke: ACCENT, sub: '1 command' }),
    arrow(610, 150, 610, 355, 'O(n) → O(1)'),
  ].join('')),
  'cli-revolution/figure-06-shared-protocol.svg': svg('One command, three consumers', 'Developers, CI, and agents execute the same protocol', hub('CLI', ['Developer', 'CI runner', 'Agent', 'same result'])),
  'cli-revolution/figure-07-product-stack.svg': svg('Product priority stack', 'Put stable interfaces below replaceable presentation', layers([
    { label: 'GUI', sub: 'thin, replaceable presentation', dashed: true, fill: PAPER },
    { label: 'Logic', sub: 'domain behavior', fill: BLUE },
    { label: 'CLI / API', sub: 'thick, stable foundation', fill: ACCENT_FILL },
  ], { y: 135, height: 70, gap: 22 })),

  'deepseek-v4/figure-03-hca-compression.svg': svg('CSA vs HCA', 'Trade a controlled amount of precision for long-context cost', compare(
    { title: 'CSA', sub: 'compress + select', note: 'balanced recall' },
    { title: 'HCA', sub: 'heavy compression', note: 'lower far-field cost' },
    'cost ↓',
  )),
  'deepseek-v4/figure-04-mhc-residual.svg': svg('mHC stabilizes residual paths', 'Constrained mixing keeps hybrid routes near residual behavior', [
    box(70, 210, 160, 78, 'Input', { fill: SAND }),
    box(300, 135, 180, 72, 'Hybrid paths', { fill: BLUE, sub: 'learned mixing' }),
    box(300, 285, 180, 72, 'mHC gate', { fill: ACCENT_FILL, stroke: ACCENT, sub: 'manifold constraint' }),
    box(550, 210, 140, 78, 'Stable output', { fill: SAGE }),
    arrow(230, 249, 294, 171), arrow(230, 249, 294, 321), arrow(480, 171, 544, 249), arrow(480, 321, 544, 249),
  ].join('')),
  'deepseek-v4/figure-05-muon-stability.svg': svg('Training stability is a system', 'Optimizer, normalization, and distributed runtime share one boundary', [
    box(275, 125, 210, 70, 'Attention', { fill: BLUE, sub: 'RMSNorm' }),
    box(90, 305, 210, 70, 'Muon', { fill: ACCENT_FILL, stroke: ACCENT, sub: 'no QK-Clip' }),
    box(460, 305, 210, 70, 'Framework', { fill: SAGE, sub: 'ZeRO' }),
    arrow(300, 305, 350, 200), arrow(460, 340, 300, 340), arrow(485, 200, 550, 305),
  ].join('')),
  'deepseek-v4/figure-06-kv-tiers.svg': svg('Tiered KV cache', 'Representation density changes as context gets colder', layers([
    { label: 'Raw KV', sub: 'dense · hottest tokens', fill: ACCENT_FILL },
    { label: 'Compressed KV', sub: 'smaller working set', fill: SAGE },
    { label: 'Far index', sub: 'sparse routing metadata', fill: BLUE },
    { label: 'Disk / host', sub: 'cold persistence', fill: SAND },
  ], { y: 112, height: 55, gap: 16 })),

  'nano-cc/figure-03-spec-boundary.svg': svg('Read the boundary, not every line', 'Architecture becomes legible when intent is separated from implementation', flow([
    { label: 'Spec', fill: SAND, edge: 'intent' },
    { label: 'Agent boundary', fill: ACCENT_FILL, edge: 'contract' },
    { label: 'Code', fill: SAGE },
  ], { y: 205, start: 90, width: 165, gap: 42 })),
  'nano-cc/figure-04-reverse-toolchain.svg': svg('Reverse-engineering toolchain', 'Each tool removes a different layer of accidental complexity', layers([
    { label: 'zread', sub: 'source retrieval', fill: SAND },
    { label: 'DeepWiki', sub: 'relationship graph', fill: BLUE },
    { label: '/init', sub: 'agent-readable map', fill: ACCENT_FILL },
  ], { x: 205, width: 350, y: 125, height: 70, gap: 24 })),
  'nano-cc/figure-05-dev-test-loop.svg': svg('Separate builder from verifier', 'The testing agent closes the loop with observable pass/fail evidence', [
    box(80, 205, 190, 90, 'Developer Agent', { fill: BLUE, sub: 'build' }),
    box(490, 205, 190, 90, 'Tester Agent', { fill: SAGE, sub: 'verify' }),
    arrow(270, 230, 484, 230, 'candidate'),
    arrow(490, 275, 276, 275, 'fail / evidence'),
    box(305, 330, 150, 55, 'PASS', { fill: ACCENT_FILL, stroke: ACCENT }),
  ].join('')),
  'nano-cc/figure-06-python-docs.svg': svg('Simplify the implementation surface', 'Prefer inspectable code and explicit documentation over framework weight', compare(
    { title: 'TS heavy', sub: 'framework layers', note: 'large surface' },
    { title: 'Python + Docs', sub: 'direct loop', note: 'small surface' },
    'simplify',
  )),
  'nano-cc/figure-07-practice-stack.svg': svg('Agentic engineering memory stack', 'Instructions, history, and exploration serve different time horizons', layers([
    { label: 'Vibe Coding', sub: 'rapid exploration', fill: PAPER, dashed: true },
    { label: 'Git Log', sub: 'decision history', fill: BLUE },
    { label: 'AGENTS.md', sub: 'durable operating contract', fill: ACCENT_FILL },
  ], { y: 135, height: 70, gap: 22 })),

  'quant-agent/figure-03-research-repl.svg': svg('Research REPL, not an auto-trader', 'The terminal coordinates tools while the human keeps decision authority', hub('whyj >', ['Research', 'Agent tools', 'No auto trade', 'Human in loop'])),
  'quant-agent/figure-04-dual-entry.svg': svg('Two entries, one service core', 'Deterministic commands and orchestrated language share the same computation', [
    box(70, 145, 180, 72, '/slash', { fill: SAND, sub: 'deterministic' }),
    box(70, 300, 180, 72, 'Natural language', { fill: BLUE, sub: 'orchestrated' }),
    box(330, 145, 170, 72, 'Registry', { fill: SAGE }),
    box(330, 300, 170, 72, 'pi Agent', { fill: ACCENT_FILL }),
    box(565, 220, 140, 90, 'Services', { fill: ACCENT_FILL, stroke: ACCENT }),
    arrow(250, 181, 324, 181), arrow(250, 336, 324, 336), arrow(500, 181, 559, 250), arrow(500, 336, 559, 280),
  ].join('')),
  'quant-agent/figure-05-storage-policy.svg': svg('Storage policy by lifecycle', 'Cache reproducible market data, never silently persist portfolio state', grid([
    { label: 'durable', sub: 'settings', fill: SAGE },
    { label: 'cache', sub: 'market bars', fill: BLUE },
    { label: 'artifact', sub: 'benchmarks · sessions', fill: SAND },
    { label: 'forbidden ×', sub: 'portfolio', fill: ACCENT_FILL, stroke: ACCENT },
  ])),
};

function writeFigures() {
  for (const [relativePath, content] of Object.entries(diagrams)) {
    const target = path.join(ROOT, 'examples', relativePath.replace('/', '/figures/'));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, 'utf8');
  }
}

function findDivEnd(source, start) {
  const tokenPattern = /<div\b|<\/div>/gi;
  tokenPattern.lastIndex = start;
  let depth = 0;
  for (const match of source.matchAll(tokenPattern)) {
    depth += match[0].toLowerCase() === '</div>' ? -1 : 1;
    if (depth === 0) return match.index + match[0].length;
  }
  throw new Error(`Unclosed visual-box at offset ${start}`);
}

function replacePromptBoxes(relativeFile, imagePaths) {
  const file = path.join(ROOT, relativeFile);
  let source = fs.readFileSync(file, 'utf8');
  let cursor = 0;
  let imageIndex = 0;
  while (true) {
    const start = source.indexOf('<div class="visual-box', cursor);
    if (start < 0) break;
    const openEnd = source.indexOf('>', start) + 1;
    const end = findDivEnd(source, start);
    const block = source.slice(start, end);
    if (/Codex imagegen|Figure prompt/i.test(block)) {
      const imagePath = imagePaths[imageIndex++];
      if (!imagePath) throw new Error(`Missing image mapping for ${relativeFile}`);
      const alt = path.basename(imagePath, '.svg').replaceAll('-', ' ');
      const replacement = `${source.slice(start, openEnd)}\n                <img src="${imagePath}" alt="${alt}" />\n              </div>`;
      source = source.slice(0, start) + replacement + source.slice(end);
      cursor = start + replacement.length;
    } else {
      cursor = end;
    }
  }
  if (imageIndex !== 0 && imageIndex !== imagePaths.length) {
    throw new Error(`Expected ${imagePaths.length} prompt boxes in ${relativeFile}; replaced ${imageIndex}`);
  }
  fs.writeFileSync(file, source, 'utf8');
}

function replaceDslVisuals(relativeFile, imagePaths) {
  const file = path.join(ROOT, relativeFile);
  let index = 0;
  const source = fs.readFileSync(file, 'utf8').replace(/::visual\s*\{[^\r\n]*\}\s*::/g, () => {
    const imagePath = imagePaths[index++];
    if (!imagePath) throw new Error(`Missing DSL image mapping for ${relativeFile}`);
    return `::image [${imagePath}] [scale=100] ::`;
  });
  if (index !== 0 && index !== imagePaths.length) {
    throw new Error(`Expected ${imagePaths.length} visual prompts in ${relativeFile}; replaced ${index}`);
  }
  fs.writeFileSync(file, source, 'utf8');
}

function mirrorDesignAssets() {
  const topics = ['cli-revolution', 'deepseek-v4', 'nano-cc'];
  for (const topic of topics) {
    const sourceDir = path.join(ROOT, 'examples', topic, 'figures');
    const targetDir = path.join(ROOT, 'skills/synapse-talk-slides/references/figures', topic);
    fs.mkdirSync(targetDir, { recursive: true });
    for (const file of fs.readdirSync(sourceDir).filter((name) => name.endsWith('.svg'))) {
      fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
    }
  }
}

function stripPromptCaptions(relativeFile) {
  const file = path.join(ROOT, relativeFile);
  const source = fs.readFileSync(file, 'utf8');
  const cleaned = source.replace(/\s*<div class="visual-caption">Codex imagegen<br\s*\/?>\[[\s\S]*?<\/div>/gi, '');
  fs.writeFileSync(file, cleaned, 'utf8');
}

writeFigures();

replacePromptBoxes('examples/cli-revolution/cli-revolution-slides.html', [
  './figures/figure-03-agent-layer.svg', './figures/figure-04-cli-mother-tongue.svg', './figures/figure-06-shared-protocol.svg',
]);
replacePromptBoxes('examples/deepseek-v4/deepseek-v4-slides.html', [
  './figures/figure-03-hca-compression.svg', './figures/figure-04-mhc-residual.svg', './figures/figure-05-muon-stability.svg', './figures/figure-06-kv-tiers.svg',
]);
replacePromptBoxes('examples/nano-cc/nano-cc-slides.html', [
  './figures/figure-03-spec-boundary.svg', './figures/figure-04-reverse-toolchain.svg', './figures/figure-05-dev-test-loop.svg',
]);
replacePromptBoxes('examples/quant-agent/quant-agent-slides.html', [
  './figures/figure-03-research-repl.svg', './figures/figure-04-dual-entry.svg', './figures/figure-05-storage-policy.svg',
]);

replaceDslVisuals('examples/cli-revolution/cli-revolution-slides.dsl.md', [
  './figures/figure-03-agent-layer.svg', './figures/figure-04-cli-mother-tongue.svg', './figures/figure-06-shared-protocol.svg',
]);
replaceDslVisuals('examples/deepseek-v4/deepseek-v4-slides.dsl.md', [
  './figures/figure-03-hca-compression.svg', './figures/figure-04-mhc-residual.svg', './figures/figure-05-muon-stability.svg', './figures/figure-06-kv-tiers.svg',
]);
replaceDslVisuals('examples/nano-cc/nano-cc-slides.dsl.md', [
  './figures/figure-03-spec-boundary.svg', './figures/figure-04-reverse-toolchain.svg', './figures/figure-05-dev-test-loop.svg',
]);
replaceDslVisuals('examples/quant-agent/quant-agent-slides.dsl.md', [
  './figures/figure-03-research-repl.svg', './figures/figure-04-dual-entry.svg', './figures/figure-05-storage-policy.svg',
]);

replaceDslVisuals('examples/team-vibe-coding-404/team-vibe-coding-404-slides.dsl.md', [
  './figures/slide-01-context.png', './figures/slide-03-ceo-cto.png', './figures/slide-04-pm-project.png',
  './figures/slide-05-dev-cognitive-outsourcing.png', './figures/slide-06-dev-knowledge-loss.png', './figures/slide-07-qa-ops-team.png',
  './figures/slide-09-opc-context.png', './figures/slide-10-death-spiral.png', './figures/slide-11-principle-amplifier-vs-crutch.png',
  './figures/slide-12-principle-tool-lock.png', './figures/slide-13-principle-shadow-team.png', './figures/slide-14-principle-user-contact.png',
]);

stripPromptCaptions('examples/heterogeneous-inference-progress/heterogeneous-inference-progress-slides.html');

mirrorDesignAssets();

replacePromptBoxes('skills/synapse-talk-slides/references/WHYJ-SLIDES.html', [
  './figures/cli-revolution/figure-03-agent-layer.svg',
]);

replacePromptBoxes('skills/synapse-talk-slides/references/e2e-v6.0-cli-revolution-slides.html', [
  './figures/cli-revolution/figure-03-agent-layer.svg', './figures/cli-revolution/figure-05-interaction-cost.svg',
  './figures/cli-revolution/figure-06-shared-protocol.svg', './figures/cli-revolution/figure-07-product-stack.svg',
]);
replacePromptBoxes('skills/synapse-talk-slides/references/e2e-v6.0-deepseek-v4-slides.html', [
  './figures/deepseek-v4/figure-01-cost-curve.svg', './figures/deepseek-v4/figure-02-hybrid-attention.svg',
  './figures/deepseek-v4/figure-03-hca-compression.svg', './figures/deepseek-v4/figure-04-mhc-residual.svg',
  './figures/deepseek-v4/figure-05-muon-stability.svg', './figures/deepseek-v4/figure-06-kv-tiers.svg',
]);
replacePromptBoxes('skills/synapse-talk-slides/references/e2e-v6.0-nano-cc-slides.html', [
  './figures/nano-cc/figure-01-agent-loop.svg', './figures/nano-cc/figure-03-spec-boundary.svg',
  './figures/nano-cc/figure-04-reverse-toolchain.svg', './figures/nano-cc/figure-05-dev-test-loop.svg',
  './figures/nano-cc/figure-06-python-docs.svg', './figures/nano-cc/figure-07-practice-stack.svg',
]);

console.log(`Refreshed ${Object.keys(diagrams).length} concrete slide visuals and removed prompt placeholders.`);
