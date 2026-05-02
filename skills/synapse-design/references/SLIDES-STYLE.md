# SLIDES-STYLE: Why.J Engineering Theater Full Protocol

## 1. Visual Constitution (TASET)

- **Palette**: Main #1E1E1E | Accent #d97757 | Blue #6a9bcc | Green #788c5d | Marker rgba(217, 119, 87, 0.12).
- **mark/strong**: Both use `var(--strong-bg)` background — same visual treatment.
- **Layout**: Push-Left (5% margin) for Agenda/Take Aways. Grid (65%/35%) for Mechanism pages.
- **Typography**: Gochi Hand (Handwriting) | Caveat (Subtitle) | JetBrains Mono (Code) | Poppins (Pretext).

## 2. Page Type Rules

### Cover (00)
- NO image, NO pulse, NO pretext animation.
- Format: H1 title → H2 Chinese subtitle (topic thesis, NOT "Synapse vX.X") → Version/Author/Date metadata line.
- Watermark: `whyj + {project_id} + YYYY/MM/DD`.

### Context (01)
- Grid layout with visual-box. Has pulse + pretext animation.
- Collects factual information (事实 1, 事实 2, ...). H2 emphasizes "现状分析".
- Pulse performs high-level abstraction of all facts.
- visual-box contains 🍌 nano-banana prompt.

### Agenda (02)
- `canvas-layer push-left` + `no-bullet` class.
- Questions must grow from Context facts (e.g. "事实 2→3 的压缩逻辑 —— Q1").
- Each `<li>` has `class="fragment"` for sequential reveal.
- NO image, NO pulse.

### Mechanism (03-N)
- Grid layout (`canvas-layer`, 65%/35%).
- Must have: pretext animation, pulse conclusion, visual-box with 🍌 nano-banana prompt.
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

## 4. Imagen Prompt Format

visual-box prompts follow this pattern:
```html
<div class="visual-box">
  <div style="font-size: 0.75rem; line-height: 1.5; color: #666; padding: 10px; text-align: left;">
    <div style="font-weight: 800; color: var(--accent-claude); margin-bottom: 8px;">Imagen Prompt</div>
    [Description of what the figure should show, using synapse-figure rules: flat, engineering style, thin borders, orange/teal accents, white background]
  </div>
</div>
```

## 5. Engineering Patterns

### Figure Zooming
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
