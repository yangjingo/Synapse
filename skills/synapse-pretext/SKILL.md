---
name: synapse-pretext
description: Zero-DOM text measurement and manual line layout for Synapse outputs. Other skills delegate here when they need text geometry — height prediction, obstacle-aware reflow, shrinkwrap width, justified layout, or proportional character sizing. Use when animated text fields, geometry-sensitive titles, editorial flow, or ASCII-art rendering require precise layout without touching the DOM.
---

# Synapse Pretext

The text geometry engine for Synapse. Other skills delegate here when they need to know where text will land — without triggering a reflow.

Pretext measures and positions multiline text through pure arithmetic. No `getBoundingClientRect`. No layout thrashing. No DOM dependency.

## When to Use

- Animated text that must know its height before the first paint
- Title routing around obstacles (images, callouts, pull quotes)
- Multi-column editorial flow with cursor handoff between columns
- Shrinkwrap: the tightest width that preserves line count
- Justified layout with Knuth-Plass optimization and river detection
- Proportional-font ASCII art where character width varies per weight/style
- Canvas/SVG text rendering where DOM measurement is impossible
- Virtualized lists that need exact item heights upfront
- Click-spawn emphasis characters (stick figures) on pretext-powered pages

## When NOT to Use

- Static single-line text — CSS handles this fine
- Layout that doesn't depend on text geometry
- Any page where DOM measurement is acceptable and text never moves

## Read

### Core References

1. `reference/the-editorial-engine.html` — the definitive reference. Multi-column flow, obstacle-aware reflow, drop caps, pull quotes, adaptive headline sizing, 60fps animated text.
2. `reference/shrinkwrap-showdown.html` — binary search for tightest width.
3. `reference/justification-comparison.html` — Knuth-Plass optimal line breaking with hyphenation and river detection.
4. `reference/fluid-smoke.html` — full-screen fluid ASCII animation with per-character width measurement.
5. `reference/variable-typographic-ascii.html` — particle system mapped to characters by brightness and width.
6. `reference/index.html` — landing page linking to all demos.

### Blog Integration References

These three blogs demonstrate the complete pretext integration pattern with all sub-features (meta, figures, references, stick figure, smoke).

1. `examples/dsv4-blog-layout.html` — **warm editorial style**. DeepSeek-V4 article. Cream background, orange accent, serif body, stick figure emphasis. Single figure (hybird-attn.png).
2. `examples/opd-blog.html` — **warm editorial + smoke effect**. OPD / On-Policy Distillation article. Same warm palette as dsv4 but with mouse-following smoke particle overlay. Two figures (opd.png + hybird-attn.png).
3. `examples/agent-eval-blog.html` — **warm editorial + smoke + SVG figure**. AI Agent evaluation guide. Three figures (eval-structure.svg + two placeholders with prompts for synapse-excalidraw generation).

All files are self-contained single HTML. Open directly in browser, no web server needed.

## Feature → Reference Map

| Feature | Reference | Key APIs |
|---------|-----------|----------|
| Obstacle-aware reflow around moving shapes | `the-editorial-engine.html` | `prepareWithSegments` `layoutNextLine` cursor loop |
| Multi-column flow with cursor handoff | `the-editorial-engine.html` | `layoutNextLine` cursor passing between columns |
| Adaptive headline sizing (binary search font size) | `the-editorial-engine.html` | `prepareWithSegments` + `walkLineRanges` in size loop |
| Drop caps and pull quotes | `the-editorial-engine.html` | `prepareWithSegments` `layoutWithLines` rect obstacles |
| Shrinkwrap (tightest width, same line count) | `shrinkwrap-showdown.html` | `prepareWithSegments` `walkLineRanges` binary search |
| Knuth-Plass optimal justification | `justification-comparison.html` | `prepareWithSegments` `walkLineRanges` DP optimization |
| Full-screen fluid ASCII animation | `fluid-smoke.html` | `prepareWithSegments` per-character width |
| Particle system with brightness/width selection | `variable-typographic-ascii.html` | `prepareWithSegments` proportional measurement |

