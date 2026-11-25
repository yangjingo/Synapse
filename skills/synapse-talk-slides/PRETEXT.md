# Pretext for slides

Use this reference for precise line fitting and animated text in Slides. Keep the deck template’s integration and measure only the fields that depend on text geometry.

## Core API


### Height prediction — `prepare` + `layout`

```js
const prepared = prepare('AGI 春天到了. بدأت الرحلة 🚀', '16px Inter')
const { height, lineCount } = layout(prepared, 320, 20)
```

`prepare()` normalizes, segments, and measures with canvas. Returns an opaque handle.
`layout()` is the hot path — pure arithmetic over cached widths. On resize, only rerun `layout()`.

### Manual line layout — `prepareWithSegments` + `layoutWithLines`

```js
const prepared = prepareWithSegments(text, '18px "Helvetica Neue"')
const { lines } = layoutWithLines(prepared, 320, 26)
for (const line of lines) ctx.fillText(line.text, line.x, line.y)
```

### Obstacle-aware flow — `layoutNextLine` cursor loop

```js
let cursor = { segmentIndex: 0, graphemeIndex: 0 }
while (true) {
  const width = getWidthForY(cursor.y, obstacles)
  const line = layoutNextLine(prepared, cursor, width)
  if (line === null) break
  placeLine(line)
  cursor = line.end
}
```

### Shrinkwrap — `walkLineRanges` binary search

```js
let targetLines = 0
walkLineRanges(prepared, maxWidth, () => targetLines++)
let lo = 1, hi = widestLine
while (lo < hi) {
  const mid = (lo + hi) >>> 1
  let count = 0
  walkLineRanges(prepared, mid, () => count++)
  if (count <= targetLines) hi = mid; else lo = mid + 1
}
// lo is the tightest width
```

### Character measurement — `prepareWithSegments` for single chars

```js
const p = prepareWithSegments(ch, font)
const width = p.widths.length > 0 ? p.widths[0] : 0
```

## Workflow


1. **Decide if pretext is needed** — does the text move, resize, flow around obstacles, or need exact geometry before render?
2. **Prepare once, layout many times** — `prepareWithSegments` once, `layout`/`layoutNextLine` on every resize
3. **Match font strings exactly** — pretext font string must be identical to CSS
4. **Inline the library** — all output must be self-contained

## Rules


- Font string must match CSS exactly.
- `lineHeight` in `layout()` must match CSS `line-height`.
- Avoid `system-ui` font on macOS — use a named font.
- Runtime requires `Intl.Segmenter` and Canvas 2D text measurement.
- Do not claim pretext usage unless the page is actually using pretext APIs.
- All output using pretext must be self-contained — inline the library, do not reference external files.
- Prepare once per text+font combination. Layout is the hot path.
- Never trigger DOM reflow for text measurement. That is the entire point of this skill.
### Verify module syntax after editing HTML

Chinese curly quotes “” (U+201C/U+201D) are **never** valid JS string delimiters. They look like quotes but JavaScript treats them as regular characters, causing `SyntaxError: Invalid or unexpected token` that silently kills the entire `<script type="module">`. This has caused **3+ white-screen incidents**.

**Root cause**: node scripts or Edit tool modifying HTML files that contain Chinese curly quotes as text content may accidentally:
1. Replace a backtick/straight-quote **delimiter** with a curly quote
2. Replace HTML attribute straight double quotes `"href=..."` with curly quotes `href="..."`

**Allowed**: curly quotes as string **content** (“质量保持”) — never as **delimiters**

**Mandatory verification after ANY edit to .html template files**:
```bash
node -e "new Function('async function _m(){' + require('fs').readFileSync('FILE','utf8').match(/<script type=\"module\">([\\s\\S]*)<\\/script>/)[1] + '}'); console.log('OK')"
```
If this fails → there are curly-quote delimiters or other syntax errors. **Fix before reporting done.**

- **DO NOT run prettier** on pretext-powered HTML — it expands the inlined library's compact arrays and can introduce quote escaping issues.

## Reference

- Package: `@chenglou/pretext` on npm
- Repo: https://github.com/chenglou/pretext
- Demos: https://chenglou.me/pretext/
- Docs: https://pretextjs.dev/
