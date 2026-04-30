/**
 * Excalidraw Auto-Layout Engine v2
 *
 * Key features:
 * - Parent-child containers (children rendered on top of parent)
 * - Container labels auto-positioned at top to avoid child occlusion
 * - Shape-bound arrows via arrowBetween()
 * - Single-block annotation text (no per-line elements)
 * - Collision detection with parent-child awareness
 *
 * Usage:
 *   const L = require('./layout');
 *   const box1 = L.place(100, 100, 200, 50, 'rectangle', token, 'Label');
 *   const child = L.placeInside(box1, 20, 30, 60, 40, 'rectangle', token, 'Sub');
 *   const box2 = L.below(box1, 20, 200, 50, 'rectangle', token, 'Label2');
 *   L.arrowBetween(box1, box2);
 *   L.annotate(box1, '① Title', 'explanation text\nsecond line');
 *   L.validate();
 *   L.write('output.excalidraw');
 */

const fs = require('fs');

let idCounter = 0;
const eid = () => 'ly_' + (idCounter++).toString(36);
const seed = () => Math.floor(Math.random() * 2147483647);

const elements = [];
const regions = [];
const annotations = [];
const parentMap = {};  // childId -> parentId

let tokens = {
  ink: '#1e1e2e', inkMuted: '#6b7280',
  step:    { fill: '#fffbeb', stroke: '#d97706' },
  insight: { fill: '#f0fdf4', stroke: '#16a34a' },
};

const DEFAULTS = {
  fontFamily: 1,
  roughness: 1,
  strokeWidth: 2,
  fillStyle: 'solid',
  opacity: 100,
};

// ── Morandi Palette Sets ──
const MORANDI_SETS = {
  classic: {
    attention:  { fill: '#B8C4C0', stroke: '#7A9188' },
    masked:     { fill: '#C8BFB0', stroke: '#9A8E7E' },
    cross:      { fill: '#C4B0B0', stroke: '#9A7E7E' },
    feedforward:{ fill: '#B4B8C8', stroke: '#848A9E' },
    addnorm:    { fill: '#B4C4B6', stroke: '#7E9A84' },
    embedding:  { fill: '#B8B4C4', stroke: '#887E9A' },
    positional: { fill: '#A8BCC0', stroke: '#749CA4' },
    output:     { fill: '#C4B0B4', stroke: '#9A7E84' },
    _ink: '#4A4540', _inkMuted: '#908A84',
  },
  warm: {
    attention:  { fill: '#C4B8A8', stroke: '#9A8870' },
    masked:     { fill: '#C8B4A4', stroke: '#A08068' },
    cross:      { fill: '#C4A8A4', stroke: '#9A7E78' },
    feedforward:{ fill: '#BCC4AC', stroke: '#8A9A70' },
    addnorm:    { fill: '#C0BCA8', stroke: '#948E74' },
    embedding:  { fill: '#C0B4B0', stroke: '#968078' },
    positional: { fill: '#B8B8AC', stroke: '#88887A' },
    output:     { fill: '#C8B8B0', stroke: '#A08880' },
    _ink: '#4A4338', _inkMuted: '#908878',
  },
  cool: {
    attention:  { fill: '#A8B8C8', stroke: '#748A9E' },
    masked:     { fill: '#B8B8C4', stroke: '#8888A0' },
    cross:      { fill: '#B8A8C0', stroke: '#8878A0' },
    feedforward:{ fill: '#A8C0C4', stroke: '#7098A0' },
    addnorm:    { fill: '#ACBCB8', stroke: '#789490' },
    embedding:  { fill: '#B4A8C4', stroke: '#8078A0' },
    positional: { fill: '#A0B8C4', stroke: '#6888A0' },
    output:     { fill: '#C0A8B8', stroke: '#A07890' },
    _ink: '#384048', _inkMuted: '#788898',
  },
  forest: {
    attention:  { fill: '#A8C0A8', stroke: '#709870' },
    masked:     { fill: '#C4C0AC', stroke: '#9A9474' },
    cross:      { fill: '#C0A8A8', stroke: '#9A7878' },
    feedforward:{ fill: '#A8B4C0', stroke: '#708498' },
    addnorm:    { fill: '#98BC98', stroke: '#689468' },
    embedding:  { fill: '#B0A8C0', stroke: '#807098' },
    positional: { fill: '#98B8C0', stroke: '#68949C' },
    output:     { fill: '#C4B8A0', stroke: '#A08E6C' },
    _ink: '#3E4438', _inkMuted: '#8A9480',
  },
};

const MORANDI_KEYS = Object.keys(MORANDI_SETS);

function morandi(set) {
  const key = set || MORANDI_KEYS[Math.floor(Math.random() * MORANDI_KEYS.length)];
  return { ...MORANDI_SETS[key], _set: key };
}

