/**
 * Pipeline: .excalidraw → excalidraw-animate → animated SVG → speed control
 *
 * Usage:
 *   node animate-pipeline.js --input <file.excalidraw> [--output out.svg] [--speed 2] [--loop]
 *
 * Requirements:
 *   - Playwright (npm install playwright OR use global: NODE_PATH="$(npm root -g)")
 *   - excalidraw-cli (npx excalidraw-cli) for upload
 *
 * Steps:
 *   1. Upload .excalidraw to excalidraw.com → get shareable link
 *   2. Open excalidraw-animate, paste link, click Animate!
 *   3. Extract animated SVG from DOM
 *   4. Apply speed control (optional)
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ── Args ──
const args = process.argv.slice(2);
let inputFile = null;
let outputFile = null;
let speed = null;
let loop = false;
let keepBrowser = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--input' && args[i + 1]) inputFile = args[++i];
  else if (args[i] === '--output' && args[i + 1]) outputFile = args[++i];
  else if (args[i] === '--speed' && args[i + 1]) speed = parseFloat(args[++i]);
  else if (args[i] === '--loop') loop = true;
  else if (args[i] === '--keep-browser') keepBrowser = true;
  else if (args[i] === '--help') {
    console.log(`Usage: node animate-pipeline.js --input <file.excalidraw> [--output out.svg] [--speed 2] [--loop]`);
    console.log();
    console.log('Options:');
    console.log('  --input       .excalidraw file to animate');
    console.log('  --output      Output SVG path (default: same name, .svg extension)');
    console.log('  --speed N     Speed multiplier (e.g. 2 = 2x faster)');
    console.log('  --loop        Add infinite loop to animation');
    console.log('  --keep-browser  Keep browser open (for debugging)');
    process.exit(0);
  }
}

if (!inputFile) {
  console.error('Error: --input required');
  process.exit(1);
}
if (!fs.existsSync(inputFile)) {
  console.error('Input not found:', inputFile);
  process.exit(1);
}

if (!outputFile) {
  outputFile = inputFile.replace(/\.excalidraw$/, '-animated.svg');
}

// ── Step 1: Upload to excalidraw.com ──
console.log('Step 1: Uploading to excalidraw.com...');
let shareableLink;
try {
  const result = execSync(`npx excalidraw-cli export "${path.resolve(inputFile)}" --shareable`, {
    encoding: 'utf-8',
    timeout: 30000,
  });
  // Extract URL from output
  const urlMatch = result.match(/https:\/\/excalidraw\.com\/#json=[^\s,]+,[^\s]+/);
  if (!urlMatch) {
    throw new Error('Could not extract shareable link from excalidraw-cli output');
  }
  shareableLink = urlMatch[0];
  console.log('   Shareable link:', shareableLink);
} catch (err) {
  console.error('Upload failed:', err.message);
  console.error('Make sure excalidraw-cli is installed: npm install -g @excalidraw/excalidraw-cli');
  process.exit(1);
}

// ── Step 2: Animate via Playwright ──
(async () => {
  console.log('Step 2: Opening excalidraw-animate...');
  const browser = await chromium.launch({ headless: !keepBrowser });
  const page = await browser.newPage();

  await page.goto('https://dai-shi.github.io/excalidraw-animate/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('Step 3: Pasting link and animating...');
  const linkInput = await page.$('input[placeholder="Enter link..."]');
  if (!linkInput) {
    await browser.close();
    throw new Error('Link input not found');
  }
  await linkInput.fill(shareableLink);

  const animateBtn = await page.$('button:has-text("Animate!")');
  if (!animateBtn) {
    await browser.close();
    throw new Error('Animate button not found');
  }
  await animateBtn.click();

  // Wait for animation processing
  console.log('Step 4: Waiting for animation to render...');
  await page.waitForTimeout(5000);

  // ── Step 3: Extract animated SVG from DOM ──
  console.log('Step 5: Extracting animated SVG from DOM...');
  const svgHtml = await page.evaluate(() => {
    const svgs = document.querySelectorAll('svg');
    // Prefer SVG with SMIL animate elements
    for (const svg of svgs) {
      const animates = svg.querySelectorAll('animate');
      if (animates.length > 0) {
        return { html: svg.outerHTML, animateCount: animates.length };
      }
    }
    // Fallback: largest SVG
    let largest = null;
    for (const svg of svgs) {
      if (!largest || svg.outerHTML.length > largest.outerHTML.length) {
        largest = svg;
      }
    }
    return largest ? { html: largest.outerHTML, animateCount: 0 } : null;
  });

  if (!svgHtml || !svgHtml.html) {
    await browser.close();
    throw new Error('No SVG found in DOM');
  }

  console.log(`   Found SVG with ${svgHtml.animateCount} animate elements (${(svgHtml.html.length / 1024).toFixed(0)} KB)`);

  let finalSvg = svgHtml.html;

  // ── Step 4: Speed control (optional) ──
  if (speed && speed !== 1) {
    console.log(`Step 6: Applying speed ${speed}x...`);
    let count = 0;
    finalSvg = finalSvg.replace(/<animate\s([^>]*)>/g, (match, attrs) => {
      count++;
      attrs = attrs.replace(/dur="([^"]*)"/, (_, v) => `dur="${scaleMs(v, 1 / speed)}"`);
      attrs = attrs.replace(/begin="([^"]*)"/, (_, v) => `begin="${scaleMs(v, 1 / speed)}"`);
      return `<animate ${attrs}>`;
    });
    console.log(`   Scaled ${count} animate elements`);
  }

  if (loop) {
    finalSvg = finalSvg.replace(/<animate\s([^>]*)>/g, (match, attrs) => {
      if (attrs.includes('repeatCount')) return match;
      return `<animate ${attrs} repeatCount="indefinite">`;
    });
    console.log('   Added infinite loop');
  }

  fs.writeFileSync(outputFile, finalSvg);
  console.log(`\nDone: ${outputFile} (${(finalSvg.length / 1024).toFixed(0)} KB)`);

  await browser.close();
})();

// ── Helpers ──
function scaleMs(s, factor) {
  let ms;
  if (s.endsWith('ms')) ms = parseFloat(s);
  else if (s.endsWith('s')) ms = parseFloat(s) * 1000;
  else ms = parseFloat(s);
  ms *= factor;
  if (ms < 1) return `${ms.toFixed(4)}ms`;
  if (ms < 100) return `${ms.toFixed(2)}ms`;
  return `${ms.toFixed(1)}ms`;
}
