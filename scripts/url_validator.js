#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// URLs are still supported for legacy checks.
const URL_PATTERN = /https?:\/\/[^\s<>"'\]\)]+/g;

// Page structure is normalized to these canonical slots.
const PAGE_ALIASES = {
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
const REQUIRED_PAGES = ['cover', 'outline', 'takeaway', 'reference'];

// Extract page markers from either HTML slides or Markdown slide DSL.
const PAGE_PATTERNS = [
  /ui-label[^>]*>\s*(\d{2})\s*\/\s*([A-Za-z][A-Za-z-]*)\s*</gi,
  /^#{1,3}\s*(\d{2})\s*\/\s*([A-Za-z][A-Za-z-]*)\s*$/gim,
  /<!--\s*(\d{2})\s+([A-Za-z][A-Za-z-]*)\s*-->/gi,
];
const HTML_SECTION_PATTERN = /<section\b[^>]*>([\s\S]*?)<\/section>/gi;
const MARKDOWN_SECTION_SPLIT_PATTERN = /^\s*---\s*$/gm;
const HTML_LIST_ITEM_PATTERN = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
const MARKDOWN_LIST_ITEM_PATTERN = /^\s*[-*+]\s+(.*)$/gm;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const REFERENCE_ITEM_PATTERN = /^(.+?)\s*-\s*(.+?)\s*-\s*(https?:\/\/\S+)\s*$/i;
const REFERENCE_PROJECT_PATTERN = /^(.+?)\s*-\s*(https?:\/\/\S+)\s*$/i;
const REFERENCE_LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/i;

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

function extractUrls(filePath) {
  const content = readText(filePath);
  if (content === null) {
    return new Set();
  }

  const urls = new Set();
  for (const match of content.matchAll(URL_PATTERN)) {
    urls.add(match[0]);
  }
  return urls;
}

function extractStructureMarkersFromContent(content) {
  const markers = [];
  const seenPositions = new Set();

  for (const pattern of PAGE_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of content.matchAll(pattern)) {
      const position = match.index ?? 0;
      if (seenPositions.has(position)) {
        continue;
      }
      seenPositions.add(position);

      const rawLabel = match[2].trim();
      const canonicalLabel = PAGE_ALIASES[rawLabel.toLowerCase()];
      if (!canonicalLabel) {
        continue;
      }

      markers.push({
        order: Number.parseInt(match[1], 10),
        rawLabel,
        canonicalLabel,
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

  const markers = [];
  const isHtml = content.toLowerCase().includes('<section');
  const blocks = isHtml ? [...content.matchAll(HTML_SECTION_PATTERN)].map((match) => match[1]) : content.split(MARKDOWN_SECTION_SPLIT_PATTERN);

  for (const block of blocks) {
    const sectionMarkers = extractStructureMarkersFromContent(block);
    if (sectionMarkers.length === 0) {
      continue;
    }

    const marker = sectionMarkers[0];
    markers.push({
      ...marker,
      content: block,
    });
  }

  markers.sort((left, right) => left.order - right.order);
  return markers;
}

function extractListItems(content) {
  const htmlItems = [...content.matchAll(HTML_LIST_ITEM_PATTERN)].map((match) => normalizeText(match[1]));
  if (htmlItems.length > 0) {
    return htmlItems;
  }
  return [...content.matchAll(MARKDOWN_LIST_ITEM_PATTERN)].map((match) => normalizeText(match[1]));
}

function hasPattern(text, patterns) {
  return patterns.some((pattern) => new RegExp(pattern, 'i').test(text));
}

function validateCoverSection(content) {
  const issues = [];
  const plainText = normalizeText(content);

  if (!/<h1\b/i.test(content)) {
    issues.push('Cover needs a main title (`h1`).');
  }
  if (!/<h2\b/i.test(content)) {
    issues.push('Cover needs a subtitle or thesis line (`h2`).');
  }
  if (!hasPattern(plainText, ['Version', '版本'])) {
    issues.push('Cover needs version metadata.');
  }
  if (!hasPattern(plainText, ['Author', '作者'])) {
    issues.push('Cover needs author metadata.');
  }
  if (!hasPattern(plainText, ['Date', '日期'])) {
    issues.push('Cover needs date metadata.');
  }

  return issues;
}

function validateOutlineSection(content) {
  const issues = [];
  const items = extractListItems(content);

  if (items.length < 3 || items.length > 5) {
    issues.push(`Outline needs 3-5 list items; found ${items.length}.`);
  }

  items.forEach((item, index) => {
    if (!hasPattern(item, ['\\bQ\\d+\\b', '\\?', '问题'])) {
      issues.push(`Outline item ${index + 1} should be question-led.`);
    }
  });

  return issues;
}

function validateTakeawaySection(content) {
  const issues = [];
  const items = extractListItems(content);

  if (items.length < 2 || items.length > 4) {
    issues.push(`Takeaway needs 2-4 list items; found ${items.length}.`);
  }

  const strongCount = [...content.matchAll(/<strong\b/gi)].length;
  if (strongCount === 0) {
    issues.push('Takeaway needs emphasized labels (`strong`).');
  }

  return issues;
}

function validateReferenceSection(content) {
  const issues = [];
  const items = extractListItems(content);

  if (!/class=["'][^"']*\bref-list\b[^"']*["']/i.test(content)) {
    issues.push('Reference needs a `ref-list` container.');
  }
  if (items.length < 1) {
    issues.push('Reference needs at least one list item.');
  }
  let sawBookStyle = false;
  let sawProjectStyle = false;
  items.forEach((item, index) => {
    if (REFERENCE_ITEM_PATTERN.test(item)) {
      sawBookStyle = true;
      return;
    }

    if (REFERENCE_PROJECT_PATTERN.test(item)) {
      sawProjectStyle = true;
      return;
    }

    const markdownLink = REFERENCE_LINK_PATTERN.test(item);
    if (markdownLink && item.includes('-')) {
      return;
    }

    issues.push(`Reference item ${index + 1} should use \`Title - Source - URL\`, \`Title - URL\`, or the same forms with markdown links.`);
  });
  if (!sawBookStyle) {
    issues.push('Reference needs at least one book-style item (`Title - Source - URL`).');
  }
  if (!sawProjectStyle) {
    issues.push('Reference needs at least one project-style item (`Title - URL`).');
  }
  if ((content.match(URL_PATTERN) ?? []).length === 0) {
    issues.push('Reference needs at least one URL.');
  }
  return issues;
}

function validateSectionElements(section) {
  if (section.canonicalLabel === 'cover') {
    return validateCoverSection(section.content);
  }
  if (section.canonicalLabel === 'outline') {
    return validateOutlineSection(section.content);
  }
  if (section.canonicalLabel === 'takeaway') {
    return validateTakeawaySection(section.content);
  }
  if (section.canonicalLabel === 'reference') {
    return validateReferenceSection(section.content);
  }
  return [];
}

function validateSlideStructure(filePath) {
  const markers = extractStructureMarkers(filePath);
  if (markers.length === 0) {
    return [false, []];
  }

  const firstSeen = new Map();
  for (const marker of markers) {
    if (!firstSeen.has(marker.canonicalLabel)) {
      firstSeen.set(marker.canonicalLabel, marker);
    }
  }

  const missing = REQUIRED_PAGES.filter((page) => !firstSeen.has(page));
  if (missing.length > 0) {
    return [false, [`Missing required pages: ${missing.join(', ')}`]];
  }

  const sequence = REQUIRED_PAGES.map((page) => firstSeen.get(page).order);
  const sortedSequence = [...sequence].sort((left, right) => left - right);
  if (sequence.some((value, index) => value !== sortedSequence[index])) {
    const details = REQUIRED_PAGES.map(
      (page) => `${page}(${firstSeen.get(page).order.toString().padStart(2, '0')}/${firstSeen.get(page).rawLabel})`,
    ).join(' -> ');
    return [false, [`Required pages are out of order: ${details}`]];
  }

  const elementIssues = [];
  for (const page of REQUIRED_PAGES) {
    elementIssues.push(...validateSectionElements(firstSeen.get(page)));
  }
  if (elementIssues.length > 0) {
    return [false, elementIssues];
  }

  return [
    true,
    [
      'Structure OK: ' +
        REQUIRED_PAGES.map(
          (page) => `${page}=${firstSeen.get(page).order.toString().padStart(2, '0')}/${firstSeen.get(page).rawLabel}`,
        ).join(', '),
      'Element rules OK for cover, outline, takeaway, and reference.',
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
      continue;
    }

    if (entry.isFile()) {
      entries.push(fullPath);
    }
  }

  return entries;
}

function validateProjectStructure(directory = '.') {
  const absoluteDirectory = path.resolve(directory);
  const checkedFiles = [];
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

    checkedFiles.push(filePath);
    const [ok, messages] = validateSlideStructure(filePath);
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

  if (checkedFiles.length === 0) {
    console.log('No slide structure markers found.');
    return;
  }

  console.log(`\n--- Structure Validation Complete: ${checkedFiles.length} checked, ${failedFiles} failed. ---`);
}

async function checkUrl(url) {
  if (typeof fetch !== 'function') {
    throw new Error('Node 18+ is required for URL validation.');
  }

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  };

  try {
    let response = await fetch(url, { method: 'HEAD', headers, redirect: 'follow' });
    if (response.status >= 400) {
      response = await fetch(url, { method: 'GET', headers, redirect: 'follow' });
    }

    return [url, response.status, response.status < 400 ? 'OK' : 'FAILED'];
  } catch (error) {
    return [url, null, `ERROR: ${error.message}`];
  }
}

async function validateProjectUrls(directory = '.') {
  const absoluteDirectory = path.resolve(directory);
  const allUrls = new Set();

  console.log(`--- Scanning directory: ${absoluteDirectory} ---`);
  for (const filePath of collectTargetFiles(absoluteDirectory)) {
    if (!filePath.endsWith('.html') && !filePath.endsWith('.md')) {
      continue;
    }

    const urls = extractUrls(filePath);
    if (urls.size === 0) {
      continue;
    }

    console.log(`Found ${urls.size} URLs in ${filePath}`);
    for (const url of urls) {
      allUrls.add(url);
    }
  }

  if (allUrls.size === 0) {
    console.log('No URLs found.');
    return;
  }

  console.log(`\n--- Validating ${allUrls.size} unique URLs ---\n`);

  const results = await Promise.all([...allUrls].map((url) => checkUrl(url)));
  let failedCount = 0;

  for (const [url, code, status] of results) {
    if (status !== 'OK') {
      console.log(`[ ${status} ] ${code ?? '---'} -> ${url}`);
      failedCount += 1;
    } else {
      console.log(`[  ${status}  ] ${code} -> ${url}`);
    }
  }

  console.log(`\n--- Validation Complete: ${allUrls.size} checked, ${failedCount} failed. ---`);
}

async function main(argv = process.argv.slice(2)) {
  const args = [...argv];
  const useUrls = args.includes('--urls');
  const directory = args.find((arg) => !arg.startsWith('-')) ?? '.';

  if (useUrls) {
    await validateProjectUrls(directory);
    return;
  }

  validateProjectStructure(directory);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  extractUrls,
  extractPageMarkers: extractStructureMarkers,
  extractStructureMarkers,
  validateSlideStructure,
  validateProjectStructure,
  validateProjectUrls,
};
