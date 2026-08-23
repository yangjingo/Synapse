#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const OUT = path.join(__dirname, 'figures');
const BG = '#FAFAF7';
const INK = '#4A4338';
const MUTED = '#908878';
const ACCENT = '#C45A20';
const ACCENT_FILL = '#FDF0E6';
const SAGE = '#B9C2AE';
const SAGE_STROKE = '#7F8C70';
const CLAY = '#C8B8B0';
const ROSE = '#C7B0AD';
const NEUTRAL = '#E8E2DA';

fs.mkdirSync(OUT, { recursive: true });

function esc(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function text(x, y, value, size = 16, anchor = 'middle', color = INK, weight = 400) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Virgil, Segoe UI, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(value)}</text>`;
}

function rect(x, y, width, height, fill = NEUTRAL, stroke = MUTED, radius = 8) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2" />`;
}

function line(x1, y1, x2, y2, color = INK, width = 2, dash = '') {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''} />`;
}

function arrow(x1, y1, x2, y2, color = INK, width = 2) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" marker-end="url(#arrow)" />`;
}

function polyline(points, color, width = 4, dash = '') {
  return `<polyline points="${points.map(([x, y]) => `${x},${y}`).join(' ')}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''} />`;
}

function write(name, title, body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1010 700" width="1010" height="700">
<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="${INK}" /></marker></defs>
<rect width="1010" height="700" fill="${BG}" />
${text(505, 54, title, 28, 'middle', INK, 600)}
${body}
</svg>\n`;
  fs.writeFileSync(path.join(OUT, name), svg);
}

write('opd-01-performance-compute.svg', 'Post-Training: Performance vs. Compute', [
  line(105, 585, 910, 585), line(105, 585, 105, 105),
  text(510, 635, 'compute', 16), text(20, 345, 'performance', 16, 'start'),
  line(105, 175, 910, 175, MUTED, 2, '9 8'), text(900, 160, 'teacher ceiling', 14, 'end', MUTED),
  polyline([[120,550],[240,410],[390,310],[560,285],[870,280]], SAGE_STROKE),
  polyline([[120,560],[270,455],[430,340],[610,270],[870,250]], '#A18D72'),
  polyline([[120,570],[300,500],[470,350],[650,220],[870,175]], '#718B8A'),
  polyline([[120,575],[320,535],[500,430],[680,250],[870,120]], ACCENT),
  text(835, 300, 'SFT', 15, 'start', SAGE_STROKE), text(835, 265, 'SFT-RS', 15, 'start', '#A18D72'),
  text(835, 195, 'OPD', 15, 'start', '#718B8A'), text(835, 112, 'RL', 15, 'start', ACCENT),
  rect(300, 610, 410, 55, ACCENT_FILL, ACCENT), text(505, 643, 'OPD reaches the teacher; RL can compound past it', 15),
].join('\n'));

const noisyVectors = [[-155,-45],[-130,85],[-90,-125],[-45,145],[35,-150],[80,125],[145,-95],[165,55],[-175,20],[120,155],[-20,-90],[75,-55]];
write('opd-02-rl-gradient-cancellation.svg', 'RL: Noise Cancels, Signal Survives', [
  text(310, 110, 'per-token gradients', 18),
  ...noisyVectors.map(([dx, dy]) => arrow(310, 325, 310 + dx, 325 + dy, MUTED, 1.5)),
  `<circle cx="310" cy="325" r="7" fill="${INK}" />`,
  arrow(310, 325, 735, 245, ACCENT, 7), text(755, 242, 'reward-correlated resultant', 16, 'start', ACCENT, 600),
  rect(575, 350, 330, 145, ACCENT_FILL, ACCENT), text(740, 395, 'Large-batch averaging', 18, 'middle', INK, 600),
  text(740, 430, 'random directions cancel', 15), text(740, 458, 'consistent direction remains', 15),
  rect(250, 585, 510, 60, NEUTRAL, MUTED), text(505, 622, 'Sparse supervision stays honest through destructive interference', 15),
].join('\n'));

write('opd-03-sft-gradient-bias.svg', 'SFT: Constructive Interference Preserves Bias', [
  text(505, 108, 'dense token gradients all lean toward the data distribution', 17),
  ...Array.from({ length: 10 }, (_, i) => arrow(120, 155 + i * 38, 520 + (i % 3) * 25, 170 + i * 35, SAGE_STROKE, 2)),
  arrow(535, 335, 885, 335, ACCENT, 8), text(710, 305, 'large resultant', 18, 'middle', ACCENT, 600),
  rect(610, 395, 290, 120, ACCENT_FILL, ACCENT), text(755, 435, 'Fast movement', 18, 'middle', INK, 600),
  text(755, 468, 'but toward a fixed teacher', 15), text(755, 494, 'distribution and ceiling', 15),
  rect(220, 575, 570, 62, NEUTRAL, MUTED), text(505, 613, 'Dense signal is efficient; constructive interference also preserves bias', 15),
].join('\n'));

const bars = [8,10,7,12,9,11,8,210,9,12,7,10];
write('opd-04-pivot-token.svg', 'OPSD: One Pivot Token Can Dominate the Loss', [
  line(100, 520, 910, 520), text(68, 330, 'KL', 16),
  ...bars.map((h, i) => {
    const x = 120 + i * 62;
    const pivot = i === 7;
    return `${rect(x, 520 - h, 34, h, pivot ? ACCENT_FILL : NEUTRAL, pivot ? ACCENT : MUTED, 3)}\n${text(x + 17, 550, `t${i + 1}`, 12)}${pivot ? `\n${text(x + 17, 288, '4.1', 17, 'middle', ACCENT, 600)}` : ''}`;
  }),
  arrow(571, 270, 571, 300, ACCENT, 3), text(571, 235, 'pivot token ≈ 100× typical KL', 18, 'middle', ACCENT, 600),
  rect(250, 585, 510, 60, ACCENT_FILL, ACCENT), text(505, 622, 'Dense + biased + concentrated → clipping becomes necessary', 15),
].join('\n'));

write('opd-05-three-dials.svg', 'Every Post-Training Method Is Three Dial Settings', [
  ...[
    ['α · sampling mix', 175, 0.72, CLAY],
    ['λ · advantage blend', 265, 0.48, SAGE],
    ['πT · teacher choice', 355, 0.86, ROSE],
  ].flatMap(([label, y, pos, color]) => [text(115, y + 8, label, 16, 'start'), line(335, y, 850, y, MUTED, 8), rect(335, y - 12, 515 * pos, 24, color, MUTED, 12), `<circle cx="${335 + 515 * pos}" cy="${y}" r="15" fill="${ACCENT_FILL}" stroke="${ACCENT}" stroke-width="3" />`]),
  rect(115, 445, 780, 145, NEUTRAL, MUTED),
  text(155, 480, 'Method', 14, 'start', INK, 600), text(380, 480, 'α', 14), text(520, 480, 'λ', 14), text(735, 480, 'teacher πT', 14),
  ...[['SFT','0','0','data'],['RL / GRPO','1','0','—'],['OPD / OPSD','1','1','same-family / self']].flatMap((row, i) => {
    const y = 515 + i * 30; return [text(155,y,row[0],14,'start'),text(380,y,row[1],14),text(520,y,row[2],14),text(735,y,row[3],14)];
  }),
  rect(260, 620, 490, 52, ACCENT_FILL, ACCENT), text(505, 652, 'Change the dials; the family of algorithms changes', 15),
].join('\n'));

write('opd-06-pareto-frontier.svg', 'Compute–Reward Pareto Frontier', [
  line(105, 585, 910, 585), line(105, 585, 105, 105), text(510, 635, 'KL budget β', 16), text(20, 345, 'reward gain ΔR', 16, 'start'),
  `<path d="M120 565 C210 320 390 205 890 130" fill="none" stroke="${ACCENT}" stroke-width="5" stroke-linecap="round" />`,
  arrow(135, 545, 230, 335, ACCENT, 4), text(180, 520, 'RL', 17, 'start', ACCENT, 600),
  `<circle cx="455" cy="240" r="12" fill="${SAGE}" stroke="${SAGE_STROKE}" stroke-width="3" />`, text(455, 215, 'OPD', 16),
  `<circle cx="760" cy="155" r="12" fill="${CLAY}" stroke="#9A8870" stroke-width="3" />`, text(760, 130, 'SFT', 16),
  rect(500, 390, 310, 115, NEUTRAL, MUTED), text(655, 430, 'OPSD / SDFT', 17, 'middle', INK, 600),
  text(655, 462, 'concentrated KL can fall', 14), text(655, 487, 'below the efficient frontier', 14),
  rect(250, 610, 510, 55, ACCENT_FILL, ACCENT), text(505, 643, 'The open space is an interpolation problem', 15),
].join('\n'));

for (const name of ['figure-01-cost-curve.svg', 'figure-02-hybrid-attention.svg']) {
  fs.copyFileSync(path.join(ROOT, 'examples/deepseek-v4/figures', name), path.join(OUT, name));
}

console.log('Refreshed 8 self-contained pretext example figures.');