### Blog Integration Features

| Feature | All Blogs | Details |
|---------|-----------|---------|
| Adaptive title fitting | `dsv4` `opd` `agent-eval` | `fitTitle()` binary search, `prepareWithSegments` + `layoutWithLines` |
| Author info + tag badge | `dsv4` `opd` `agent-eval` | `.meta-tag` accent badge + `.meta-date` author line |
| Reference section with hyperlinks | `dsv4` `opd` `agent-eval` | `bodyHTML` with `<div><a>` per reference |
| Click-spawn stick figure | `dsv4` `opd` `agent-eval` | Canvas overlay `requestAnimationFrame` bounce + wave |
| Figure integration + click-to-zoom | `opd` `agent-eval` | `.figure-block` + `max-height: 70vh` + zoom overlay |
| Missing image placeholder | `dsv4` `opd` `agent-eval` | `img.onerror` → "待生成插图" + prompt text |
| Smoke particle overlay | `opd` `agent-eval` | Mouse-following radial gradient particles on fixed canvas |
| SVG figure (Excalidraw) | `agent-eval` | `eval-structure.svg` generated via `synapse-excalidraw` |

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

## Blog Integration Patterns

Every pretext-powered blog shares these patterns. Read any of the three blog references for a complete working implementation.

### 1. Page structure

```html
<canvas id="stick-canvas"></canvas>     <!-- stick figure overlay -->
<div class="smoke-wrap">                <!-- smoke particles wrapper (optional) -->
  <canvas id="smoke-canvas"></canvas>
  <div class="page">
    <div class="meta-tag">TAG</div>
    <div class="meta-date">YYYY/MM/DD · author</div>
    <div id="title-wrap"></div>          <!-- pretext fitTitle() fills this -->
    <div id="lead-wrap"></div>           <!-- pretext measures, CSS renders -->
    <div class="hr"></div>
    <div id="sections-wrap"></div>       <!-- pretext measures, CSS renders -->
    <div id="pulse-wrap" class="pulse"></div>
  </div>
</div>
```

### 2. SECTIONS array

```js
var SECTIONS = [
  { heading: "...", body: "..." },                                    // text section
  { heading: "...", body: "...", callout: "..." },                    // text + callout
  { image: "figures/file.svg", caption: "Fig N: ...", prompt: "..." }, // figure
  { heading: "Reference", body: "[1] ...", bodyHTML: '<div>...</div>' } // refs
];
```

### 3. Render loop

```js
for (var si = 0; si < SECTIONS.length; si++) {
  var s = SECTIONS[si];
  if (s.image) { /* create figure block + img onerror placeholder + zoom click */ continue; }
  // heading + callout + body (with bodyHTML support for Reference section)
}
```

### 4. Stick figure

Canvas overlay, click-spawn at `e.clientX, e.clientY`, bounce physics, waving arm, blinking eyes, no auto-dismiss. All colors from `--accent`. Scale `0.65`.

**Full implementation:** search for `⑥ 火柴人` in any blog reference.

### 5. Smoke particles (optional)

Mouse-following radial gradient particles on a fixed canvas. Emits from cursor + ambient from bottom edge. Accent color with low alpha for subtle atmosphere.

**Full implementation:** search for `⑦ 烟雾` in `opd-blog.html` or `agent-eval-blog.html`.

### 6. Figure → skill delegation

When `s.image` points to a non-existent file, `img.onerror` shows a "待生成插图" placeholder with the prompt. To resolve:

1. **Check `s.prompt`** — describes what the image should contain
2. **Delegate:**
   - `synapse-excalidraw` — flow diagrams, architecture diagrams, concept maps (SVG, editable)
   - `synapse-figure` — technical illustrations, data charts
   - `synapse-animation` — animated sequences
3. **Generate → upload → user confirms → export SVG** — see `synapse-excalidraw` SKILL.md for the confirmation workflow
4. **Save** to `figures/` directory, placeholder auto-resolves on reload