function configure(opts) {
  if (opts.tokens) Object.assign(tokens, opts.tokens);
  if (opts.defaults) Object.assign(DEFAULTS, opts.defaults);
}

// ── Core: place an element ──
function place(x, y, w, h, type, token, text, fontSize = 15) {
  const rid = eid(), tid = eid();
  const ml = text.includes('\n');

  elements.push({
    ...baseProps(rid, type, x, y, w, h, token),
    roundness: { type: 3 },
    boundElements: [{ id: tid, type: 'text' }],
    isDeleted: false, link: null, locked: false,
  });

  // Text vertically centered in the box
  const textH = ml ? h - 8 : 24;
  elements.push({
    type: 'text', id: tid,
    x: x + 8, y: y + (ml ? 4 : (h - textH) / 2),
    width: w - 16, height: textH,
    text, fontSize, fontFamily: DEFAULTS.fontFamily,
    textAlign: 'center', verticalAlign: 'middle',
    strokeColor: tokens.ink, backgroundColor: 'transparent',
    fillStyle: 'solid', strokeWidth: 1,
    roughness: DEFAULTS.roughness, opacity: 100, angle: 0,
    seed: seed(), groupIds: [], boundElements: [],
    containerId: rid, originalText: text,
  });

  const box = { id: rid, x, y, w, h, cx: x + w / 2, cy: y + h / 2, right: x + w, bot: y + h, type, textId: tid };
  regions.push(box);
  return box;
}

// ── Place inside a parent container ──
// Label goes to the TOP of the parent so children don't cover it
function placeInside(parent, offsetX, offsetY, w, h, type, token, text, fontSize = 15) {
  const child = place(parent.x + offsetX, parent.y + offsetY, w, h, type, token, text, fontSize);
  parentMap[child.id] = parent.id;
  // Children are contained by parent — remove from regions so validate only checks the parent
  regions.pop();
  _moveLabelToTop(parent);
  return child;
}

function _moveLabelToTop(box) {
  const textEl = elements.find(e => e.id === box.textId);
  if (!textEl) return;
  // Move text to top-left header area of the parent
  textEl.y = box.y + 3;
  textEl.verticalAlign = 'top';
  textEl.textAlign = 'left';
  textEl.x = box.x + 10;
  // Increase font opacity to ensure it stands out
  textEl.fontSize = Math.min(textEl.fontSize, 13);
}

// ── Relative placement ──
function below(ref, gap, w, h, type, token, text, fontSize = 15) {
  return place(ref.x, ref.bot + gap, w, h, type, token, text, fontSize);
}
function above(ref, gap, w, h, type, token, text, fontSize = 15) {
  return place(ref.x, ref.y - h - gap, w, h, type, token, text, fontSize);
}
function rightOf(ref, gap, w, h, type, token, text, fontSize = 15) {
  return place(ref.right + gap, ref.y, w, h, type, token, text, fontSize);
}
function leftOf(ref, gap, w, h, type, token, text, fontSize = 15) {
  return place(ref.x - w - gap, ref.y, w, h, type, token, text, fontSize);
}
function belowCentered(ref, gap, w, h, type, token, text, fontSize = 15) {
  return place(ref.cx - w / 2, ref.bot + gap, w, h, type, token, text, fontSize);
}
function aboveCentered(ref, gap, w, h, type, token, text, fontSize = 15) {
  return place(ref.cx - w / 2, ref.y - h - gap, w, h, type, token, text, fontSize);
}

// ── Arrow between two shapes (shape-bound, primary connection method) ──
function arrowBetween(fromBox, toBox, color = tokens.ink, sw = 2) {
  const aid = eid();
  const pts = _calcEdgePoints(fromBox, toBox);

  const el = {
    type: 'arrow', id: aid, x: pts.x1, y: pts.y1,
    width: Math.abs(pts.x2 - pts.x1), height: Math.abs(pts.y2 - pts.y1),
    points: [[0, 0], [pts.x2 - pts.x1, pts.y2 - pts.y1]],
    strokeColor: color, backgroundColor: 'transparent',
    fillStyle: 'solid', strokeWidth: sw,
    roughness: DEFAULTS.roughness, opacity: 100, angle: 0,
    seed: seed(), groupIds: [], boundElements: [],
    startArrowhead: null, endArrowhead: 'arrow',
    startBinding: { elementId: fromBox.id, focus: 0, gap: 4 },
    endBinding: { elementId: toBox.id, focus: 0, gap: 4 },
  };
  elements.push(el);
  _registerBound(fromBox.id, aid, 'arrow');
  _registerBound(toBox.id, aid, 'arrow');
  return aid;
}

