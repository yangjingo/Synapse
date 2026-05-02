/**
 * Prefill-Decode — Vertical Flow Animation
 *
 * Animation narrative (top-to-bottom, creation order = draw order):
 *   Phase 1: Title + input tokens
 *   Phase 2: Prefill — 5 converging arrows → Model → KV Cache (all filled)
 *   Phase 3: Divider
 *   Phase 4: Decode — 1 new token → single arrow → Model → KV Cache (grows)
 *   Phase 5: Output
 *   Phase 6: Insight
 */
const L = require('../skills/synapse-excalidraw/scripts/layout');

const T = L.morandi('classic');
L.configure({ tokens: { ink: T._ink, inkMuted: T._inkMuted } });

let _n = 1000;
const uid = () => 'pd_' + (_n++).toString(36);
const rs = () => Math.floor(Math.random() * 2147483647);

const MODEL_FILL = '#D4CFC4';
const MODEL_STROKE = '#8A8578';
const EMPTY = { fill: '#E8E2D8', stroke: '#CCC6BA' };

function box(x, y, w, h, fill, stroke, opacity = 100) {
  L.elements.push({
    type: 'rectangle', id: uid(), x, y, width: w, height: h,
    strokeColor: stroke, backgroundColor: fill,
    fillStyle: 'solid', strokeWidth: 1.5, roughness: 0,
    roundness: { type: 3 }, opacity, angle: 0, seed: rs(),
    groupIds: [], boundElements: null,
  });
}

// Layout
const CX = 350;
const TW = 58, TH = 28, TS = 72;
const CW = 38, CH = 24, CS = 44;
const MW = 220, MH = 46;

const INPUT_TOKENS = ['The', 'cat', 'sat', 'on', 'the'];

// ══════════════════════════════════════
//  PHASE 1: Title + Input Tokens
// ══════════════════════════════════════

L.text(CX, 35, 'LLM 推理流程: Prefill → Decode', 20);

L.text(CX, 75, '① Prefill — 并行处理', 16);

const TOK_Y = 115;
const tokStart = CX - (INPUT_TOKENS.length * TS - (TS - TW)) / 2;

INPUT_TOKENS.forEach((t, i) => {
  const x = tokStart + i * TS;
  box(x, TOK_Y, TW, TH, '#EDE9E0', MODEL_STROKE);
  L.text(x + TW / 2, TOK_Y + TH / 2, t, 11);
});

// ══════════════════════════════════════
//  PHASE 2: Prefill Processing
// ══════════════════════════════════════

const MODEL_Y = 210;

// 5 converging arrows
INPUT_TOKENS.forEach((_, i) => {
  const cx = tokStart + i * TS + TW / 2;
  L.arrow(cx, TOK_Y + TH, CX, MODEL_Y, T._inkMuted, 1.5, 'arrow');
});

// "并行" label on the left of arrows
L.text(tokStart - 45, TOK_Y + TH + 25, '并行 ×5', 10, T.attention.stroke);

// Model block
box(CX - MW / 2, MODEL_Y, MW, MH, MODEL_FILL, MODEL_STROKE);
L.text(CX, MODEL_Y + MH / 2, 'Self-Attention + FFN', 13);

// Arrow to KV Cache
L.arrow(CX, MODEL_Y + MH, CX, MODEL_Y + MH + 35, T._inkMuted, 1.5, 'arrow');

// KV Cache — all 5 filled
const CACHE_Y = MODEL_Y + MH + 45;
const cacheStart = CX - (INPUT_TOKENS.length * CS - (CS - CW)) / 2;

INPUT_TOKENS.forEach((_, i) => {
  const x = cacheStart + i * CS;
  box(x, CACHE_Y, CW, CH, T.attention.fill, T.attention.stroke);
  L.text(x + CW / 2, CACHE_Y + CH / 2, `KV${i + 1}`, 9);
});

L.text(CX, CACHE_Y + CH + 16, '一次填满 ✓', 12, T.attention.stroke);
L.text(CX, CACHE_Y + CH + 34, 't = 1', 12);

// ══════════════════════════════════════
//  PHASE 3: Divider
// ══════════════════════════════════════

const DIV_Y = CACHE_Y + CH + 58;
// Horizontal divider line
L.elements.push({
  type: 'arrow', id: uid(),
  x: CX - 160, y: DIV_Y, width: 320, height: 0,
  points: [[0, 0], [320, 0]],
  strokeColor: EMPTY.stroke, backgroundColor: 'transparent',
  fillStyle: 'solid', strokeWidth: 1, roughness: 0,
  roundness: { type: 2 }, opacity: 60, angle: 0, seed: rs(),
  groupIds: [], boundElements: null,
  startArrowhead: null, endArrowhead: null,
  startBinding: null, endBinding: null,
});
L.text(CX, DIV_Y - 12, '② Decode', 16);

