#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'figures');
const WIDTH = 1200;
const HEIGHT = 675;
const PAPER = '#EEEDE4';
const SURFACE = '#F9F8F3';
const PANEL = '#EDEDE4';
const CORE = '#DBD9CF';
const LINE = '#99998F';
const INK = '#41413B';
const ACCENT = '#62756A';

fs.mkdirSync(OUTPUT, { recursive: true });

function escape(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function text(x, y, value, { size = 24, weight = 400, color = INK, anchor = 'start' } = {}) {
  return `<text x="${x}" y="${y}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${escape(value)}</text>`;
}

function rect(x, y, width, height, fill, stroke = 'none', radius = 12) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${fill}" stroke="${stroke}" stroke-width="2" rx="${radius}"/>`;
}

function line(x1, y1, x2, y2, color = LINE, width = 2.5, dash = '') {
  const pattern = dash ? ` stroke-dasharray="${dash}"` : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"${pattern}/>`;
}

function route(points, { color = LINE, width = 3.3, dash = '', arrow = false } = {}) {
  const pattern = dash ? ` stroke-dasharray="${dash}"` : '';
  const marker = arrow ? ` marker-end="url(#${color === ACCENT ? 'accent' : 'warm'}-arrow)"` : '';
  return `<polyline points="${points.map(point => point.join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${pattern}${marker}/>`;
}

function dot(x, y, radius, color, stroke = 'none') {
  return `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" stroke="${stroke}" stroke-width="2"/>`;
}

function panel(x, width, title) {
  return [
    rect(x, 94, width, 469, PANEL),
    text(x + 24, 144, title, { size: 28, weight: 600 }),
  ];
}

function write(filename, title, desc, body) {
  const markers = [['warm', LINE], ['accent', ACCENT]].map(([name, color]) =>
    `<marker id="${name}-arrow" markerWidth="19" markerHeight="18" refX="17" refY="9" orient="auto" markerUnits="userSpaceOnUse"><path d="M2 2 L17 9 L2 16" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></marker>`,
  );
  const markup = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title description">`,
    `<title id="title">${escape(title)}</title>`,
    `<desc id="description">${escape(desc)}</desc>`,
    '<defs>', ...markers, '</defs>',
    rect(0, 0, WIDTH, HEIGHT, PAPER, 'none', 0),
    rect(48, 48, 1104, 579, SURFACE, 'none', 20),
    ...body,
    '</svg>',
    '',
  ];
  fs.writeFileSync(path.join(OUTPUT, filename), markup.join('\n'));
}

const comparison = [
  ['V3.2', 100, 100, CORE],
  ['V4-Pro', 27, 10, ACCENT],
  ['V4-Flash', 10, 7, ACCENT],
];

function comparisonPanel(x, title, index) {
  const start = x + 137;
  const scale = 2.65;
  return [
    ...panel(x, 511, title),
    ...[0, 50, 100].flatMap(tick => [
      line(start + scale * tick, 196, start + scale * tick, 475, LINE, 1.5, tick ? '4 6' : ''),
      text(start + scale * tick, 513, `${tick}%`, { size: 23, anchor: 'middle' }),
    ]),
    ...comparison.flatMap((row, i) => {
      const y = 238 + i * 83;
      const pct = row[index];
      return [
        text(x + 24, y + 27, row[0], { size: 24, weight: 600 }),
        rect(start, y, scale * pct, 37, row[3], 'none', 3),
        text(start + scale * pct + 11, y + 27, `${pct}%`, { size: 24, weight: 600 }),
      ];
    }),
  ];
}

write('figure-01-cost-curve.svg', 'DeepSeek-V4 cost at 1M context',
  'Two equal-scale bar charts compare single-token inference FLOPs and KV cache. DeepSeek-V3.2 is the 100 percent baseline.',
  [
    ...comparisonPanel(68, 'Single-token FLOPs', 1),
    ...comparisonPanel(621, 'KV Cache size', 2),
    text(600, 602, '1M-token context · DeepSeek-V3.2 = 100%', { size: 23, anchor: 'middle' }),
  ]);

