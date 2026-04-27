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
| `synapse-forge` | root `SKILL.md` | Master orchestrator for slides + blog |
| `synapse-design` | `skills/synapse-design/` | Source material → blog.md + blog.html |
| `synapse-figure` | `skills/synapse-figure/` | Technical illustration orchestration |
| `synapse-viz` | `skills/synapse-viz/` | PyTorch model structure visualization |
| `synapse-pretext` | `skills/synapse-pretext/` | Pretext text layout integration |
| `synapse-remotion` | `skills/synapse-remotion/` | Remotion animation integration |

## Quick Integration

```bash
npx skills add https://github.com/yangjingo/Synapse
```

## Usage

- **Slides**: *"Forge a Why.J Theater slide deck from these logs."*
- **Blog**: *"Distill this paper into a WhyJ-style blog. Skip the fluff."*
- **Visual**: *"Give me a Nano Banano hand-drawn prompt for this logic."*

## Directory Structure

```
SKILL.md              ← Root skill definition (v6.0)
skills/               ← Sub-skill directories (each with SKILL.md + source material)
  synapse-design/     ← Blog production (references, assets, evals)
  synapse-figure/     ← Illustration orchestration (references, assets, scripts)
  synapse-viz/        ← PyTorch visualization (references, assets, scripts)
  synapse-pretext/    ← Pretext text layout
  synapse-remotion/   ← Remotion animation
references/           ← Master protocols (DSL, blog style, figure style)
examples/             ← Slide decks and blog examples
scripts/              ← Validators and utilities
```

---
<div align="center">
<strong>Synapse Forge v6.0</strong>
</div>
