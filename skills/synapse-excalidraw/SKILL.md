---
name: synapse-excalidraw
description: Convert Mermaid flowcharts or Excalidraw screenshots into animated hand-drawn diagrams. Three input modes — Mermaid syntax, screenshot image, or existing .excalidraw file — all produce Excalidraw JSON then animate via excalidraw-animate. Use when users request Mermaid-to-Excalidraw, diagram animation, hand-drawn flowchart animation, or excalidraw-cli workflows.
---

# Synapse Excalidraw

Three-mode pipeline for animated hand-drawn diagrams:

1. **Mermaid Mode** — Mermaid flowchart syntax → Excalidraw JSON → animated SVG/WebM
2. **Screenshot Mode** — Excalidraw/diagram screenshot → Excalidraw JSON → animated SVG/WebM
3. **Direct Mode** — `.excalidraw` file → animated SVG/WebM

## When to Use

- User provides Mermaid flowchart syntax and wants an animated hand-drawn version
- User provides a diagram screenshot and wants it reconstructed as animated Excalidraw
- User has a `.excalidraw` file and wants to animate it
- User asks for `excalidraw`, `hand-drawn diagram`, `animate flowchart`, `Mermaid动画`, `流程图动画`, `手绘动画`
- Technical architecture or pipeline needs staged reveal animation

## When NOT to Use

- Static diagrams where animation adds no explanatory value → use `synapse-figure` instead
- Code-driven video with complex sequencing → use `synapse-animation` (Remotion Mode)
- Photo-to-animated-GIF → use `synapse-animation` (GIF Mode) or `gif-sticker-maker`

---

## Design System

### Color Philosophy

Excalidraw-style technical diagrams with semantic color coding. Each color maps to a component role in the architecture, not decoration. Pastel fills with saturated strokes so blocks are readable at a glance while maintaining the hand-drawn aesthetic.

**Color rules:**
- Pastel fill + saturated stroke for every block — never use the stroke color as fill
- Stroke color carries the semantic meaning; fill provides contrast
- Residual and bracket lines use gray to stay subordinate to main flow
- Cross-attention paths use orange to stand out as the key architectural link
- No block should use `ink` as fill — reserved for text and borders only
- Do not mix color roles — attention is always the same role, never reuse for another
- Do not use decorative gradients or shadows
- Do not use more than 8 semantic colors in a single diagram

### Morandi Palettes (Preferred)

Low-saturation, high-gray, muted colors. Core formula: **reduce saturation + add gray + lower lightness**. Colors should feel quiet, never compete.

Four preset sets available via `morandi()` in layout.js:

#### Classic (灰绿系)
| Role | Fill | Stroke | Note |
|------|------|--------|------|
| attention | `#B8C4C0` sage | `#7A9188` | self-attention |
| masked | `#C8BFB0` oat | `#9A8E7E` | masked attention |
| cross | `#C4B0B0` dusty pink | `#9A7E7E` | cross-attention |
| feedforward | `#B4B8C8` powder blue | `#848A9E` | feed-forward |
| addnorm | `#B4C4B6` moss | `#7E9A84` | add & norm |
| embedding | `#B8B4C4` wisteria | `#887E9A` | embeddings |
| positional | `#A8BCC0` sea foam | `#749CA4` | positional encoding |
| output | `#C4B0B4` blush | `#9A7E84` | output head |

Structural: background `#F0ECE6`, ink `#4A4540`, ink-muted `#908A84`, residual `#A8A299`

#### Warm Earth (暖土系)
| Role | Fill | Stroke | Note |
|------|------|--------|------|
| attention | `#C4B8A8` sand | `#9A8870` | |
| masked | `#C8B4A4` terracotta | `#A08068` | |
| cross | `#C4A8A4` warm rose | `#9A7E78` | |
| feedforward | `#BCC4AC` olive | `#8A9A70` | |
| addnorm | `#C0BCA8` wheat | `#948E74` | |
| embedding | `#C0B4B0` warm clay | `#968078` | |
| positional | `#B8B8AC` stone | `#88887A` | |
| output | `#C8B8B0` desert | `#A08880` | |

Structural: background `#EDE8E0`, ink `#4A4338`, ink-muted `#908878`

#### Cool Mist (冷雾系)
| Role | Fill | Stroke | Note |
|------|------|--------|------|
| attention | `#A8B8C8` slate blue | `#748A9E` | |
| masked | `#B8B8C4` fog | `#8888A0` | |
| cross | `#B8A8C0` lavender | `#8878A0` | |
| feedforward | `#A8C0C4` ice blue | `#7098A0` | |
| addnorm | `#ACBCB8` silver sage | `#789490` | |
| embedding | `#B4A8C4` heather | `#8078A0` | |
| positional | `#A0B8C4` arctic | `#6888A0` | |
| output | `#C0A8B8` mauve | `#A07890` | |

