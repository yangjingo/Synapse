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
| `synapse-forge` | `skills/synapse-forge/` | Raw material ingestion & refinement (熔炉) |
| `synapse-design` | `skills/synapse-design/` | Source material → blog.md + blog.html |
| `synapse-figure` | `skills/synapse-figure/` | Technical illustration orchestration |
| `synapse-viz` | `skills/synapse-viz/` | PyTorch model structure visualization |
| `synapse-pretext` | `skills/synapse-pretext/` | Pretext text layout integration |
| `synapse-gif` | `skills/synapse-gif/` | Animated GIFs + Remotion technical animations |

## Quick Integration

```bash
npx skills add https://github.com/yangjingo/Synapse
```

## Usage

- **Slides**: *"Forge a Why.J Theater slide deck from these logs."*
- **Blog**: *"Distill this paper into a WhyJ-style blog. Skip the fluff."*
- **Figure**: *"Give me a Nano Banano hand-drawn prompt for this logic."*
- **GIF/Animation**: *"Animate this architecture diagram with staged reveals."*

## Directory Structure

```
SKILL.md              ← Root skill definition (synapse)
skills/               ← Sub-skill directories (each with SKILL.md + source material)
  synapse-forge/      ← Raw material ingestion & refinement (熔炉)
  synapse-design/     ← Blog production (references, assets, evals)
  synapse-figure/     ← Illustration orchestration (references, assets, scripts)
  synapse-viz/        ← PyTorch visualization (references, assets, scripts)
  synapse-pretext/    ← Pretext text layout (references, scripts)
  synapse-gif/        ← Animated GIFs + Remotion animations (references)
references/           ← Master slide protocols (DSL, slides template, slides style)
examples/             ← Slide decks and blog examples
scripts/              ← Validators and utilities
```

---
<div align="center">
<strong>Synapse Forge v6.0</strong>
</div>