// ══════════════════════════════════════
//  PHASE 4: Decode Processing
// ══════════════════════════════════════

const NEW_TOK_Y = DIV_Y + 35;

// New token (highlighted)
const newTokX = CX - TW / 2;
box(newTokX, NEW_TOK_Y, TW, TH, T.masked.fill, T.masked.stroke);
L.text(CX, NEW_TOK_Y + TH / 2, 'mat', 11);

// "cached" label on the left
L.text(CX - TW / 2 - 55, NEW_TOK_Y + TH / 2, 'cached...', 10, T._inkMuted);

// Single arrow from new token to model
const DEC_MODEL_Y = NEW_TOK_Y + TH + 55;
L.arrow(CX, NEW_TOK_Y + TH, CX, DEC_MODEL_Y, T.masked.stroke, 2, 'arrow');

// "仅新 token" label
L.text(CX + 50, NEW_TOK_Y + TH + 20, '仅新 token', 10, T.masked.stroke);

// Model block (decode)
box(CX - MW / 2, DEC_MODEL_Y, MW, MH, MODEL_FILL, MODEL_STROKE);
L.text(CX, DEC_MODEL_Y + MH / 2, 'Self-Attention + FFN', 13);

// Arrow to KV Cache
L.arrow(CX, DEC_MODEL_Y + MH, CX, DEC_MODEL_Y + MH + 35, T._inkMuted, 1.5, 'arrow');

// "↕ 读/写 KV Cache" label
L.text(CX + MW / 2 + 15, DEC_MODEL_Y + MH / 2, '↕ 读写', 10, T._inkMuted);

// KV Cache — 5 gray + 1 new (highlighted)
const DEC_CACHE_Y = DEC_MODEL_Y + MH + 45;
const DEC_CACHE_N = 6;
const decCacheStart = CX - (DEC_CACHE_N * CS - (CS - CW)) / 2;

for (let i = 0; i < DEC_CACHE_N; i++) {
  const x = decCacheStart + i * CS;
  const isNew = i === DEC_CACHE_N - 1;
  box(x, DEC_CACHE_Y, CW, CH,
    isNew ? T.masked.fill : EMPTY.fill,
    isNew ? T.masked.stroke : EMPTY.stroke,
    isNew ? 100 : 38);
  L.text(x + CW / 2, DEC_CACHE_Y + CH / 2, `KV${i + 1}`, 9,
    isNew ? T._ink : T._inkMuted);
}

L.text(CX, DEC_CACHE_Y + CH + 16, '逐步追加 →', 12, T.masked.stroke);
L.text(CX, DEC_CACHE_Y + CH + 34, 't = 2, 3, 4, ...', 12);

// ══════════════════════════════════════
//  PHASE 5: Output
// ══════════════════════════════════════

const OUT_Y = DEC_CACHE_Y + CH + 65;
L.text(CX, OUT_Y, 'Output: "The cat sat on the mat !"', 13);

// ══════════════════════════════════════
//  PHASE 6: Insight
// ══════════════════════════════════════

const insY = OUT_Y + 35;
const insW = 480;
const insX = CX - insW / 2;

const rid = uid(), tid = uid();
L.elements.push({
  type: 'rectangle', id: rid, x: insX, y: insY,
  width: insW, height: 50,
  strokeColor: T.attention.stroke, backgroundColor: '#F0EDE6',
  fillStyle: 'solid', strokeWidth: 1.5, roughness: 1,
  roundness: { type: 3 }, opacity: 100, angle: 0, seed: rs(),
  groupIds: [], boundElements: [{ id: tid, type: 'text' }],
  isDeleted: false, link: null, locked: false,
});
L.elements.push({
  type: 'text', id: tid,
  x: insX + 12, y: insY + 8,
  width: insW - 24, height: 34,
  text: '★ KV Cache 是桥梁：Prefill 填满 → Decode 每步读取 + 追加 → 避免重复计算',
  fontSize: 12, fontFamily: 1,
  textAlign: 'left', verticalAlign: 'top',
  strokeColor: T._ink, backgroundColor: 'transparent',
  fillStyle: 'solid', strokeWidth: 1,
  roughness: 1, opacity: 100, angle: 0, seed: rs(),
  groupIds: [], boundElements: [],
  containerId: rid, originalText: '', lineHeight: 1.35,
});

// ══════════════════════════════════════
//  VALIDATE & WRITE
// ══════════════════════════════════════

const issues = L.validate();
if (issues.length > 0) {
  console.warn(`${issues.length} layout issues, running autoFix...`);
  L.autoFix();
}

L.write('evals/prefill-decode.excalidraw', { bgColor: '#FAF8F4' });
console.log('Done → evals/prefill-decode.excalidraw');