function attentionPanel(y, name, ratio, history) {
  const first = y + 93;
  const second = y + 174;
  const node = (x, center, width, value, fill = SURFACE) => [
    rect(x, center - 30, width, 60, fill, LINE),
    text(x + width / 2, center + 9, value, { size: 25, weight: 600, anchor: 'middle' }),
  ];
  return [
    rect(76, y, 1048, 221, PANEL),
    text(102, y + 42, name, { size: 28, weight: 600 }),
    ...node(178, first, 243, ratio),
    ...node(511, first, 250, history),
    ...node(511, second, 250, 'Local KV'),
    ...node(890, y + 133, 195, 'Attention', CORE),
    route([[421, first], [511, first]], { arrow: true }),
    route([[761, first], [824, first], [824, y + 120], [890, y + 120]], { arrow: true }),
    route([[761, second], [824, second], [824, y + 146], [890, y + 146]], { arrow: true }),
  ];
}

write('figure-02-hybrid-attention.svg', 'Hybrid attention within a CSA or HCA layer',
  'CSA selects top-k compressed KV entries. HCA attends densely over more heavily compressed KV. Each layer brings its own uncompressed sliding-window KV into attention.',
  [
    ...attentionPanel(93, 'CSA', '4:1 compression', 'Top-k compressed KV'),
    ...attentionPanel(348, 'HCA', '128:1 compression', 'All compressed KV'),
  ]);

write('opd-01-performance-compute.svg', 'Performance versus post-training compute',
  'Schematic curves illustrate SFT and SFT with rejection sampling, on-policy distillation approaching a teacher reference, and RL crossing the reference in the example.',
  [
    route([[123, 533], [1070, 533]], { arrow: true }),
    route([[123, 533], [123, 118]], { arrow: true }),
    text(123, 101, 'Performance', { size: 25, weight: 600 }),
    text(1070, 574, 'Post-training compute', { size: 25, anchor: 'end' }),
    line(123, 241, 889, 241, LINE, 2.5, '4 7'),
    text(145, 219, 'Teacher reference', { size: 23 }),
    route([[130,486],[239,401],[408,363],[618,350],[906,347]], { color: LINE, width: 4.5 }),
    route([[130,493],[254,434],[448,370],[684,327],[906,317]], { color: INK, width: 3.3, dash: '7 6' }),
    route([[130,499],[280,467],[464,399],[718,275],[906,244]], { color: ACCENT, width: 4.8 }),
    route([[130,503],[285,482],[477,426],[709,300],[906,184]], { color: INK, width: 4.2 }),
    text(927, 355, 'SFT', { size: 25, weight: 600 }),
    text(927, 325, 'SFT-RS', { size: 25, weight: 600 }),
    text(927, 252, 'OPD', { size: 25, weight: 600, color: ACCENT }),
    text(927, 192, 'RL', { size: 25, weight: 600 }),
  ]);

function gradientPanels(kind) {
  const rl = kind === 'rl';
  const vectors = rl
    ? [[-90,-31],[-55,68],[-23,-80],[1,82],[61,-85],[91,68],[125,-60],[146,14]]
    : [[95,-62],[111,-42],[121,-24],[124,0],[121,22],[110,44],[94,66],[84,80]];
  const mean = vectors.reduce(([x, y], [dx, dy]) => [x + dx, y + dy], [0, 0])
    .map(value => value / vectors.length);
  const left = 310;
  const right = 890;
  const y = 342;
  return [
    ...panel(76, 468, 'Token gradients'),
    ...panel(656, 468, 'Mean update'),
    line(left - 176, y, left + 176, y, LINE, 1.5, '4 7'),
    line(right - 176, y, right + 176, y, LINE, 1.5, '4 7'),
    ...vectors.map(([dx,dy]) => route([[left, y], [left + dx, y + dy]], { width: 2.7, arrow: true })),
    dot(left, y, 5, INK),
    dot(right, y, 5, INK),
    route([[right, y], [right + mean[0], y + mean[1]]], { color: ACCENT, width: 5, arrow: true }),
  ];
}

write('opd-02-rl-gradient-cancellation.svg', 'RL averaging can cancel noisy gradients',
  'Illustrative token gradients fan out on the left. Their mean on the same scale is smaller on the right.',
  gradientPanels('rl'));