Structural: background `#E8ECF0`, ink `#384048`, ink-muted `#788898`

#### Forest & Stone (林石系)
| Role | Fill | Stroke | Note |
|------|------|--------|------|
| attention | `#A8C0A8` forest sage | `#709870` | |
| masked | `#C4C0AC` limestone | `#9A9474` | |
| cross | `#C0A8A8` clay rose | `#9A7878` | |
| feedforward | `#A8B4C0` blue stone | `#708498` | |
| addnorm | `#98BC98` deep moss | `#689468` | |
| embedding | `#B0A8C0` amethyst | `#807098` | |
| positional | `#98B8C0` river | `#68949C` | |
| output | `#C4B8A0` sandstone | `#A08E6C` | |

Structural: background `#EBECE4`, ink `#3E4438`, ink-muted `#8A9480`

### Usage in layout.js

```javascript
const L = require('./layout');

// Random Morandi palette
const T = L.morandi();

// Or pick a specific set
const T = L.morandi('warm');   // 'classic', 'warm', 'cool', 'forest'

L.configure({
  tokens: { ink: T._ink, inkMuted: T._inkMuted },
});

// Use semantic tokens
L.place(100, 100, 200, 50, 'rectangle', T.attention, 'Self-Attention');
```

### When to Use Which Palette

| Context | Palette |
|---------|---------|
| Blog posts, documentation, technical papers | **Morandi (random)** |
| Presentations, slides, high-contrast needs | Tailwind — vivid, easy to spot from distance |
| Diagrams with 6+ colors | **Morandi** — avoids visual overload |
| Dark background (`#1e1e2e`) | Tailwind — Morandi loses contrast on dark |

### Tailwind Palette (High Contrast)

| Role | Fill | Stroke | When to Use |
|------|------|--------|-------------|
| `attention` | `#dbeafe` (blue-50) | `#3b82f6` (blue-500) | Self-attention layers |
| `masked` | `#fef3c7` (amber-50) | `#f59e0b` (amber-500) | Masked/causal attention |
| `cross` | `#fce7f3` (pink-50) | `#ec4899` (pink-500) | Cross-attention |
| `feedforward` | `#ede9fe` (violet-50) | `#8b5cf6` (violet-500) | Feed-forward networks |
| `addnorm` | `#d1fae5` (emerald-50) | `#10b981` (emerald-500) | Add & Normalize layers |
| `embedding` | `#e0e7ff` (indigo-50) | `#6366f1` (indigo-500) | Token/position embeddings |
| `positional` | `#cffafe` (cyan-50) | `#06b6d4` (cyan-500) | Positional encoding |
| `output` | `#ffe4e6` (rose-50) | `#f43f5e` (rose-500) | Linear, Softmax, output head |

Structural: `residual` `#9ca3af`, `crosspath` `#ea580c`, `nx-bracket` `#6b7280`

### Typography

All text uses `fontFamily: 1` (Virgil handwritten). Three tiers:

- **Heading**: 28px, `ink` — diagram title
- **Block label**: 15px, `ink` — component names inside blocks
- **Annotation**: 13px, `ink-muted` — ×N brackets, legend, K/V labels

### Spacing & Shapes

- Blocks: 200×50px with 16px vertical gaps
- Columns: 400px apart
- Bracket lines offset 30px from block edges
- All rectangles: `roundness: { type: 3 }`, `roughness: 1`, `strokeWidth: 2`
- Arrows: `endArrowhead: "arrow"`, `strokeWidth: 2`, `roughness: 1`

---

## Dependencies

```bash
# Core tools
npm install -g excalidraw-cli        # CLI for creating .excalidraw files
npm install excalidraw-animate       # Animation library

# For Mermaid Mode (programmatic conversion)
npm install @excalidraw/mermaid-to-excalidraw
```

---

## Mode 1: Mermaid → Excalidraw → Animation

### Step 1: Parse Mermaid to Excalidraw

```javascript
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

const mermaidSyntax = `
flowchart TD
    A[Request] -->|process| B[Server]
    B -->|respond| C[Response]
`;

const { elements, files } = await parseMermaidToExcalidraw(mermaidSyntax, {
  fontSize: 20,
});

const excalidrawElements = convertToExcalidrawElements(elements);
```

**Critical: Label Binding Post-Processing**