// ── Position-only arrow (no shape binding, for brackets/decorative paths) ──
// Uses type 'arrow' with no arrowheads — never uses type 'line'
function arrow(x1, y1, x2, y2, color = tokens.ink, sw = 2, arrowhead = null) {
  elements.push({
    type: 'arrow', id: eid(), x: x1, y: y1,
    width: Math.abs(x2 - x1), height: Math.abs(y2 - y1),
    points: [[0, 0], [x2 - x1, y2 - y1]],
    strokeColor: color, backgroundColor: 'transparent',
    fillStyle: 'solid', strokeWidth: sw,
    roughness: DEFAULTS.roughness, opacity: 100, angle: 0,
    seed: seed(), groupIds: [], boundElements: [],
    startArrowhead: null, endArrowhead: arrowhead,
    startBinding: null, endBinding: null,
  });
}

function text(x, y, text, fontSize = 16, color = tokens.ink) {
  elements.push({
    type: 'text', id: eid(),
    x: x - text.length * fontSize * 0.3, y: y - 10,
    width: text.length * fontSize * 0.6, height: fontSize + 4,
    text, fontSize, fontFamily: DEFAULTS.fontFamily,
    textAlign: 'center', verticalAlign: 'middle',
    strokeColor: color, backgroundColor: 'transparent',
    fillStyle: 'solid', strokeWidth: 1,
    roughness: DEFAULTS.roughness, opacity: 100, angle: 0,
    seed: seed(), groupIds: [], boundElements: [],
  });
}

// ── Frame: visual section boundary (Excalidraw frame element) ──
function frame(x, y, w, h, name, color = tokens.inkMuted) {
  const fid = eid();
  elements.push({
    type: 'frame', id: fid,
    x, y, width: w, height: h,
    name, strokeColor: color,
    seed: seed(), groupIds: [], boundElements: [],
  });
  const f = { id: fid, x, y, w, h, cx: x + w / 2, cy: y + h / 2, right: x + w, bot: y + h, type: 'frame', textId: null };
  regions.push(f);
  return f;
}

// ── Annotation: single rectangle + single bound text ──
function annotate(ref, title, body, token = tokens.step, gap = 20) {
  const fullText = title + '\n' + body;
  const allLines = fullText.split('\n');
  const boxW = 240;
  const boxH = 20 + allLines.length * 16 + 12;

  const ax = ref.right + gap;
  const ay = Math.max(10, ref.cy - boxH / 2);

  const rid = eid(), tid = eid();

  elements.push({
    type: 'rectangle', id: rid, x: ax, y: ay, width: boxW, height: boxH,
    strokeColor: token.stroke, backgroundColor: token.fill, fillStyle: 'solid',
    strokeWidth: 2, roughness: 1, roundness: { type: 3 },
    opacity: 100, angle: 0, seed: seed(), groupIds: [],
    boundElements: [{ id: tid, type: 'text' }],
    isDeleted: false, link: null, locked: false,
  });

  elements.push({
    type: 'text', id: tid, x: ax + 8, y: ay + 6,
    width: boxW - 16, height: boxH - 12, text: fullText,
    fontSize: 13, fontFamily: DEFAULTS.fontFamily,
    textAlign: 'left', verticalAlign: 'top',
    strokeColor: tokens.ink, backgroundColor: 'transparent',
    fillStyle: 'solid', strokeWidth: 1,
    roughness: 1, opacity: 100, angle: 0, seed: seed(),
    groupIds: [], boundElements: [],
    containerId: rid, originalText: fullText, lineHeight: 1.3,
  });

  const box = { id: rid, x: ax, y: ay, w: boxW, h: boxH, cx: ax + boxW / 2, cy: ay + boxH / 2, right: ax + boxW, bot: ay + boxH, type: 'annotation', textId: tid };
  regions.push(box);
  annotations.push(box);
  return box;
}

// ── Bracket ──
function bracket(left, right, top, bot, color = tokens.inkMuted) {
  line(left, top, left, bot, color, 1.5);
  line(right, top, right, bot, color, 1.5);
  line(left, top, left + 8, top, color, 1.5);
  line(left, bot, left + 8, bot, color, 1.5);
  line(right, top, right - 8, top, color, 1.5);
  line(right, bot, right - 8, bot, color, 1.5);
}

