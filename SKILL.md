---
name: synapse
description: Master skill for Why.J Engineering. Distills technical noise into Why.J Theater DSL slides or high-density engineering blogs via sub-skills. Orchestrates synapse-forge, synapse-design, synapse-figure, synapse-viz, synapse-pretext, and synapse-gif.
repository: https://github.com/yangjingo/Synapse
homepage: https://github.com/yangjingo/Synapse
version: 6.0
---

# Synapse Forge

Master orchestrator for the Synapse skill system.

## Sub-Skills

| Skill | Directory | Purpose |
|-------|-----------|---------|
| `synapse-forge` | `skills/synapse-forge/` | Raw material ingestion & refinement (熔炉) |
| `synapse-design` | `skills/synapse-design/` | Source material → blog.md + blog.html |
| `synapse-figure` | `skills/synapse-figure/` | Technical illustration orchestration |
| `synapse-viz` | `skills/synapse-viz/` | PyTorch model structure visualization |
| `synapse-pretext` | `skills/synapse-pretext/` | Pretext text layout integration |
| `synapse-gif` | `skills/synapse-gif/` | Animated GIFs + Remotion technical animations |
| `synapse-excalidraw` | `skills/synapse-excalidraw/` | Mermaid/screenshot → Excalidraw → animated hand-drawn diagrams |

## Master Protocols (MANDATORY)

All outputs MUST follow these references:

- `references/WHYJ-SLIDES.html` — Master template for slide decks
- `references/WHYJ-SLIDES-DSL.md` — DSL syntax source of truth
- `references/SLIDES-STYLE.md` — Slide visual style guide
- Blog style → `skills/synapse-design/references/BLOG-STYLE.md`
- Figure style → `skills/synapse-figure/references/FIGURE-STYLE.md`

## Operation A: Why.J Theater (Slides)

### Structural Sequence

1. **00 / Cover** — Identity & Title (`YYYY/MM/DD`)
2. **01 / Context** — "Why now?" & problem statement
3. **02 / Agenda** — 4-question logic tree (no-bullet, push-left)
4. **03-N / Mechanism** — Core sub-logics, one per slide, O(1) complexity
5. **Takeaways** — 3 items max
6. **Reference** — Verified source list

### Visual Rules

- **Push-Left Truth**: All content `flex-start`, NO centering
- **Max 5 points per slide**, single-line logic only
- **Watermark**: `whyj + {project_id} + YYYY/MM/DD` on every page
- **Aggressive Pulse**: Every slide ends with `@pulse:` hammer conclusion
- **Figure Zoom**: `data-scale="1.2"` on `.visual-box` for complex diagrams
- **H2 Dominance**: `text-transform: none !important` for headers
- **Reference Tags**: `.reference-tag` class for external links

### Post-Generation (MANDATORY)

Run `npx prettier --write [file]` after generating any HTML/DSL.

## Operation A.5: Material Ingestion (Forge)

When user provides URLs, local files, or raw material:

Delegate to **`synapse-forge`** skill to produce structured `forge-output.md` before proceeding to Operation A or B.

## Operation B: Engineering Blog

Delegate to **`synapse-design`** skill. Core principles:

- Senior-to-senior tone, zero marketing
- Thesis-first, mechanism-driven
- Follow `skills/synapse-design/references/BLOG-STYLE.md`

## O(1) Quality Gate

Before delivering, verify:

1. **No Fluff** — Stripped all social-media hooks and emojis
2. **Aggressive Pulse** — Conclusion hits like a hammer
3. **Nano Banano** — Diagram prompts follow `skills/synapse-figure/references/FIGURE-STYLE.md`

## Trigger

Use when the user asks for:

- Why.J Theater slide deck or DSL slides
- full Synapse orchestration (slides + figures + blog)
- `做PPT`, `演讲稿`, `技术分享`, `做成 slides`, `按 WhyJ 风格整理`
- any request spanning multiple synapse sub-skills

## Prohibited

- NO X/Twitter threads
- NO Xiaoshu (Little Red Book) templates
- NO low-density summaries
