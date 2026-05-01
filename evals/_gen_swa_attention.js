/**
 * SWA vs Full Attention Comparison — synapse-gif eval (Excalidraw Mode)
 *
 * Generates .excalidraw for excalidraw-animate testing.
 * Animation order (by creation): titles → headers → full grid → SWA grid → labels → insight
 */
const L = require('../skills/synapse-excalidraw/scripts/layout');

const T = L.morandi('classic');
L.configure({ tokens: { ink: T._ink, inkMuted: T._inkMuted } });

let _n = 1000;
const uid = () => 'swa_' + (_n++).toString(36);
const rs = () => Math.floor(Math.random() * 2147483647);

const N = 8, SZ = 40, GAP = 3, S = SZ + GAP;
const MW = N * S - GAP;

function cell(x, y, fill, stroke, opacity = 100) {
  L.elements.push({
    type: 'rectangle', id: uid(), x, y,
    width: SZ, height: SZ,
    strokeColor: stroke, backgroundColor: fill,
    fillStyle: 'solid', strokeWidth: 1.5, roughness: 0,
    roundness: { type: 3 }, opacity, angle: 0, seed: rs(),
    groupIds: [], boundElements: null,
  });
}

function textBlock(x, y, w, h, content, fontSize, color) {
  const rid = uid(), tid = uid();
  L.elements.push({
    type: 'rectangle', id: rid, x, y, width: w, height: h,
    strokeColor: color, backgroundColor: '#F0EDE6',
    fillStyle: 'solid', strokeWidth: 1.5, roughness: 1,
    roundness: { type: 3 }, opacity: 100, angle: 0, seed: rs(),
    groupIds: [], boundElements: [{ id: tid, type: 'text' }],
    isDeleted: false, link: null, locked: false,
  });
  L.elements.push({
    type: 'text', id: tid,
    x: x + 10, y: y + 10,
    width: w - 20, height: h - 20,
    text: content, fontSize, fontFamily: 1,
    textAlign: 'left', verticalAlign: 'top',
    strokeColor: T._ink, backgroundColor: 'transparent',
    fillStyle: 'solid', strokeWidth: 1,
    roughness: 1, opacity: 100, angle: 0, seed: rs(),
    groupIds: [], boundElements: [],
    containerId: rid, originalText: content, lineHeight: 1.4,
  });
}

// ── Positions ──
const LX = 80, LY = 140;
const RX = 620, RY = 140;

// ══════════════════════════════════════
//  PHASE 1: Titles + Token Headers
// ══════════════════════════════════════

L.text(LX + MW / 2, 70, 'Full Attention', 24);
L.text(RX + MW / 2, 60, 'Sliding Window Attention', 20);
L.text(RX + MW / 2, 85, 'window size W = 3', 13, T._inkMuted);

for (let i = 0; i < N; i++) {
  const t = `t${i + 1}`;
  L.text(LX + i * S + SZ / 2, LY - 20, t, 11, T._inkMuted);
  L.text(RX + i * S + SZ / 2, RY - 20, t, 11, T._inkMuted);
  L.text(LX - 30, LY + i * S + SZ / 2, t, 11, T._inkMuted);
  L.text(RX - 30, RY + i * S + SZ / 2, t, 11, T._inkMuted);
}

// ══════════════════════════════════════
//  PHASE 2: Full Attention Grid (N×N)
// ══════════════════════════════════════

for (let r = 0; r < N; r++)
  for (let c = 0; c < N; c++)
    cell(LX + c * S, LY + r * S, T.attention.fill, T.attention.stroke);

L.text(LX + MW / 2, LY + MW + 28, 'O(N²)', 20);
L.text(LX + MW / 2, LY + MW + 50, '64 active cells', 12, T._inkMuted);

// ── "vs" connector ──
const midX = LX + MW + (RX - LX - MW) / 2;
L.text(midX, LY + MW / 2 - 12, 'vs', 18, T._inkMuted);

// ══════════════════════════════════════
//  PHASE 3: SWA Grid (banded)
// ══════════════════════════════════════

const band = (r, c) => Math.abs(c - r) <= 2;
const EMPTY_FILL = '#E8E2D8', EMPTY_STROKE = '#CCC6BA';

for (let r = 0; r < N; r++)
  for (let c = 0; c < N; c++) {
    const active = band(r, c);
    cell(
      RX + c * S, RY + r * S,
      active ? T.masked.fill : EMPTY_FILL,
      active ? T.masked.stroke : EMPTY_STROKE,
      active ? 100 : 35,
    );
  }

L.text(RX + MW / 2, RY + MW + 28, 'O(N × W)', 20);
L.text(RX + MW / 2, RY + MW + 50, '34 active cells', 12, T._inkMuted);

// ══════════════════════════════════════
//  PHASE 4: Insight Box
// ══════════════════════════════════════

const insY = LY + MW + 80;
const insW = RX + MW - LX;
textBlock(LX, insY, insW, 70,
  '★ Insight\nSWA 以固定局部窗口替代全局注意力，复杂度从 O(N²) 降至 O(N×W)\n长序列场景下显著降低显存和计算开销',
  14, T.attention.stroke);

// ══════════════════════════════════════
//  VALIDATE & WRITE
// ══════════════════════════════════════

const issues = L.validate();
if (issues.length > 0) {
  console.warn(`${issues.length} layout issues, running autoFix...`);
  L.autoFix();
}

L.write('evals/swa-attention.excalidraw', { bgColor: '#FAF8F4' });
console.log('Done. Next: upload to excalidraw.com, then animate at dai-shi.github.io/excalidraw-animate');
