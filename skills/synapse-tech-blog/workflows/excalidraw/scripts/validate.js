#!/usr/bin/env node
/**
 * Excalidraw Collision Validator v2
 *
 * Smart overlap detection for .excalidraw files.
 * Automatically excludes intentional overlaps: frame containment, bound text,
 * parent-child containers, and small labels.
 *
 * Usage:
 *   node scripts/validate.js <file.excalidraw>
 *   node scripts/validate.js --strict examples/bar-chart.excalidraw
 *
 * --strict  also flag arrows crossing solid elements
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const strict = args.includes('--strict');
const filePath = args.find(a => !a.startsWith('--'));

if (!filePath) {
  console.error('Usage: node scripts/validate.js [--strict] <file.excalidraw>');
  process.exit(1);
}

const absPath = path.resolve(filePath);
if (!fs.existsSync(absPath)) {
  console.error(`File not found: ${absPath}`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(absPath, 'utf-8'));
const elements = raw.elements || [];

console.log(`\n  Excalidraw Collision Validator v2`);
console.log(`  File: ${path.basename(absPath)}`);
console.log(`  Elements: ${elements.length}`);
if (strict) console.log(`  Mode: strict (arrow cross-checks)`);
console.log('');

// ── Bounding box ──
function bbox(el) {
  if (!el || el.isDeleted) return null;
  switch (el.type) {
    case 'rectangle':
    case 'diamond':
    case 'frame':
    case 'group':
    case 'ellipse':
      return { x: el.x, y: el.y, w: el.width, h: el.height };
    case 'text': {
      // CLI-generated text may lack width/height — estimate from content
      const w = el.width || (el.text ? el.text.length * (el.fontSize || 16) * 0.5 : 100);
      const lines = el.text ? el.text.split('\n').length : 1;
      const h = el.height || lines * (el.fontSize || 16) * 1.3 + 4;
      return { x: el.x, y: el.y, w, h };
    }
    case 'arrow':
    case 'line': {
      let minX = el.x, minY = el.y, maxX = el.x, maxY = el.y;
      if (el.points) {
        for (const [px, py] of el.points) {
          const ax = el.x + px, ay = el.y + py;
          if (ax < minX) minX = ax; if (ay < minY) minY = ay;
          if (ax > maxX) maxX = ax; if (ay > maxY) maxY = ay;
        }
      }
      return { x: minX, y: minY, w: (maxX - minX) || 1, h: (maxY - minY) || 1 };
    }
    default:
      return null;
  }
}

function overlaps(a, b, gap = 2) {
  return !(a.x + a.w + gap <= b.x ||
           b.x + b.w + gap <= a.x ||
           a.y + a.h + gap <= b.y ||
           b.y + b.h + gap <= a.y);
}

function center(box) {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

function containsPoint(outer, px, py) {
  return px >= outer.x && px <= outer.x + outer.w &&
         py >= outer.y && py <= outer.y + outer.h;
}

// ── Build relationship maps ──
const elMap = {};
for (const el of elements) elMap[el.id] = el;

// bound-text → container
const containerOf = {};
for (const el of elements) {
  if (el.type === 'text' && el.containerId) {
    containerOf[el.id] = el.containerId;
  }
}

// frame → children (by center containment)
const frameChildren = {};
const frames = elements.filter(e => e.type === 'frame' && !e.isDeleted);
for (const frame of frames) {
  const fb = bbox(frame);
  if (!fb) continue;
  frameChildren[frame.id] = [];
  for (const el of elements) {
    if (el.id === frame.id || el.isDeleted) continue;
    if (el.type === 'arrow' || el.type === 'line') continue;
    const eb = bbox(el);
    if (!eb) continue;
    const c = center(eb);
    if (containsPoint(fb, c.x, c.y)) {
      frameChildren[frame.id].push(el.id);
    }
  }
}

// parent → children (large rect containing smaller rect, not frame)
const parentChildMap = {};
const rects = elements.filter(e =>
  (e.type === 'rectangle' || e.type === 'ellipse') && !e.isDeleted
);
for (const parent of rects) {
  const pb = bbox(parent);
  if (!pb) continue;
  // Skip if parent has bound text as label (it's a container)
  const hasLabel = parent.boundElements && parent.boundElements.some(b => b.type === 'text');
  if (!hasLabel) continue; // only consider containers with labels as parents
  parentChildMap[parent.id] = [];
  for (const child of rects) {
    if (child.id === parent.id) continue;
    const cb = bbox(child);
    if (!cb) continue;
    // Child center inside parent = parent-child relationship
    const cc = center(cb);
    if (containsPoint(pb, cc.x, cc.y)) {
      parentChildMap[parent.id].push(child.id);
    }
  }
}

// group membership
const groups = {};
for (const el of elements) {
  if (el.groupIds) {
    for (const gid of el.groupIds) {
      if (!groups[gid]) groups[gid] = [];
      groups[gid].push(el.id);
    }
  }
}

// Visual containment: large element containing smaller ones (charts, containers)
// If A's center is inside B and B is much larger, A is visually contained by B
const containmentMap = {};
for (const outer of elements) {
  if (outer.isDeleted || outer.type === 'arrow' || outer.type === 'line') continue;
  const ob = bbox(outer);
  if (!ob) continue;
  const outerArea = ob.w * ob.h;
  if (outerArea < 2000) continue; // too small to be a container

  containmentMap[outer.id] = [];
  for (const inner of elements) {
    if (inner.id === outer.id || inner.isDeleted) continue;
    if (inner.type === 'arrow' || inner.type === 'line') continue;
    const ib = bbox(inner);
    if (!ib) continue;
    const ic = center(ib);
    if (containsPoint(ob, ic.x, ic.y)) {
      containmentMap[outer.id].push(inner.id);
    }
  }
}

// ── Exclusion checks ──
function isBoundPair(aId, bId) {
  return containerOf[aId] === bId || containerOf[bId] === aId;
}

function isVisualContainment(aId, bId) {
  for (const oid in containmentMap) {
    const ch = containmentMap[oid];
    const aIs = oid === aId || ch.includes(aId);
    const bIs = oid === bId || ch.includes(bId);
    if (aIs && bIs) return true;
  }
  return false;
}

function isFrameContainment(aId, bId) {
  for (const fid in frameChildren) {
    const ch = frameChildren[fid];
    const aInFrame = ch.includes(aId) || fid === aId;
    const bInFrame = ch.includes(bId) || fid === bId;
    if (aInFrame && bInFrame) return true;
  }
  return false;
}

function isParentChild(aId, bId) {
  for (const pid in parentChildMap) {
    const ch = parentChildMap[pid];
    if ((pid === aId && ch.includes(bId)) || (pid === bId && ch.includes(aId))) return true;
    // Two children of same parent
    if (ch.includes(aId) && ch.includes(bId)) return true;
  }
  return false;
}

function isSameGroup(aId, bId) {
  for (const gid in groups) {
    const m = groups[gid];
    if (m.includes(aId) && m.includes(bId)) return true;
  }
  return false;
}

function isArrowBinding(a, b) {
  for (const el of [a, b]) {
    if (el.type === 'arrow' || el.type === 'line') {
      const other = el === a ? b : a;
      if (el.startBinding && el.startBinding.elementId === other.id) return true;
      if (el.endBinding && el.endBinding.elementId === other.id) return true;
    }
  }
  return false;
}

// Text smaller than threshold near a shape is a label, not occlusion
function isSmallLabel(el) {
  return el.type === 'text' && el.fontSize && el.fontSize <= 13 && !el.containerId;
}

// ── Run checks ──
const issues = [];
const warnings = [];

for (let i = 0; i < elements.length; i++) {
  const a = elements[i];
  if (a.isDeleted || a.type === 'arrow' || a.type === 'line') continue;
  const aBox = bbox(a);
  if (!aBox) continue;

  for (let j = i + 1; j < elements.length; j++) {
    const b = elements[j];
    if (b.isDeleted || (b.type === 'arrow' && !strict) || (b.type === 'line' && !strict)) continue;
    const bBox = bbox(b);
    if (!bBox) continue;

    if (!overlaps(aBox, bBox, 2)) continue;

    // Exclusion rules
    if (isBoundPair(a.id, b.id)) continue;
    if (isVisualContainment(a.id, b.id)) continue;
    if (isFrameContainment(a.id, b.id)) continue;
    if (isParentChild(a.id, b.id)) continue;
    if (isSameGroup(a.id, b.id)) continue;
    if (isArrowBinding(a, b)) continue;
    // Small labels near elements — warn, don't error
    if (isSmallLabel(a) || isSmallLabel(b)) {
      warnings.push(fmt('LABEL_OVERLAP', a, b, aBox, bBox));
      continue;
    }
    // Arrow crossing (strict mode)
    if (a.type === 'arrow' || a.type === 'line' || b.type === 'arrow' || b.type === 'line') {
      warnings.push(fmt('ARROW_CROSS', a, b, aBox, bBox));
      continue;
    }

    issues.push(fmt('OVERLAP', a, b, aBox, bBox));
  }
}

function fmt(tag, a, b, aBox, bBox) {
  const label = (el) => {
    const t = (el.text || el.name || '').slice(0, 22);
    return `${el.type}${t ? ` "${t}"` : ''}`;
  };
  return `  ${tag}: ${label(a)} ↔ ${label(b)}  ` +
    `A=[${Math.round(aBox.x)},${Math.round(aBox.y)} ${Math.round(aBox.w)}×${Math.round(aBox.h)}]  ` +
    `B=[${Math.round(bBox.x)},${Math.round(bBox.y)} ${Math.round(bBox.w)}×${Math.round(bBox.h)}]`;
}

// ── Report ──
if (issues.length === 0 && warnings.length === 0) {
  console.log(`  PASS  No collisions detected`);
  console.log(`         ${elements.length} elements, ${frames.length} frames, ` +
    `${Object.keys(containerOf).length} bound texts`);
  console.log('');
  process.exit(0);
}

if (issues.length > 0) {
  console.log(`  FAIL  ${issues.length} collision(s):`);
  issues.forEach(m => console.log(m));
  console.log('');
}
if (warnings.length > 0) {
  console.log(`  WARN  ${warnings.length} minor overlap(s):`);
  warnings.forEach(m => console.log(m));
  console.log('');
}

console.log(`  Total: ${issues.length} error(s), ${warnings.length} warning(s)`);
console.log('');
process.exit(issues.length > 0 ? 1 : 0);
