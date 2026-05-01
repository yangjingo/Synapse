/**
 * SVG → GIF Converter
 *
 * Captures animated SVG frames via Playwright using svg.setCurrentTime()
 * for precise frame seeking, then compiles to GIF via FFmpeg.
 *
 * Usage:
 *   node svg-to-gif.js <input.svg> [output.gif] [--fps 15] [--width 640]
 *
 * Options:
 *   --fps N      Frames per second (default: 15)
 *   --width N    Output width in px, height auto-scaled (default: original)
 *   --speed N    Speed multiplier, same as svg-speed.js (default: 1)
 *   --loop N     Loop count: 0=infinite (default), 1=play once
 *
 * Dependencies:
 *   playwright, ffmpeg
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── Args ──
const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help')) {
  console.log('Usage: node svg-to-gif.js <input.svg> [output.gif] [--fps 15] [--width 640] [--speed 1] [--loop 0]');
  process.exit(0);
}

let inputFile = null, outputFile = null;
let fps = 15, width = 0, speed = 1, loop = 0;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--fps' && args[i + 1]) fps = parseInt(args[++i]);
  else if (args[i] === '--width' && args[i + 1]) width = parseInt(args[++i]);
  else if (args[i] === '--speed' && args[i + 1]) speed = parseFloat(args[++i]);
  else if (args[i] === '--loop' && args[i + 1]) loop = parseInt(args[++i]);
  else if (!args[i].startsWith('--')) {
    if (!inputFile) inputFile = args[i];
    else outputFile = args[i];
  }
}

if (!fs.existsSync(inputFile)) {
  console.error('Input not found:', inputFile);
  process.exit(1);
}
if (!outputFile) {
  outputFile = inputFile.replace(/\.svg$/, '.gif');
}

// ── Parse SVG to get animation duration ──
const svgContent = fs.readFileSync(inputFile, 'utf-8');

let totalMs = 0;
const animRe = /<animate\s[^>]*>/g;
let m;
while ((m = animRe.exec(svgContent)) !== null) {
  const beginMatch = m[0].match(/begin="([^"]*)"/);
  const durMatch = m[0].match(/dur="([^"]*)"/);
  if (beginMatch && durMatch) {
    const begin = parseMs(beginMatch[1]);
    const dur = parseMs(durMatch[1]);
    const end = begin + dur;
    if (end > totalMs) totalMs = end;
  }
}

const scaledTotalMs = totalMs / speed;
const frameCount = Math.ceil(scaledTotalMs / (1000 / fps));
const frameDir = path.join(path.dirname(outputFile), '_gif_frames_tmp');

console.log(`Animation: ${(totalMs / 1000).toFixed(1)}s → ${(scaledTotalMs / 1000).toFixed(1)}s (${speed}x)`);
console.log(`Frames: ${frameCount} @ ${fps}fps`);

// ── Capture frames via Playwright ──
(async () => {
  // Ensure clean frame dir
  if (fs.existsSync(frameDir)) fs.rmSync(frameDir, { recursive: true });
  fs.mkdirSync(frameDir, { recursive: true });

  console.log('Capturing frames...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Parse dimensions from SVG (prefer viewBox for reliable aspect ratio)
  const vbMatch = svgContent.match(/viewBox="0\s+0\s+([\d.]+)\s+([\d.]+)"/);
  const wAttr = svgContent.match(/\swidth="([\d.]+)"/);
  const hAttr = svgContent.match(/\sheight="([\d.]+)"/);
  const svgW = vbMatch ? parseFloat(vbMatch[1]) : (wAttr ? parseFloat(wAttr[1]) : 800);
  const svgH = vbMatch ? parseFloat(vbMatch[2]) : (hAttr ? parseFloat(hAttr[1]) : 600);

  const outW = width || Math.round(svgW);
  const outH = Math.round(svgH * (outW / svgW));
  await page.setViewportSize({ width: outW, height: outH });

  // Load SVG with explicit sizing to fill viewport exactly
  const svgHtml = `<!DOCTYPE html><html><head><style>
    *{margin:0;padding:0}
    body{width:${outW}px;height:${outH}px;overflow:hidden;background:#FAF8F4}
    svg{width:${outW}px;height:${outH}px}
  </style></head><body>${svgContent}</body></html>`;
  await page.setContent(svgHtml, { waitUntil: 'load' });

  // Apply speed to SMIL animations via setCurrentTime
  for (let i = 0; i < frameCount; i++) {
    const t = i * (1000 / fps); // time in ms at this frame
    await page.evaluate((tMs) => {
      const svg = document.querySelector('svg');
      if (svg && svg.setCurrentTime) {
        svg.setCurrentTime(tMs / 1000);
      }
    }, t);

    const frameFile = path.join(frameDir, `frame_${String(i).padStart(5, '0')}.png`);
    await page.screenshot({ path: frameFile, clip: { x: 0, y: 0, width: outW, height: outH } });
  }

  await browser.close();
  console.log(`Captured ${frameCount} frames (${outW}×${outH})`);

  // ── Compile GIF via FFmpeg ──
  console.log('Compiling GIF...');
  const loopFlag = loop === 0 ? '0' : String(loop);
  const cmd = `ffmpeg -y -framerate ${fps} -i "${frameDir}/frame_%05d.png" -loop ${loopFlag} -lavfi "palettegen=stats_mode=full[pal],[0:v][pal]paletteuse=dither=sierra2_4a" -gifflags +transdiff "${outputFile}"`;

  try {
    execSync(cmd, { stdio: 'pipe', timeout: 60000 });
  } catch (err) {
    // Fallback: simpler FFmpeg command
    const fallback = `ffmpeg -y -framerate ${fps} -i "${frameDir}/frame_%05d.png" -loop ${loopFlag} "${outputFile}"`;
    execSync(fallback, { stdio: 'pipe', timeout: 60000 });
  }

  // Cleanup
  fs.rmSync(frameDir, { recursive: true });

  const sizeKB = (fs.statSync(outputFile).size / 1024).toFixed(0);
  console.log(`\nDone: ${outputFile} (${sizeKB} KB, ${outW}×${outH}, ${frameCount} frames)`);
})();

function parseMs(s) {
  if (s.endsWith('ms')) return parseFloat(s);
  if (s.endsWith('s')) return parseFloat(s) * 1000;
  return parseFloat(s);
}
