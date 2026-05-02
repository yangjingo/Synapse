# Synapse Forge

<div align="center">
<img src="assets/logo.svg" alt="Synapse Logo" width="180">

**The High-Pressure Logic Forge**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.txt)
[![Claude](https://img.shields.io/badge/Claude-Skill-purple.svg)](https://claude.ai)
</div>

---

## Skills

| Skill | Directory | Purpose |
|-------|-----------|---------|
| `synapse` | root `SKILL.md` | Master orchestrator for slides + blog |
| `synapse-forge` | `skills/synapse-forge/` | Raw material ingestion & DSL synthesis (熔炉) |
| `synapse-design` | `skills/synapse-design/` | Content design, voice, slides structure |
| `synapse-pretext` | `skills/synapse-pretext/` | Blog DSL → HTML rendering + Pretext text layout engine |
| `synapse-excalidraw` | `skills/synapse-excalidraw/` | Excalidraw diagram generation (Morandi palette, layout.js API) |
| `synapse-animation` | `skills/synapse-animation/` | Animated technical diagrams (SVG/GIF + Remotion) |

## Quick Integration

```bash
npx skills add https://github.com/yangjingo/Synapse
```

## Usage

- **Slides**: *"Forge a Why.J Theater slide deck from these logs."*
- **Blog**: *"Distill this paper into a WhyJ-style blog. Skip the fluff."*
- **Figure**: *"Generate an Excalidraw diagram for this architecture with Morandi palette."*
- **GIF/Animation**: *"Animate this architecture diagram with staged reveals."*

## Directory Structure

```
SKILL.md              ← Root skill definition (synapse)
skills/
  synapse-forge/      ← Raw material ingestion & DSL synthesis (熔炉)
    FORGE.DSL.md      ← DSL syntax specification
    BLOG-STYLE.md     ← Blog style guide
    scripts/          ← Content & structure validators
  synapse-design/     ← Content design (voice, slides structure)
    design-md/        ← Design philosophy documents
    references/       ← WHYJ-SLIDES.html template, SLIDES-STYLE.md, e2e evals
  synapse-pretext/    ← Blog DSL → HTML rendering
    examples/         ← dsv4-blog-layout.html template
    reference/        ← Pretext engine demos
  synapse-excalidraw/ ← Excalidraw diagram generation
    scripts/          ← layout.js API, exc-to-svg.js converter
    references/       ← Element schema, animation API, chart/figure libraries
    examples/         ← Proven gen scripts + output samples
    evals/            ← Animation eval outputs
  synapse-animation/  ← Animated SVG/GIF + Remotion
    scripts/          ← SVG-to-GIF, speed control, pipeline animation
    references/       ← GIF toolkit docs
examples/             ← Complete slide decks + blog examples with figures
  cli-revolution/     ← CLI revolution (slides + blog + 2 excalidraw SVGs)
  deepseek-v4/        ← DeepSeek-V4 analysis (slides + blog + 2 excalidraw SVGs)
  nano-cc/            ← Nano Claude Code (slides + blog + 2 excalidraw SVGs)
  opd/                ← On-Policy Distillation (slides + blog + 5 excalidraw SVGs)
assets/               ← Logo files
docs/                 ← Project documentation
```

---
<div align="center">
<strong>Synapse Forge v6.0</strong>
</div>
