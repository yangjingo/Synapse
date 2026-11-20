#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const withGif = process.argv.includes('--with-gif');

function run(relativeScript) {
  execFileSync(process.execPath, [path.join(ROOT, relativeScript)], {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

function copy(relativeSource, relativeTarget) {
  const source = path.join(ROOT, relativeSource);
  const target = path.join(ROOT, relativeTarget);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  console.log(`  ${relativeSource} → ${relativeTarget}`);
}

function recolorAnimatedSvg(relativePath) {
  const file = path.join(ROOT, relativePath);
  let svg = fs.readFileSync(file, 'utf8');
  const replacements = new Map([
    ['#FAF8F4', '#FAFAF7'],
    ['#4A4540', '#4A4338'],
    ['#C8BFB0', '#FDF0E6'],
    ['#9A8E7E', '#C45A20'],
  ]);
  for (const [from, to] of replacements) svg = svg.replace(new RegExp(from, 'gi'), to);
  fs.writeFileSync(file, svg);
  console.log(`  recolored ${relativePath}`);
}

console.log('Refreshing blog and Excalidraw mirrors...');
run('scripts/refresh-blog-figures.js');

console.log('Refreshing concrete slide visuals...');
run('scripts/refresh-slide-visuals.js');

console.log('Refreshing pretext example figures...');
run('skills/synapse-tech-blog/examples/generate-figures.js');

console.log('Refreshing standalone Excalidraw evals...');
run('skills/synapse-tech-blog/workflows/excalidraw/examples/gen-prefill-decode.js');
run('skills/synapse-tech-blog/workflows/excalidraw/examples/gen-swa-attention.js');

console.log('Refreshing self-contained design reference assets...');
for (const name of ['figure-01-cost-curve.svg', 'figure-02-hybrid-attention.svg']) {
  copy(`examples/deepseek-v4/figures/${name}`, `skills/synapse-talk-slides/references/figures/${name}`);
}

console.log('Refreshing Forge DSL fixtures...');
copy('examples/opd/opd-blog.dsl.md', 'skills/synapse-tech-blog/workflows/forge/examples/opd-blog.dsl.md');
copy('examples/opd/opd-slides.dsl.md', 'skills/synapse-tech-blog/workflows/forge/examples/opd-slides.dsl.md');
for (const number of [1, 2, 3, 4, 5, 6, 7]) {
  copy(`examples/opd/figure/figure${number}.svg`, `skills/synapse-tech-blog/workflows/forge/examples/figure/figure${number}.svg`);
}

console.log('Refreshing animation example palette...');
for (const name of ['prefill-decode-x3.svg', 'swa-attention-animated.svg']) {
  recolorAnimatedSvg(`skills/synapse-talk-slides/workflows/animation/examples/${name}`);
}

if (withGif) {
  const converter = path.join(ROOT, 'skills/synapse-talk-slides/workflows/animation/scripts/svg-to-gif.js');
  const jobs = [
    ['prefill-decode-x3.svg', 'prefill-decode-x3.gif', '1'],
    ['swa-attention-animated.svg', 'swa-attention-x3.gif', '3'],
  ];
  for (const [input, output, speed] of jobs) {
    execFileSync(process.execPath, [converter,
      path.join(ROOT, 'skills/synapse-talk-slides/workflows/animation/examples', input),
      path.join(ROOT, 'skills/synapse-talk-slides/workflows/animation/examples', output),
      '--speed', speed,
    ], { cwd: ROOT, stdio: 'inherit' });
  }
}

run('scripts/validate-slide-visuals.js');

console.log(`Skill examples refreshed${withGif ? ' (including GIF exports)' : ''}.`);