`parseMermaidToExcalidraw` puts text labels in a `label` property inside each shape element. Excalidraw editor requires **separate `text` elements** bound via `containerId` / `boundElements`. You **must** post-process to convert:

```javascript
function bindLabels(elements) {
  const out = [];
  for (const el of elements) {
    if (el.label && el.label.text) {
      const textId = generateId();
      const fontSize = el.label.fontSize || 15;
      const textH = fontSize * el.label.text.split('\n').length * 1.25 + 8;
      out.push({
        type: 'text', id: textId,
        x: el.x + 8, y: el.y + (el.height - textH) / 2,
        width: el.width - 16, height: textH,
        text: el.label.text, fontSize, fontFamily: 1,
        textAlign: 'center', verticalAlign: 'middle',
        strokeColor: '#1e1e2e', backgroundColor: 'transparent',
        containerId: el.id, originalText: el.label.text,
      });
      el.boundElements = [{ id: textId, type: 'text' }];
    }
    delete el.label;
    out.push(el);
  }
  return out;
}
```

Without this step, all shapes will appear **without text** in the Excalidraw editor.

### Supported Mermaid Diagram Types

| Type | Support Level |
|------|--------------|
| Flowchart (rectangles, circles, diamonds, arrows) | Full — native Excalidraw shapes |
| Subgraphs | Full — grouped in Excalidraw |
| Subroutine, Cylindrical, Hexagon, Parallelogram, Trapezoid | Fallback to rectangle |
| Sequence, Class, ER, Gantt, Git | Rendered as static image, not native shapes |

### Step 2: Enhance with excalidraw-cli

Add dark mode background, camera framing, and hand-drawn styling:

```bash
# Save converted elements to JSON, then enhance via CLI
excalidraw create elements.json -o diagram.excalidraw
```

Or build directly from the parsed elements with custom styling.

### Step 3: Animate

```bash
# Open in the web tool for interactive animation
# Visit: https://dai-shi.github.io/excalidraw-animate
# Load the diagram.excalidraw file
```

---

## Mode 2: Screenshot → Excalidraw → Animation

### Step 1: Analyze the Screenshot

Use AI vision to extract the diagram structure:

1. Read the screenshot image
2. Identify all shapes (rectangles, diamonds, circles, text labels)
3. Identify all connections (arrows, lines with labels)
4. Extract text content and spatial relationships
5. Map to Excalidraw element types

### Step 2: Generate Excalidraw JSON

Key mapping rules:
- Rectangles → `type: "rectangle"` with `roundness: { "type": 3 }`
- Decision nodes → `type: "diamond"`
- Process bubbles → `type: "ellipse"`
- Arrows → `type: "arrow"` with `startBinding`/`endBinding`
- Text → `type: "text"` or `label` shorthand on shapes

### Step 3: Animate

Same as Mode 1 Step 3.

---

## Mode 3: Direct Excalidraw File → Animation

### Step 1: Load and Animate

```bash
# Export to excalidraw.com for shareable link
excalidraw export diagram.excalidraw
# → https://excalidraw.com/#json=abc123,key
```

### Animation Order

Elements without explicit animation order animate in creation order. To control reveal sequence, set `animationOrder` and `animationDuration` in element properties.

### Export Formats

| Format | Quality | Notes |
|--------|---------|-------|
| SVG | Vector, perfect | Recommended for web embedding |
| WebM | Video | Known issues; use screen capture as fallback |
| GIF | Raster | Capture from browser if WebM fails |

---

## Read

1. `references/excalidraw-cli-reference.md` — Element format, commands, dark mode defaults, label shorthand, arrow bindings (always read)
2. `references/excalidraw-animate-api.md` — Animation API, order control, export options (read when animating)
3. `references/data-viz.excalidrawlib` — 32 chart templates (bar, column, pie, donut, scatter, heatmap, radar, etc.)
4. `references/stick-figures.excalidrawlib` — 9 stick figure poses (pointing, waving, holding objects)
5. `examples/` — Proven layout.js scripts + output samples:
   - `gen-swa-attention.js` — Grid comparison (N×N matrix with banded mask)
   - `gen-prefill-decode.js` — Vertical flow animation (prefill → decode pipeline)
   - `opd-figures/` — 5 OPD diagram outputs (excalidraw + SVG) — also mirrored in main `examples/opd/figures/`
6. `scripts/exc-to-svg.js` — Pure Node.js .excalidraw → SVG converter (no dependencies)
7. `evals/` — Animation eval outputs (prefill-decode, swa-attention SVGs and source excalidraw files)

### Library Templates

Pre-made `.excalidrawlib` files with chart and figure templates. Load with `loadLib()` and recolor with Morandi palette — no need to build from scratch.

