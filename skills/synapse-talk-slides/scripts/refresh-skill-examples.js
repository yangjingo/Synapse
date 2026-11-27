#!/usr/bin/env node

const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../../..');

function run(script) {
  execFileSync(process.execPath, [script], {
    cwd: ROOT,
    stdio: 'inherit',
  });
}

console.log('Refreshing blog figures...');
run(path.join(ROOT, 'skills/synapse-tech-blog/workflows/excalidraw/scripts/refresh-blog-figures.js'));

console.log('Refreshing concrete slide visuals...');
run(path.join(__dirname, 'refresh-slide-visuals.js'));

run(path.join(__dirname, 'validate-slide-visuals.js'));

console.log('Skill examples refreshed.');
