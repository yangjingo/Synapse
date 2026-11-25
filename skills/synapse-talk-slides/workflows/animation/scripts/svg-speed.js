/**
 * SMIL animation speed control for animated SVGs.
 *
 * Usage:
 *   node svg-speed.js <input.svg> [output.svg] [--speed 2] [--delay 0] [--loop]
 *
 * Options:
 *   --speed N    Speed multiplier (default: 1). 2 = 2x faster, 0.5 = half speed.
 *   --delay N    Initial delay in ms (default: 0). Adds offset to all begin times.
 *   --loop       Add repeatCount="indefinite" to all animate elements.
 *
 * How it works:
 *   Scales every SMIL <animate begin="Xms" dur="Yms"> by the speed factor:
 *     begin = delay + (original_begin / speed)
 *     dur   = original_dur / speed
 */
const fs = require('fs');
const path = require('path');

// ── Parse args ──
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help')) {
  console.log('Usage: node svg-speed.js <input.svg> [output.svg] [--speed N] [--delay N] [--loop]');
  process.exit(0);
}

const inputFile = args[0];
let outputFile = null;
let speed = 1;
let delay = 0;
let loop = false;

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--speed' && args[i + 1]) { speed = parseFloat(args[++i]); }
  else if (args[i] === '--delay' && args[i + 1]) { delay = parseFloat(args[++i]); }
  else if (args[i] === '--loop') { loop = true; }
  else if (!args[i].startsWith('--')) { outputFile = args[i]; }
}

if (!fs.existsSync(inputFile)) {
  console.error('Input not found:', inputFile);
  process.exit(1);
}
if (speed <= 0) {
  console.error('Speed must be > 0');
  process.exit(1);
}
if (!outputFile) {
  const ext = path.extname(inputFile);
  const base = path.basename(inputFile, ext);
  outputFile = path.join(path.dirname(inputFile), `${base}-x${speed}${ext}`);
}

// ── Parse & transform ──
let svg = fs.readFileSync(inputFile, 'utf-8');
let count = 0;

// First pass: compute total animation span (needed for synchronized loop)
let totalSpan = 0;
if (loop) {
  const re = /<animate\s([^>]*)>/g;
  let m;
  while ((m = re.exec(svg)) !== null) {
    const beginMatch = m[1].match(/begin="([^"]*)"/);
    const durMatch = m[1].match(/dur="([^"]*)"/);
    if (beginMatch && durMatch) {
      const end = parseMs(beginMatch[1]) / speed + parseMs(durMatch[1]) / speed;
      if (end > totalSpan) totalSpan = end;
    }
  }
}

svg = svg.replace(/<animate\s([^>]*)>/g, (match, attrs) => {
  count++;

  attrs = attrs.replace(/dur="([^"]*)"/, (_, v) => {
    const ms = parseMs(v) / speed;
    return `dur="${formatMs(ms)}"`;
  });

  attrs = attrs.replace(/begin="([^"]*)"/, (_, v) => {
    const ms = parseMs(v) / speed + delay;
    return `begin="${formatMs(ms)}"`;
  });

  // Synchronized loop: keep fill="freeze", inject JS to restart SVG after totalSpan
  // (Cannot use fill="remove" — build-up animations would flash)
  // (Cannot use repeatCount — elements desync)

  return `<animate ${attrs}>`;
});

// Inject JS loop: after totalSpan, restart all SMIL animations by re-adding SVG to DOM
if (loop && totalSpan > 0) {
  const loopScript = `<script type="text/javascript"><![CDATA[setTimeout(function(){var s=document.querySelector('svg');var p=s.parentNode;var c=s.cloneNode(true);p.replaceChild(c,s);},${Math.round(totalSpan + 500)})]]></script>`;
  svg = svg.replace('</svg>', loopScript + '\n</svg>');
}

fs.writeFileSync(outputFile, svg);

const origSize = (fs.statSync(inputFile).size / 1024).toFixed(0);
const newSize = (fs.statSync(outputFile).size / 1024).toFixed(0);

console.log(`Speed: ${speed}x | Delay: ${delay}ms | Loop: ${loop}`);
console.log(`Modified ${count} <animate> elements`);
console.log(`Size: ${origSize}KB → ${newSize}KB`);
console.log(`Output: ${outputFile}`);

// ── Helpers ──
function parseMs(s) {
  if (s.endsWith('ms')) return parseFloat(s);
  if (s.endsWith('s')) return parseFloat(s) * 1000;
  return parseFloat(s);
}

function formatMs(ms) {
  if (ms < 1) return `${ms.toFixed(4)}ms`;
  if (ms < 100) return `${ms.toFixed(2)}ms`;
  return `${ms.toFixed(1)}ms`;
}