**data-viz.excalidrawlib** (32 items):

| Index | Type | Description |
|-------|------|-------------|
| 0 | Bar | Horizontal bar chart |
| 1 | Stacked Bar | Stacked horizontal bars |
| 2 | 100% Stacked Bar | Percentage stacked horizontal |
| 3 | Grouped Bar | Grouped horizontal bars |
| 4 | Column | Vertical column chart |
| 5 | Stacked Column | Stacked vertical columns |
| 6 | 100% Stacked Column | Percentage stacked vertical |
| 7 | Grouped Column | Grouped vertical columns |
| 8-9 | Line / Line+Dots | Line chart variants |
| 10-13 | Area | Area, stacked, 100%, theme river |
| 14 | Scatter | Scatter plot |
| 15 | Bubble | Bubble chart |
| 16-17 | Heatmap | Cartesian / Calendar heatmap |
| 18 | Tree Map | Treemap |
| 19 | Waterfall | Waterfall chart |
| 20-22 | Dot Strip | Dot strip plots |
| 23 | Histogram | Column histogram |
| 24 | Population Pyramid | Demographic pyramid |
| 25 | Density | Density plot |
| 26 | Box & Whisker | Box plot |
| 27 | Violin | Violin plot |
| 28 | Pie | Pie chart |
| 29 | Donut | Donut chart |
| 30 | Polar / Coxcomb | Nightingale chart |
| 31 | Radar / Spider | Radar chart |

**stick-figures.excalidrawlib** (9 items):
Standing, pointing, waving, holding sign boards, presenting.

**Usage:**

```javascript
const L = require('./layout');
const T = L.morandi();

// Load bar chart from library
L.loadLib('references/data-viz.excalidrawlib', 0, 100, 80, {
  stroke: T._inkMuted, fill: T.attention.fill,
});

// Load donut chart
L.loadLib('references/data-viz.excalidrawlib', 29, 300, 60, {
  stroke: T._inkMuted, fill: T.masked.fill, ink: T._ink,
});

// Load stick figure
L.loadLib('references/stick-figures.excalidrawlib', 0, 50, 200, {
  stroke: T._ink, fill: T.cross.fill,
});
```

---

## Workflow

### Phase 0: Discuss & Confirm Design (MANDATORY)

Before writing any code, discuss with the user what each diagram should show:

1. **List needed diagrams** — identify all diagrams needed for the target output (slides, blog, etc.)
2. **For each diagram, ask the user to choose** via `AskUserQuestion` with ASCII preview mockups:
   - Layout options (vertical flow / side-by-side / grid / custom)
   - Key data points and annotations to include
   - Color palette preference (Morandi set)
   - What to omit (keep it focused)
3. **Never auto-generate without confirmation** — rejected diagrams waste time and tokens

ASCII preview format for options (renders in monospace box):
```
┌─────────────────────────┐
│  Title                  │
│  ┌───┐  ┌───┐  ┌───┐  │
│  │ A │→│ B │→│ C │  │
│  └───┘  └───┘  └───┘  │
│  annotation text        │
└─────────────────────────┘
```

Only proceed to Phase 1 after all diagrams are confirmed.

### Phase 1: Build

1. **Identify input mode** — Mermaid syntax, screenshot, `.excalidraw` file, or library template
2. **Write layout.js script** — use `loadLib()` for charts/figures, `place()`/`arrowBetween()` for architecture, or CLI label shorthand for tables
3. **Apply styling** — pick Morandi palette (from user choice), hand-drawn defaults, camera framing
4. **Validate structure** — check arrow bindings, label placement, camera aspect ratio (4:3)

### Phase 2: Upload & Confirm

5. **Upload & Collaborate** — upload `.excalidraw` to excalidraw.com, share link with user for review:
   ```bash
   npx excalidraw-cli export <diagram>.excalidraw
   # → https://excalidraw.com/#json=<id>,<key>
   ```
   **CRITICAL: Must get user confirmation before proceeding to export.** Send the shareable link to the user, wait for their approval or revision requests, iterate on the diagram until satisfied.

### Phase 3: Export & Integrate

6. **Export** — Only after user confirmation: SVG for web (default), WebM/video for presentations, GIF for Slack
7. **Integrate** — Update **both blog AND slides** downstream files with the confirmed export (see Blog-Slides Sync rule below)
8. **Clean up** — Remove temporary generation scripts from `scripts/`

---

## Rules

