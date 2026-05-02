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

const STRUCTURE_PATTERNS = [
  /ui-label[^>]*>\s*(\d{2})\s*\/\s*([A-Za-z][A-Za-z-]*)\s*</gi,
  /^#{1,3}\s*(\d{2})\s*\/\s*([A-Za-z][A-Za-z-]*)\s*$/gim,
  /<!--\s*(\d{2})\s+([A-Za-z][A-Za-z-]*)\s*-->/gi,
];
const HTML_SECTION_PATTERN = /<section\b[^>]*>([\s\S]*?)<\/section>/gi;
const MARKDOWN_SECTION_SPLIT_PATTERN = /^\s*---\s*$/gm;
const HTML_LIST_ITEM_PATTERN = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
const MARKDOWN_LIST_ITEM_PATTERN = /^\s*[-*+]\s+(.*)$/gm;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const REFERENCE_BOOK_PATTERN = /^(.+?)\s*-\s*(.+?)\s*-\s*(https?:\/\/\S+)\s*$/i;
const REFERENCE_PROJECT_PATTERN = /^(.+?)\s*-\s*(https?:\/\/\S+)\s*$/i;
const VISUAL_PATTERNS = [
  /::image\b/i,
  /::code\b/i,
  /::math\b/i,
  /<img\b/i,
  /class=["'][^"']*\bvisual-box\b[^"']*["']/i,
];
const PULSE_PATTERNS = [
  /::pulse\b/i,
  /class=["'][^"']*\bpulse-layer\b[^"']*["']/i,
];
const REFERENCE_TAG_PATTERNS = [
  /::reference\b/i,
  /class=["'][^"']*\breference-tag\b[^"']*["']/i,
];
const VISUAL_REQUIRED_LABELS = new Set([
  'cover',
  'context',
  'philosophy',
  'mechanism',
  'engineering',
  'tooling',
  'testing',
]);

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.log(`Error reading ${filePath}: ${error.message}`);
    return null;
  }
}

function stripHtmlTags(text) {
  return text.replace(HTML_TAG_PATTERN, ' ');
}

function normalizeText(text) {
  return stripHtmlTags(text).replace(/\s+/g, ' ').trim();
}

function countMatches(patterns, content) {
  return patterns.reduce((sum, pattern) => {
    const matches = content.match(pattern);
    return sum + (matches ? matches.length : 0);
  }, 0);
}

function hasAnyPattern(content, patterns) {
  return patterns.some((pattern) => pattern.test(content));
}

function extractSectionMarkers(content) {
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
      markers.push({
        order: Number.parseInt(match[1], 10),
        rawLabel,
        canonicalLabel: STRUCTURE_ALIASES[rawLabel.toLowerCase()] ?? null,
      });
    }
  }

  markers.sort((left, right) => left.order - right.order);
  return markers;
}

function extractSections(filePath) {
  const content = readText(filePath);
  if (content === null) {
    return [];
  }

  const sections = content.toLowerCase().includes('<section')
    ? [...content.matchAll(HTML_SECTION_PATTERN)].map((match) => match[1])
    : content.split(MARKDOWN_SECTION_SPLIT_PATTERN);

  const extracted = [];
  for (const sectionContent of sections) {
    const markers = extractSectionMarkers(sectionContent);
    if (markers.length === 0) {
      continue;
    }

    const first = markers[0];
    extracted.push({
      order: first.order,
      rawLabel: first.rawLabel,
      canonicalLabel: first.canonicalLabel,
      content: sectionContent,
    });
  }

  extracted.sort((left, right) => left.order - right.order);
  return extracted;
}

function extractListItems(content) {
  const htmlItems = [...content.matchAll(HTML_LIST_ITEM_PATTERN)].map((match) => normalizeText(match[1]));
  if (htmlItems.length > 0) {
    return htmlItems;
  }
  return [...content.matchAll(MARKDOWN_LIST_ITEM_PATTERN)].map((match) => normalizeText(match[1]));
}

function validateCover(content) {
  const issues = [];
  const plainText = normalizeText(content);

  if (!/<h1\b/i.test(content) && !/^#\s+/m.test(content)) {
    issues.push('Cover needs a main title (`h1` or `#`).');
  }
  if (!/<h2\b/i.test(content) && !/^##\s+/m.test(content)) {
    issues.push('Cover needs a subtitle or thesis line (`h2` or `##`).');
  }
  if (!/Version/i.test(plainText) && !/版本/.test(plainText)) {
    issues.push('Cover needs version metadata.');
  }
  if (!/Author/i.test(plainText) && !/作者/.test(plainText)) {
    issues.push('Cover needs author metadata.');
  }
  if (!/Date/i.test(plainText) && !/日期/.test(plainText)) {
    issues.push('Cover needs date metadata.');
  }
  if (countMatches(VISUAL_PATTERNS, content) < 1) {
    issues.push('Cover needs one visual element (`::image` or image box).');
  }
  if (countMatches(PULSE_PATTERNS, content) < 1) {
    issues.push('Cover needs one pulse conclusion (`::pulse`).');
  }

  return issues;
}