write('opd-03-sft-gradient-bias.svg', 'SFT updates can reinforce a shared bias',
  'Illustrative token gradients are aligned on the left. Their mean on the same scale retains a consistent direction.',
  gradientPanels('sft'));

const tokenKL = [0.038,0.046,0.035,0.053,0.044,0.049,0.039,4.1,0.042,0.051,0.036,0.047];
const logY = value => 496 - 106 * Math.log10(value / 0.01);

write('opd-04-pivot-token.svg', 'A pivot token can dominate the KL term',
  'One illustrative token has KL 4.1 while the other eleven cluster around 0.04. The vertical axis is logarithmic.',
  [
    text(108, 125, 'Token KL · log scale', { size: 25, weight: 600 }),
    ...[0.01, 0.1, 1, 10].flatMap(tick => [
      line(112, logY(tick), 1104, logY(tick), LINE, 1.5, tick === 0.01 ? '' : '4 6'),
      text(95, logY(tick) + 8, tick, { size: 22, anchor: 'end' }),
    ]),
    ...tokenKL.flatMap((v, i) => {
      const x = 148 + i * 78;
      const y = logY(v);
      return [
        rect(x, y, 39, 496 - y, i === 7 ? ACCENT : CORE, 'none', 3),
        text(x + 19, 534, `t${i + 1}`, { size: 23, anchor: 'middle', weight: i === 7 ? 600 : 400 }),
      ];
    }),
    text(752, 169, '4.1', { size: 26, weight: 600, color: ACCENT }),
    route([[742, 184], [718, 184], [718, logY(4.1)]], { color: ACCENT, arrow: true }),
  ]);

write('opd-05-three-dials.svg', 'Three controls distinguish post-training methods',
  'A comparison table aligns sampling mix, advantage blend, and teacher choice across SFT, RL or GRPO, OPD, OPSD, and SDFT.',
  [
    rect(76, 119, 1048, 62, CORE),
    ...['Method', 'Sampling α', 'Advantage blend λ', 'Teacher'].map((label, index) =>
      text([103, 343, 584, 868][index], 159, label, { size: 26, weight: 600 })),
    ...[
      ['SFT', '0', '0', 'Data'],
      ['RL / GRPO', '1', '0', '—'],
      ['OPD', '1', '1', 'Same-family'],
      ['OPSD', '1', '1', 'Self + answer'],
      ['SDFT', '1', '1', 'Self + demo'],
    ].flatMap((row, i) => {
      const y = 192 + i * 72;
      return [
        rect(76, y, 1048, 61, PANEL),
        ...row.map((label, j) => text([103, 343, 584, 868][j], y + 39, label,
          { size: 26, weight: j === 0 ? 600 : 400 })),
      ];
    }),
  ]);

write('opd-06-pareto-frontier.svg', 'Reward gain versus KL budget',
  'An illustrative frontier places RL, OPD, and SFT at different KL budgets. A dotted guide relates the OPD point to a schematic lower-reward point at the same budget.',
  [
    route([[114, 525], [1070, 525]], { arrow: true }),
    route([[114, 525], [114, 128]], { arrow: true }),
    text(114, 108, 'Reward gain ΔR', { size: 25, weight: 600 }),
    text(1068, 564, 'KL budget β', { size: 25, anchor: 'end' }),
    `<path d="M128 480 C170 397 221 355 273 322 S405 250 492 224 S776 185 945 179 S1014 174 1050 172" fill="none" stroke="${ACCENT}" stroke-width="4.5" stroke-linecap="round"/>`,
    line(492, 235, 492, 380, LINE, 2.5, '5 6'),
    ...[
      [273,322,'RL',260,303,'end'],[492,224,'OPD',504,196,'start'],[945,179,'SFT',957,151,'start'],
    ].flatMap(([x,y,label,labelX,labelY,anchor]) => [
      dot(x,y,9,ACCENT),
      text(labelX, labelY, label, { size: 26, weight: 600, anchor }),
    ]),
    dot(492, 389, 9, SURFACE, LINE),
    text(517, 397, 'OPSD / SDFT', { size: 26 }),
  ]);

console.log('Refreshed 8 Synapse example illustrations.');