// ── Collision detection (parent-child aware) ──
function _overlaps(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

function _isParentChild(aId, bId) {
  return parentMap[aId] === bId || parentMap[bId] === aId;
}

function validate(minGap = 4) {
  const issues = [];
  for (let i = 0; i < regions.length; i++) {
    for (let j = i + 1; j < regions.length; j++) {
      const a = regions[i], b = regions[j];
      if (_isParentChild(a.id, b.id)) continue;
      // Frames contain their children — frame↔child overlap is expected
      if (a.type === 'frame' || b.type === 'frame') continue;
      const expanded = { x: a.x - minGap, y: a.y - minGap, w: a.w + minGap * 2, h: a.h + minGap * 2 };
      if (_overlaps(expanded, b)) {
        issues.push(`OVERLAP: "${a.id}" ↔ "${b.id}"`);
      }
    }
  }
  // Check text visibility: parent labels vs child regions
  for (const childId in parentMap) {
    const parentId = parentMap[childId];
    const parentRegion = regions.find(r => r.id === parentId);
    const childRegion = regions.find(r => r.id === childId);
    if (!parentRegion || !childRegion) continue;
    const parentText = elements.find(e => e.id === parentRegion.textId);
    if (!parentText) continue;
    const textBox = { x: parentText.x, y: parentText.y, w: parentText.width, h: parentText.height };
    if (_overlaps(textBox, childRegion)) {
      issues.push(`TEXT_OCCLUDED: parent "${parentId}" label covered by child "${childId}"`);
    }
  }

  if (issues.length > 0) {
    console.warn(`⚠ Layout validation: ${issues.length} issue(s)`);
    issues.forEach(i => console.warn('  ' + i));
  } else {
    console.log(`✓ Layout OK: ${regions.length} regions, no overlaps, no text occlusion`);
  }
  return issues;
}

function autoFix(maxIterations = 10) {
  let fixed = 0;
  for (let iter = 0; iter < maxIterations; iter++) {
    let dirty = false;
    for (let i = 0; i < regions.length; i++) {
      for (let j = i + 1; j < regions.length; j++) {
        const a = regions[i], b = regions[j];
        if (_isParentChild(a.id, b.id)) continue;
        if (_overlaps(a, b)) {
          const overlapY = (a.y + a.h) - b.y;
          _shiftRegion(b, 0, overlapY + 8);
          dirty = true; fixed++;
        }
      }
    }
    if (!dirty) break;
  }
  if (fixed > 0) console.log(`Auto-fixed ${fixed} overlap(s)`);
  return fixed;
}

function _shiftRegion(region, dx, dy) {
  region.y += dy; region.cy += dy; region.bot += dy;
  region.x += dx; region.cx += dx; region.right += dx;
  const el = elements.find(e => e.id === region.id);
  if (el) { el.x += dx; el.y += dy; }
  if (el && el.boundElements) {
    el.boundElements.forEach(b => {
      const te = elements.find(e => e.id === b.id);
      if (te) { te.x += dx; te.y += dy; }
    });
  }
}

// ── Write ──
function write(filePath, opts = {}) {
  const file = {
    type: 'excalidraw', version: 2,
    source: opts.source || 'synapse-excalidraw-layout',
    elements,
    appState: { viewBackgroundColor: opts.bgColor || '#ffffff' },
    files: {},
  };
  fs.writeFileSync(filePath, JSON.stringify(file, null, 2));
  console.log(`Written: ${elements.length} elements → ${filePath}`);
}

// ── Helpers ──
function baseProps(id, type, x, y, w, h, token) {
  return {
    type, id, x, y, width: w, height: h,
    strokeColor: typeof token === 'object' ? token.stroke : token,
    backgroundColor: typeof token === 'object' ? token.fill : 'transparent',
    fillStyle: DEFAULTS.fillStyle, strokeWidth: DEFAULTS.strokeWidth,
    roughness: DEFAULTS.roughness, roundness: null,
    opacity: DEFAULTS.opacity, angle: 0, seed: seed(),
    groupIds: [], boundElements: null,
  };
}

function _calcEdgePoints(a, b) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy;
  let x1, y1, x2, y2;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) { x1 = a.right; y1 = a.cy; x2 = b.x; y2 = b.cy; }
    else { x1 = a.x; y1 = a.cy; x2 = b.right; y2 = b.cy; }
  } else {
    if (dy > 0) { x1 = a.cx; y1 = a.bot; x2 = b.cx; y2 = b.y; }
    else { x1 = a.cx; y1 = a.y; x2 = b.cx; y2 = b.bot; }
  }
  return { x1, y1, x2, y2 };
}

function _registerBound(shapeId, elementId, type) {
  const el = elements.find(e => e.id === shapeId);
  if (el) {
    if (!el.boundElements) el.boundElements = [];
    el.boundElements.push({ id: elementId, type });
  }
}

function reset() {
  idCounter = 0;
  elements.length = 0;
  regions.length = 0;
  annotations.length = 0;
  for (const k in parentMap) delete parentMap[k];
}

module.exports = {
  configure, reset, morandi,
  place, placeInside, below, above, rightOf, leftOf, belowCentered, aboveCentered,
  arrow, arrowBetween, text, annotate, bracket, frame,
  validate, autoFix, write,
  elements, regions, annotations,
};
