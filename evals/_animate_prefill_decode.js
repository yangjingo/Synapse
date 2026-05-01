/**
 * Playwright: animate prefill-decode diagram via excalidraw-animate
 *
 * Extracts animated SVG from DOM (Export button doesn't work headless).
 * Then applies speed control via svg-speed.js
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SHAREABLE_LINK = 'https://excalidraw.com/#json=EY4vl_9FViwOwiqyOyg7P,pFk_ZlD1vranAncZ-d3i4A';
const RAW_OUTPUT = 'evals/prefill-decode-animated.svg';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('1. Loading excalidraw-animate...');
  await page.goto('https://dai-shi.github.io/excalidraw-animate/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('2. Pasting shareable link...');
  const linkInput = await page.$('input[placeholder="Enter link..."]');
  if (!linkInput) throw new Error('Link input not found');
  await linkInput.fill(SHAREABLE_LINK);

  console.log('3. Clicking Animate!...');
  const animateBtn = await page.$('button:has-text("Animate!")');
  if (!animateBtn) throw new Error('Animate button not found');
  await animateBtn.click();

  console.log('4. Waiting for animation to render...');
  await page.waitForTimeout(6000);

  // Extract animated SVG from DOM
  console.log('5. Extracting animated SVG from DOM...');
  const result = await page.evaluate(() => {
    const svgs = document.querySelectorAll('svg');
    for (const svg of svgs) {
      const animates = svg.querySelectorAll('animate');
      if (animates.length > 0) {
        return { html: svg.outerHTML, animateCount: animates.length };
      }
    }
    // Fallback: largest SVG
    let largest = null;
    for (const svg of svgs) {
      if (!largest || svg.outerHTML.length > largest.outerHTML.length) largest = svg;
    }
    return largest ? { html: largest.outerHTML, animateCount: 0 } : null;
  });

  if (!result || !result.html) {
    await browser.close();
    throw new Error('No SVG found in DOM');
  }

  fs.writeFileSync(RAW_OUTPUT, result.html);
  console.log(`   Extracted: ${result.animateCount} animate elements, ${(result.html.length / 1024).toFixed(0)} KB`);
  console.log(`   Saved → ${RAW_OUTPUT}`);

  await browser.close();
  console.log('\nDone. Next: node skills/synapse-animation/scripts/svg-speed.js to adjust speed.');
})();
