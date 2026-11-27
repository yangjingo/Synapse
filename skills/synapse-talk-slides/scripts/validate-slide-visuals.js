#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const failures = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function report(file, message) {
  failures.push(`${path.relative(ROOT, file)}: ${message}`);
}

const exampleFiles = walk(path.join(ROOT, 'examples'));
const slideTemplate = path.resolve(__dirname, '../templates/whyj-slides.html');

for (const file of [...exampleFiles, slideTemplate]) {
  if (/-slides\.dsl\.md$/i.test(file)) {
    const source = fs.readFileSync(file, 'utf8');
    if (/::visual\b/i.test(source)) report(file, 'contains an unresolved `::visual` prompt.');
    continue;
  }

  if (!/-slides\.html$/i.test(file)) continue;
  const source = fs.readFileSync(file, 'utf8');
  if (/Codex imagegen|Figure prompt/i.test(source)) report(file, 'renders prompt text instead of a finished visual.');

  for (const match of source.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
    const reference = match[1].trim();
    if (!reference || /^(?:https?:|data:)/i.test(reference)) continue;
    const target = path.resolve(path.dirname(file), reference);
    if (!fs.existsSync(target)) report(file, `missing image: ${reference}`);
  }
}

if (failures.length) {
  console.error(`Slide visual validation failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Slide visual validation passed: no prompt placeholders and no missing images.');
}