## Workflow

1. **Decide if pretext is needed** — does the text move, resize, flow around obstacles, or need exact geometry before render?
2. **Prepare once, layout many times** — `prepareWithSegments` once, `layout`/`layoutNextLine` on every resize
3. **Match font strings exactly** — pretext font string must be identical to CSS
4. **Inline the library** — all output must be self-contained

## Skill Composition

### With synapse-design (blog)

`synapse-design` delegates to `synapse-pretext` when the HTML blog needs animated or geometry-sensitive text. Apply `prepareWithSegments` at minimum to animated text fields; extend to title, lead, and caption as needed.

### With synapse-figure (illustrations)

`synapse-figure` delegates for label measurement (`prepareWithSegments`) and text routing around diagram elements (`layoutNextLine`).

### With synapse-excalidraw (diagrams)

When a figure entry has no image file, delegate to `synapse-excalidraw` with the `s.prompt` and surrounding section context. Follow the upload → confirm → export workflow defined in that skill's SKILL.md.

### With synapse-animation (animation)

When a Remotion composition includes text that must reflow during animation, use pretext for per-frame text measurement instead of DOM reads.

### Ordering with other skills

1. `synapse-figure` defines what to communicate
2. `synapse-pretext` refines typography and line layout
3. `synapse-design` defines palette and visual tokens
4. `synapse-design` implements the final web artifact
5. `synapse-animation` adds motion when needed

## HTML Build Protocol

The blog HTML template (`examples/dsv4-blog-layout.html`) is the reference implementation of pretext-powered blog rendering. `synapse-forge` uses this template for the Content→Blog mapping.

### Template contents

The reference template contains:
- Complete inlined pretext library (~2000 lines: bidi, segment, measure, layout)
- `fitTitle()` binary search for adaptive headline sizing
- Stick figure canvas overlay with click-spawn animation
- Figure zoom overlay with `img.onerror` placeholder
- SECTIONS array renderer with callout, body, and bodyHTML support
- Stats bar showing layout metrics

### Content variable contract

The template exposes these variables for downstream skills to fill:

| Variable | Type | Description |
|----------|------|-------------|
| `TITLE` | string | Article headline, fitted via `fitTitle()` |
| `LEAD` | string | Opening paragraph |
| `SECTIONS` | array | `{ heading, body, callout, image, caption, prompt, bodyHTML }` entries |
| `PULSE` | string | Final takeaway paragraph |
| `.meta-tag` | HTML | Category badge |
| `.meta-date` | HTML | Author + date line |
| `<title>` | HTML | Page title |

### Rendering rules

- Use backtick template literals for all content strings — Chinese curly quotes `""` inside JS `"..."` break parsing
- `bodyHTML` fields (Reference section) use single quotes since they contain HTML tags
- Image paths: use relative paths from output directory
- DO NOT run prettier — it breaks the inlined ~2000-line pretext library

The full rendering orchestration (copy template → fill variables) is defined in `synapse-forge` SKILL.md.

## Rules

- Font string must match CSS exactly.
- `lineHeight` in `layout()` must match CSS `line-height`.
- Avoid `system-ui` font on macOS — use a named font.
- Runtime requires `Intl.Segmenter` and Canvas 2D text measurement.
- Do not claim pretext usage unless the page is actually using pretext APIs.
- All output using pretext must be self-contained — inline the library, do not reference external files.
- Prepare once per text+font combination. Layout is the hot path.
- Never trigger DOM reflow for text measurement. That is the entire point of this skill.
- **Blog content strings MUST use backtick template literals** — Chinese curly quotes `""` inside JS `"..."` strings break parsing and cause white-screen rendering.
- **DO NOT run prettier** on pretext-powered HTML — it expands the inlined library's compact arrays and can introduce quote escaping issues.

## Reference

- Package: `@chenglou/pretext` on npm
- Repo: https://github.com/chenglou/pretext
- Demos: https://chenglou.me/pretext/
- Docs: https://pretextjs.dev/
