# SLIDES-STYLE: Why.J Engineering Theater Full Protocol

## 1. Visual Constitution (TASET)

- **Palette**: Main #1E1E1E | Accent #d97757 | Marker rgba(217, 119, 87, 0.12).
- **Layout**: Push-Left (5% margin), 40% right-side whitespace.
- **Typography**: Gochi Hand (Handwriting) | Caveat (Subtitle) | JetBrains Mono (Code).

## 2. Mandatory Structural Layering

- **00 / Cover**: Identity & Versioning. Use `YYYY/MM/DD` for placeholder dates.
- **01-09 / Mechanism**: Engineering logics. All `visual-box` can use `data-scale="1.2"` for emphasis.
- **10 / Takeaways**: Use `SUMMARY_VISUAL` placeholder for final logic mapping.
- **11 / Reference**: Use `ref-list` for sources and `reference-tag` for external project links.

## 3. Engineering Patterns

### Figure Zooming
To scale a visual box (e.g., for detailed diagrams), add `data-scale` attribute:
```html
<div class="visual-box" data-scale="1.5">
  <img src="path/to/fig.png">
</div>
```

### Watermark Protocol
Format: `whyj + {project_id} + YYYY/MM/DD`. 
Opacity: `0.1` for subtle existence.

## 4. The Rendering Engine (HTML Source)

Refer to `references/WHYJ-SLIDES.html` for the complete template. The engine uses:
- **Reveal.js 4.3.1**: For non-transition linear flow.
- **KaTeX 0.16.7**: For O(1) math logic rendering.
- **Dynamic Scale Script**: To map `data-scale` to CSS `transform`.
