#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const STRUCTURE_ALIASES = {
  cover: 'cover',
  conver: 'cover',
  outline: 'outline',
  agenda: 'outline',
  takeaway: 'takeaway',
  takeaways: 'takeaway',
  summary: 'takeaway',
  reference: 'reference',
  references: 'reference',
};
const REQUIRED_SLOTS = ['cover', 'outline', 'takeaway', 'reference'];
const MIN_BODY_PAGES = 5;
const STRUCTURE_PATTERNS = [
  /ui-label[^>]*>\s*(\d{2})\s*\/\s*([A-Za-z][A-Za-z-]*)\s*</gi,
  /^#{1,3}\s*(\d{2})\s*\/\s*([A-Za-z][A-Za-z-]*)\s*$/gim,
  /<!--\s*(\d{2})\s+([A-Za-z][A-Za-z-]*)\s*-->/gi,
];
const HTML_SECTION_PATTERN = /<section\b[^>]*>([\s\S]*?)<\/section>/gi;
const MARKDOWN_SECTION_SPLIT_PATTERN = /^\s*---\s*$/gm;

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.log(`Error reading ${filePath}: ${error.message}`);
    return null;
  }
}

function extractMarkersFromContent(content) {
  const markers = [];
  const seenPositions = new Set();

  for (const pattern of STRUCTURE_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of content.matchAll(pattern)) {
      const position = match.index ?? 0;
      if (seenPositions.has(position)) {
        continue;
      }
      seenPositions.add(position);

      const rawLabel = match[2].trim();
      const canonicalLabel = STRUCTURE_ALIASES[rawLabel.toLowerCase()];

      markers.push({
        order: Number.parseInt(match[1], 10),
        rawLabel,
        canonicalLabel: canonicalLabel ?? null,
      });
    }
  }

  markers.sort((left, right) => left.order - right.order);
  return markers;
}

function extractStructureMarkers(filePath) {
  const content = readText(filePath);
  if (content === null) {
    return [];
  }

  const sections = content.toLowerCase().includes('<section')
    ? [...content.matchAll(HTML_SECTION_PATTERN)].map((match) => match[1])
    : content.split(MARKDOWN_SECTION_SPLIT_PATTERN);

  const markers = [];
  for (const sectionContent of sections) {
    const sectionMarkers = extractMarkersFromContent(sectionContent);
    if (sectionMarkers.length > 0) {
      markers.push(sectionMarkers[0]);
    }
  }

  markers.sort((left, right) => left.order - right.order);
  return markers;
}

function validateStructure(filePath) {
  const markers = extractStructureMarkers(filePath);
  if (markers.length === 0) {
    return [false, []];
  }

  const firstSeen = new Map();
  for (const marker of markers) {
    if (!marker.canonicalLabel) {
      continue;
    }
    if (!firstSeen.has(marker.canonicalLabel)) {
      firstSeen.set(marker.canonicalLabel, marker);
    }
  }

  const missing = REQUIRED_SLOTS.filter((slot) => !firstSeen.has(slot));
  if (missing.length > 0) {
    return [false, [`Missing required slide sections: ${missing.join(', ')}`]];
  }

  const sequence = REQUIRED_SLOTS.map((slot) => firstSeen.get(slot).order);
  const sortedSequence = [...sequence].sort((left, right) => left - right);
  if (sequence.some((value, index) => value !== sortedSequence[index])) {
    const details = REQUIRED_SLOTS.map(
      (slot) => `${slot}(${firstSeen.get(slot).order.toString().padStart(2, '0')}/${firstSeen.get(slot).rawLabel})`,
    ).join(' -> ');
    return [false, [`Required slide sections are out of order: ${details}`]];
  }

  const bodyPages = markers.filter(
    (marker) => marker.order > firstSeen.get('outline').order && marker.order < firstSeen.get('takeaway').order,
  );
  if (bodyPages.length < MIN_BODY_PAGES) {
    return [false, [`Need at least ${MIN_BODY_PAGES} body pages between outline and takeaway; found ${bodyPages.length}.`]];
  }

  return [
    true,
    [
      'Structure OK: ' +
        REQUIRED_SLOTS.map(
          (slot) => `${slot}=${firstSeen.get(slot).order.toString().padStart(2, '0')}/${firstSeen.get(slot).rawLabel}`,
        ).join(', ') +
        `, body_pages=${bodyPages.length}`,
    ],
  ];
}

function collectTargetFiles(targetPath) {
  const resolvedPath = path.resolve(targetPath);
  const stats = fs.statSync(resolvedPath);

  if (stats.isFile()) {
    return [resolvedPath];
  }
  if (!stats.isDirectory()) {
    return [];
  }

  const entries = [];
  for (const entry of fs.readdirSync(resolvedPath, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') {
      continue;
    }

    const fullPath = path.join(resolvedPath, entry.name);
    if (entry.isDirectory()) {
      entries.push(...collectTargetFiles(fullPath));
    } else if (entry.isFile()) {
      entries.push(fullPath);
    }
  }

  return entries;
}

function validateProjectStructure(directory = '.') {
  const absoluteDirectory = path.resolve(directory);
  let checkedFiles = 0;
  let failedFiles = 0;

  console.log(`--- Scanning directory: ${absoluteDirectory} ---`);
  for (const filePath of collectTargetFiles(absoluteDirectory)) {
    if (!filePath.endsWith('.html') && !filePath.endsWith('.md')) {
      continue;
    }

    const markers = extractStructureMarkers(filePath);
    if (markers.length === 0) {
      continue;
    }

    checkedFiles += 1;
    const [ok, messages] = validateStructure(filePath);
    if (ok) {
      console.log(`[  OK  ] ${filePath}`);
      for (const message of messages) {
        console.log(`        ${message}`);
      }
    } else {
      failedFiles += 1;
      console.log(`[ FAIL ] ${filePath}`);
      for (const message of messages) {
        console.log(`        ${message}`);
      }
    }
  }

  if (checkedFiles === 0) {
    console.log('No slide structure markers found.');
    return;
  }

  console.log(`\n--- Structure Validation Complete: ${checkedFiles} checked, ${failedFiles} failed. ---`);
}

function main(argv = process.argv.slice(2)) {
  const directory = argv.find((arg) => !arg.startsWith('-')) ?? '.';
  validateProjectStructure(directory);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  extractStructureMarkers,
  validateStructure,
  validateProjectStructure,
};