function validateOutline(content) {
  const issues = [];
  const items = extractListItems(content);

  if (items.length !== 4) {
    issues.push(`Outline needs exactly 4 question items; found ${items.length}.`);
  }
  items.forEach((item, index) => {
    if (!/\bQ\d+\b/i.test(item) && !item.includes('?') && !item.includes('问题')) {
      issues.push(`Outline item ${index + 1} should be question-led.`);
    }
  });
  if (!/<h2\b/i.test(content) && !/^##\s+/m.test(content)) {
    issues.push('Outline needs a title line (`h2` or `##`).');
  }
  if (countMatches(PULSE_PATTERNS, content) < 1) {
    issues.push('Outline needs one pulse conclusion (`::pulse`).');
  }

  return issues;
}

function validateBody(section) {
  const issues = [];
  const content = section.content;
  const items = extractListItems(content);

  if (!/<h2\b/i.test(content) && !/^##\s+/m.test(content)) {
    issues.push('Body section needs a title line (`h2` or `##`).');
  }
  if (items.length < 3) {
    issues.push(`Body section needs at least 3 bullet items; found ${items.length}.`);
  }
  if (VISUAL_REQUIRED_LABELS.has(section.rawLabel.toLowerCase()) && countMatches(VISUAL_PATTERNS, content) < 1) {
    issues.push('Body section needs one visual element (`::image`, `::code`, or `::math`).');
  }
  if (countMatches(PULSE_PATTERNS, content) < 1) {
    issues.push('Body section needs one pulse conclusion (`::pulse`).');
  }

  return issues;
}

function validateTakeaway(content) {
  const issues = [];
  const items = extractListItems(content);

  if (!/<h2\b/i.test(content) && !/^##\s+/m.test(content)) {
    issues.push('Takeaway needs a title line (`h2` or `##`).');
  }
  if (items.length !== 3) {
    issues.push(`Takeaway needs exactly 3 action items; found ${items.length}.`);
  }
  if (countMatches(PULSE_PATTERNS, content) < 1) {
    issues.push('Takeaway needs one pulse conclusion (`::pulse`).');
  }

  return issues;
}

function validateReference(content) {
  const issues = [];
  const items = extractListItems(content);
  const plainText = normalizeText(content);

  if (!/<h2\b/i.test(content) && !/^##\s+/m.test(content)) {
    issues.push('Reference needs a title line (`h2` or `##`).');
  }
  if (!/class=["'][^"']*\bref-list\b[^"']*["']/i.test(content) && items.length < 4) {
    issues.push('Reference needs a `ref-list` container or at least 4 list items.');
  }

  let sawBookStyle = false;
  let sawProjectStyle = false;
  items.forEach((item, index) => {
    const normalized = normalizeText(item);
    if (REFERENCE_BOOK_PATTERN.test(normalized)) {
      sawBookStyle = true;
      return;
    }
    if (REFERENCE_PROJECT_PATTERN.test(normalized)) {
      sawProjectStyle = true;
      return;
    }

    issues.push(`Reference item ${index + 1} should use \`Title - Source - URL\` or \`Title - URL\`.`);
  });

  if (!sawBookStyle) {
    issues.push('Reference needs at least one book-style item (`Title - Source - URL`).');
  }
  if (!sawProjectStyle) {
    issues.push('Reference needs at least one project-style item (`Title - URL`).');
  }
  if (!/https?:\/\//i.test(plainText)) {
    issues.push('Reference needs at least one URL.');
  }
  if (countMatches(REFERENCE_TAG_PATTERNS, content) < 1) {
    issues.push('Reference needs one reference tag (`::reference` or `reference-tag`).');
  }

  return issues;
}

function validateSection(section) {
  if (section.canonicalLabel === 'cover') {
    return validateCover(section.content);
  }
  if (section.canonicalLabel === 'outline') {
    return validateOutline(section.content);
  }
  if (section.canonicalLabel === 'takeaway') {
    return validateTakeaway(section.content);
  }
  if (section.canonicalLabel === 'reference') {
    return validateReference(section.content);
  }
  return validateBody(section);
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

function validateProjectContent(directory = '.') {
  const absoluteDirectory = path.resolve(directory);
  let checkedFiles = 0;
  let failedFiles = 0;

  console.log(`--- Scanning directory: ${absoluteDirectory} ---`);
  for (const filePath of collectTargetFiles(absoluteDirectory)) {
    if (!filePath.endsWith('.html') && !filePath.endsWith('.md')) {
      continue;
    }

    const sections = extractSections(filePath);
    if (sections.length === 0) {
      continue;
    }

    checkedFiles += 1;
    const issues = [];
    for (const section of sections) {
      issues.push(...validateSection(section));
    }

    if (issues.length === 0) {
      console.log(`[  OK  ] ${filePath}`);
      console.log('        Content rules OK for cover, body, outline, takeaway, and reference.');
    } else {
      failedFiles += 1;
      console.log(`[ FAIL ] ${filePath}`);
      for (const issue of issues) {
        console.log(`        ${issue}`);
      }
    }
  }

  if (checkedFiles === 0) {
    console.log('No slide sections found.');
    return;
  }

  console.log(`\n--- Content Validation Complete: ${checkedFiles} checked, ${failedFiles} failed. ---`);
}

function main(argv = process.argv.slice(2)) {
  const directory = argv.find((arg) => !arg.startsWith('-')) ?? '.';
  validateProjectContent(directory);
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
  validateProjectContent,
};
