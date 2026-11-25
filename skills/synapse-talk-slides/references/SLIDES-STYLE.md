# SLIDES-STYLE: Why.J Engineering Theater Full Protocol

## 1. Visual Constitution (TASET)

- **Palette**: Main #1E1E1E | Accent #C45A20 | Blue #6a9bcc | Green #788c5d | Marker rgba(196, 90, 32, 0.12).
- **mark/strong**: Both use `var(--strong-bg)` background — same visual treatment.
- **Layout**: Agenda and Take Aways use Push-Left (5% margin). Context and mechanism slides select either a text-led or image-led grid.
- **Typography** — Poppins for English headings, body, labels and Pretext. Noto Sans SC for Chinese, with Microsoft YaHei as fallback. JetBrains Mono for code. Poppins follows the sans-serif heading choice in [Anthropic’s brand guidelines](https://github.com/anthropics/skills/blob/main/skills/brand-guidelines/SKILL.md).

## Two content layouts

| Layout | When to use | Placement |
| --- | --- | --- |
| `data-layout="text-led"` | The main argument is a few sentences or steps. | Text leads on the left at about 58%. The supporting figure gets about 42% on the right. |
| `data-layout="image-led"` | The audience needs to follow a diagram, chart, or screenshot. | The figure leads on the left at about 65%. Keep two or three short notes on the right. Place the Pulse in normal flow directly under the right-hand notes. |

Both layouts keep the same Theater header, canvas, rails, and Pulse treatment. Preserve the source aspect ratio for images. The HTML template shows both layouts with editable diagrams.

## 2. Page Type Rules

### Cover (00)
- NO image, NO pulse, NO pretext animation.
- Format: H1 title → H2 Chinese subtitle (topic thesis, NOT "Synapse vX.X") → Version/Author/Date metadata line.
- Watermark: `whyj + {project_id} + YYYY/MM/DD`.

### Context (01)
- Grid layout with visual-box. Has pulse + pretext animation.
- Collects factual information (事实 1, 事实 2, ...). H2 emphasizes "现状分析".
- Pulse performs high-level abstraction of all facts.
- Use an editable diagram when the audience needs to follow the relationship between components or compare states.

### Agenda (02)
- `canvas-layer push-left` + `no-bullet` class.
- Questions must grow from Context facts (e.g. "事实 2→3 的压缩逻辑 —— Q1").
- Each `<li>` has `class="fragment"` for sequential reveal.
- NO image, NO pulse.

### Mechanism (03-N)
- Use `canvas-layer` with either content layout. Let the slide's main artifact drive the choice.
- Include the Pretext animation, a Pulse conclusion, and a finished visual in the visual box.
- `::math` → KaTeX in visual-box. `::code` → `.code-container` in visual-box.
- Max 5 points per slide.

### Take Aways (10)
- `canvas-layer push-left` layout. NO visual-box.
- Must strictly answer Agenda questions: Q1→A1, Q2→A2, Q3→A3.
- Q4 becomes `pulse-layer` with `class="fragment"` for animated reveal.
- Each Q→A item has `class="fragment"` for sequential reveal.

### Reference (11)
- Uses `.canvas-footer` class (flex-start, not centered). Independent from push-left.
- `<li>` items have arrows (→). NO image, NO pulse.
- Bold title wraps `<a href>` for clickable link; full URL text still displayed inline.
- `.ref-list` class for source items.

## 3. Pretext Animation

All pages except Cover must include:
```html
<div class="pretext-stage" data-pretext-src="slide"><div class="pretext-bg"></div></div>
<div class="slide-content">
  <!-- page content here -->
</div>
```

Uses `@chenglou/pretext` library with `prepareWithSegments` + `layoutWithLines`.
Mouse-follow parallax effect via pointer events.

## 4. Technical figures

- Use warm paper (`#FAF9F5`), dark labels, thin connectors and restrained terracotta for the state or step being explained. Use light neutral fills to group related components.
- Align comparable paths side by side. Stack consecutive rounds or before/after states using the same positions and scales. Label control messages, data transfers and state boundaries where their directions differ.
- Refer to [Building effective AI agents](https://www.anthropic.com/research/building-effective-agents) for sparse workflow diagrams, [Effective context engineering for AI agents](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents) for matched panels, and [Introducing advanced tool use](https://www.anthropic.com/research/advanced-tool-use) for aligned comparisons.
- In HTML, put editable labels and shapes in `.native-diagram`. Keep the caption and source in `.visual-caption`. Use raster illustrations when the subject benefits from an image.

## 5. Engineering Patterns

### Figure Zooming

Click the image or diagram to zoom. A focused figure opens with Enter or Space. Press Esc to close. Keep source links in the caption.

```html
<div class="visual-box" data-scale="1.5">
  <img src="path/to/fig.png">
</div>
```

### Watermark Protocol
Format: `whyj + {project_id} + YYYY/MM/DD`.
Opacity: `0.1` for subtle existence.

### HTML Title
Format: `{Project Name} | Synapse v{version}`

## 6. The Rendering Engine (HTML Source)

Refer to `references/WHYJ-SLIDES.html` for the complete template. The engine uses:
- **Reveal.js 4.3.1**: For non-transition linear flow.
- **KaTeX 0.16.7**: For math rendering (`::math` DSL directive).
- **@chenglou/pretext**: For animated text background.
- **Dynamic Scale Script**: To map `data-scale` to CSS `transform`.