- **User confirmation required before export**: Always upload to excalidraw.com first, share the link with the user, and wait for approval. Never export (SVG/PNG/WebM) or integrate into downstream files without explicit user sign-off on the diagram content and layout.
- Do not animate diagrams where a static version is equally clear
- Always use dark mode background (`#1e1e2e`) for Synapse outputs
- Camera must be 4:3 ratio — use presets: 400×300 (S), 600×450 (M), 800×600 (L), 1200×900 (XL)
- All shapes get `roughness: 2` (hand-drawn) and `roundness: { "type": 3 }` by default
- Font family must be `1` (Virgil/Excalifont handwritten)
- **All connections must use `arrow` type — never `line`**: every logical relationship must be expressed with `type: "arrow"`. Use `arrowBetween()` for shape-bound connections, `arrow()` for position-only decorative segments. Exception: `loadLib()` preserves original `line` types from library templates — do not convert.
- Arrows must use `startBinding`/`endBinding` with `fixedPoint` — never position-only for logical connections
- **Arrow endpoints must be shapes**: every arrow's start and end must connect to a shape, never float in empty space
- **Annotation text is a single block**: each annotation uses **one** rectangle with **one** bound text element containing the full paragraph (`\n` for line breaks)
- **Layout direction is strict**: elements flow only horizontally or vertically. No diagonal placement. Use `rightOf()` for horizontal, `below()`/`above()` for vertical.
- **Container text stays visible**: use `placeInside()` so parent label auto-moves to top, never occluded by children.
- For screenshot mode: verify AI-extracted structure matches original before animating
- Export SVG first; only use WebM if video is required
- **Blog-Slides Figure Sync (MANDATORY)**: When integrating figures, update ALL four downstream files simultaneously:
  1. **Blog DSL**: add `Type: figure` + `Image:` section
  2. **Blog HTML**: add `image:` / `caption:` entry in SECTIONS array
  3. **Slides DSL**: replace matching `::visual` text prompt with `::image [path] [scale=80] ::`
  4. **Slides HTML**: replace `<div class="visual-box">` text prompt with `<img src="..." style="width:80%" />`
  Never update only blog or only slides — they must stay consistent.

### layout.js Generation Quality Gates

When using `layout.js` to generate `.excalidraw` files programmatically:

1. **All logical connections via `arrowBetween()`** — never use bare `arrow()` for relationships between shapes. `arrow()` is only for decorative/bracket paths with no semantic meaning.
2. **`validate()` must pass** — zero overlaps, zero text occlusion. If `autoFix()` is needed, re-run `validate()` to confirm clean.
3. **Annotations must have complete content** — every `annotate()` call must have a real title and body with substantive text, not placeholder or empty strings.
4. **Follow proven patterns** — reference `examples/gen-swa-attention.js` and `examples/gen-prefill-decode.js` as the canonical examples of working layout.js scripts.
5. **Avoid raw `L.elements.push()`** unless building grid cells (like swa-attention's matrix). Use the `place()`/`below()`/`rightOf()` API for proper layout tracking and collision detection.

### Annotation Protocol

Every technical diagram **must** include annotation blocks.

**Step boxes** (numbered ①, ②, ③...):
- Title line: bold, states the operation
- Body lines: explain *what* and *why* in 1-3 lines
- Placed next to the relevant visual element

**Insight boxes**:
- Key takeaways, complexity results, or "aha" moments
- At least 1 insight box per diagram

**Layout rules**:
- 200-260px wide, placed to the right of the main diagram (x ≥ 600)
- Title font: 14px, body font: 12px
- Left-aligned, do not overlap with main diagram elements

---

## Output

- `.excalidraw` file — the reconstructed diagram
- `.svg` — animated SVG for web embedding
- `.webm` — video export (fallback to screen capture if broken)
- Shareable link — via `npx excalidraw-cli export <file>.excalidraw`

## Skill Composition

### With synapse-figure

`synapse-figure` defines what to communicate; `synapse-excalidraw` provides hand-drawn animated rendering.

### With synapse-animation

`synapse-excalidraw` produces the animated SVG; `synapse-animation` can convert to Slack-optimized GIF.

### With synapse-design (blog)

`synapse-excalidraw` produces the animated SVG for blog embedding.

## Reference

- excalidraw-cli: https://github.com/ahmadawais/excalidraw-cli
- excalidraw-animate: https://github.com/dai-shi/excalidraw-animate
- mermaid-to-excalidraw: https://www.npmjs.com/package/@excalidraw/mermaid-to-excalidraw
- mermaid-to-excalidraw docs: https://docs.excalidraw.com/docs/@excalidraw/mermaid-to-excalidraw
- excalidraw-animate web tool: https://dai-shi.github.io/excalidraw-animate
- Excalidraw editor: https://excalidraw.com
