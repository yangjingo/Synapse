/**
 * .excalidraw → SVG converter (pure Node.js, no dependencies)
 * Handles: rectangle, diamond, ellipse, arrow, text, frame
 */
const fs = require('fs');
const path = require('path');

function excalidrawToSvg(inputPath, outputPath, opts = {}) {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const elements = data.elements || [];
  const bg = (data.appState && data.appState.viewBackgroundColor) || '#ffffff';

  // Bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const el of elements) {
    if (el.isDeleted || el.type === 'text') continue;
    const x = el.x || 0, y = el.y || 0;
    const w = el.width || 0, h = el.height || 0;
    // For arrows, compute from points
    if (el.type === 'arrow' && el.points) {
      let px = x, py = y;
      for (const pt of el.points) {
        minX = Math.min(minX, Math.min(px, px + pt[0]));
        minY = Math.min(minY, Math.min(py, py + pt[1]));
        maxX = Math.max(maxX, Math.max(px, px + pt[0]));
        maxY = Math.max(maxY, Math.max(py, py + pt[1]));
        px += pt[0]; py += pt[1];
      }
    } else {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    }
  }

  // Also account for text elements
  for (const el of elements) {
    if (el.isDeleted || el.type !== 'text') continue;
    const x = el.x || 0, y = el.y || 0;
    const w = el.width || 100, h = el.height || 20;
    minX = Math.min(minX, x - 5);
    minY = Math.min(minY, y - 5);
    maxX = Math.max(maxX, x + w + 5);
    maxY = Math.max(maxY, y + h + 5);
  }

  const pad = 20;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const vw = maxX - minX, vh = maxY - minY;

  const parts = [];
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${vw} ${vh}" width="${vw}" height="${vh}">`);
  parts.push(`<rect x="${minX}" y="${minY}" width="${vw}" height="${vh}" fill="${bg}" />`);

  // Sort: frames first, then shapes, then arrows, then text (text on top)
  const order = { frame: 0, rectangle: 1, diamond: 1, ellipse: 1, arrow: 2, text: 3 };
  const sorted = [...elements].filter(e => !e.isDeleted).sort((a, b) => (order[a.type] || 0) - (order[b.type] || 0));

  for (const el of sorted) {
    const opacity = (el.opacity !== undefined && el.opacity < 100) ? ` opacity="${el.opacity / 100}"` : '';
    const fill = el.backgroundColor && el.backgroundColor !== 'transparent' ? el.backgroundColor : 'none';
    const stroke = el.strokeColor || '#1e1e2e';
    const sw = el.strokeWidth || 2;
    const rx = el.roughness || 1;

    if (el.type === 'rectangle') {
      const r = (el.roundness && el.roundness.type === 3) ? 4 : 0;
      parts.push(`<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" rx="${r}"${opacity} />`);

    } else if (el.type === 'diamond') {
      const cx = el.x + el.width / 2, cy = el.y + el.height / 2;
      const hw = el.width / 2, hh = el.height / 2;
      parts.push(`<polygon points="${cx},${el.y} ${el.x + el.width},${cy} ${cx},${el.y + el.height} ${el.x},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${opacity} />`);

    } else if (el.type === 'ellipse') {
      parts.push(`<ellipse cx="${el.x + el.width / 2}" cy="${el.y + el.height / 2}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${opacity} />`);

    } else if (el.type === 'arrow' && el.points) {
      const pts = el.points.map(p => [p[0], p[1]]);
      if (pts.length >= 2) {
        const startX = el.x + pts[0][0], startY = el.y + pts[0][1];
        const endPt = pts[pts.length - 1];
        const endX = el.x + endPt[0], endY = el.y + endPt[1];

        let d = `M ${startX} ${startY}`;
        for (let i = 1; i < pts.length; i++) {
          d += ` L ${el.x + pts[i][0]} ${el.y + pts[i][1]}`;
        }
        const marker = el.endArrowhead === 'arrow' ? ` marker-end="url(#arrowhead)"` : '';
        parts.push(`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}"${opacity}${marker} />`);
      }

    } else if (el.type === 'text') {
      const fs2 = el.fontSize || 16;
      const ta = el.textAlign || 'center';
      const anchor = ta === 'center' ? 'middle' : (ta === 'right' ? 'end' : 'start');
      const xOff = ta === 'center' ? (el.width || 0) / 2 : (ta === 'left' ? 0 : (el.width || 0));
      const lines = (el.text || '').split('\n');
      const lineHeight = fs2 * 1.3;
      lines.forEach((line, i) => {
        const ly = (el.y || 0) + fs2 + i * lineHeight;
        parts.push(`<text x="${(el.x || 0) + xOff}" y="${ly}" font-family="Virgil, Segoe UI Emoji, sans-serif" font-size="${fs2}" fill="${stroke}" text-anchor="${anchor}"${opacity}>${escapeXml(line)}</text>`);
      });

    } else if (el.type === 'frame') {
      parts.push(`<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="none" stroke="${stroke || '#999'}" stroke-width="1" stroke-dasharray="6 3"${opacity} />`);
    }
  }

  parts.push('</svg>');

  // Add arrowhead marker if any arrows exist
  let svg = parts.join('\n');
  if (svg.includes('marker-end="url(#arrowhead)"')) {
    svg = svg.replace('</svg>', '');
    svg += `\n<defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#1e1e2e" /></marker></defs>\n</svg>`;
  }

  fs.writeFileSync(outputPath, svg);
  console.log(`  ${path.basename(inputPath)} → ${path.basename(outputPath)} (${(svg.length / 1024).toFixed(0)} KB)`);
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// CLI
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node exc-to-svg.js <input.excalidraw> <output.svg>');
  process.exit(1);
}
excalidrawToSvg(args[0], args[1]);
