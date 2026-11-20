---
name: synapse
description: "Orchestrate Synapse slides and multi-artifact workflows, from source material through DSL, article, diagrams, and motion. For personal reflections and growth records use synapse-notes. For technical writing aimed at peers use synapse-tech-blog."
repository: https://github.com/yangjingo/Synapse
homepage: https://github.com/yangjingo/Synapse
version: 2.0.0
---

# Synapse

Master orchestrator for the Synapse skill system.

## Sub-Skills

| Skill | Directory | Purpose |
|-------|-----------|---------|
| `synapse-forge` | `skills/synapse-forge/` | URLs/files → DSL (熔炉): ingestion + synthesis |
| `synapse-design` | `skills/synapse-design/` | Slides profiles and rendering templates |
| `synapse-tech-blog` | `skills/synapse-tech-blog/` | Technical articles, paper notes, reviews, figures and publishing handoffs |
| `synapse-notes` | `skills/synapse-notes/` | Personal reflections, reading notes, research observations, and growth records |
| `synapse-pretext` | `skills/synapse-pretext/` | Blog DSL → HTML rendering + text layout engine |
| `synapse-excalidraw` | `skills/synapse-excalidraw/` | Excalidraw diagram generation (Morandi palette, layout.js) |
| `synapse-animation` | `skills/synapse-animation/` | Animated SVG/GIF + Remotion output |

## Pipeline Overview

```
User provides URLs/files
        │
        ▼
  synapse-forge (Stage 1-3)
  Fetch → Extract → Synthesize
        │
        ▼
  DSL file (*.dsl.md)
       ╱ ╲
      ╱   ╲
     ▼     ▼
  Slides   Blog
  Render   Render
     │     │
     ▼     ▼
  HTML    HTML
```

## Operation A: Why.J Theater (Slides)

### Full Pipeline

1. **Ingest**: `synapse-forge` — URLs/files → Slides DSL
2. **Render**: copy `skills/synapse-design/references/WHYJ-SLIDES.html`, replace content per DSL
   - If target output has `examples/<project>/DESIGN.md`, load it first and treat it as a hard visual rule set.
   - For any new/recreated raster figure, **invoke the Codex built-in `$imagegen` skill and use its default built-in `image_gen` tool mode**.
   - Do not route figure generation through Gemini, Imagen APIs, Nano Banana, or another external image provider. If built-in `image_gen` is unavailable or fails, report the failure; use the `$imagegen` CLI/API fallback only after the user explicitly approves it.
   - Read both `Figure prompt suffix / 风格控制` and `文件落地` from DESIGN.md first, then merge into generated prompts.
   - For every `::visual`/prompt:
     - append or enforce：`white paper background`、`rough black ink`、`sparse labels`、`single accent #D97757`、`no gradients`、`no shadows`、`no 3D`、`no decorative clutter`、`no emoji`；
     - if prompt uses a different base palette, overwrite to align DESIGN.md（以 DESIGN.md 为准）；
     - all image assets must be written to `examples/<project>/figures/` and referenced as `./figures/...` in DSL/HTML.
3. **Post-process**: `npx prettier --write [file]`

### Structural Sequence

1. **00 / Cover** — Identity & Title (`YYYY/MM/DD`)
2. **01 / Context** — Factual survey: collect facts, pulse does high-level abstraction
3. **02 / Agenda** — Questions that grow from Context facts, guiding reader from different angles
4. **03-N / Mechanism** — Core sub-logics, one per slide, O(1) complexity
5. **Take A Ways** — Q→A mapping (Q1→A1...Q3→A3), Q4 becomes pulse conclusion
6. **Reference** — Verified source list

### Visual Rules

- **Cover**: NO image, NO pulse, NO pretext animation. Title + Chinese subtitle (topic thesis) + Version/Author/Date. Subtitle is NOT "Synapse vX.X".
- **Context (01)**: 事实 1-N list. H2 emphasizes "现状分析". Pulse does high-level abstraction. visual-box with Codex `$imagegen` prompt (single source of truth).
- **Agenda (02)**: Questions grow from Context facts. `push-left` + `fragment`. NO image, NO pulse.
- **Mechanism (03-N)**: pulse + visual-box + pretext animation. Codex `$imagegen` (Excalidraw-inspired: white paper background, rough black ink, sparse labels, single accent `#D97757`, no gradients, no shadows, no 3D, no decorative clutter). Raster generation uses the built-in `image_gen` path.
- **Take A Ways**: Q→A strict mapping. `push-left`, NO visual-box. Q4 → pulse with `fragment`.
- **Reference**: `.canvas-footer`. Bold title wraps `<a href>`, full URL inline. CSS `::before` auto-generates arrows — do NOT hand-write `→`.

### Rendering Rules

- **Watermark**: `whyj + {project_id} + YYYY/MM/DD`
- **HTML Title**: `{Project Name} | Synapse v{version}`
- **mark/strong**: both share `var(--strong-bg)`
- **DSL Directives**: `::math` → KaTeX, `::code` → `.code-container`, `::pulse` → `.pulse-layer`, `==text==` → `<mark>`
- **Pretext Animation**: all pages except Cover have `<div class="pretext-stage" data-pretext-src="slide">`
- **Design Source Override**: when `examples/<project>/DESIGN.md` exists, project visual controls and figure constraints from that file override the default template defaults (white paper, rough ink, sparse labels, `#D97757`, etc.).
  - Read any `Figure prompt suffix / 风格控制` section and append those constraints to every generated `::visual` prompt unless it conflicts with correctness.
  - Keep the source of truth in `examples/<project>/figures/index.md` (image name, prompt, usage, and placement).
  - Figure image assets for example outputs must remain under `examples/<project>/figures` and be referenced as `./figures/...` in DSL/HTML.
  - All figure insertion in HTML must point to this local path and allow prompt-only recovery when file is missing.
  - `::image`/`::visual` 默认只展示图像与 Caption，`prompt` 仅在放大/zoom 弹窗内展示。

### Copy-Not-Create (MANDATORY)

Slides HTML MUST be copied from verified template, never hand-written. Hand-writing misses ~100 lines CSS + ~200 lines JS (Reveal.js, pretext, fonts, colors).

## Operation B: Notes and Technical Blog

Use [synapse-notes](skills/synapse-notes/SKILL.md) for personal reflections, observations, and records of changes in understanding. Use [synapse-tech-blog](skills/synapse-tech-blog/SKILL.md) to give peers a technical argument they can verify and reuse. Select a publishing format separately when requested.

For a combined deck and blog, keep one evidence spine. Use `synapse-forge` for the DSL when useful, then have the article skill adapt the argument for reading. `synapse-pretext` owns its HTML rendering and verification protocol.

## Diagram Pipeline (excalidraw → animate → gif)

1. **Generate**: `synapse-excalidraw` builds `.excalidraw` with Morandi palette
2. **Validate**: collision check (`scripts/validate.js`)
3. **Upload**: `npx excalidraw-cli export <file>` → shareable URL → user confirms
4. **Animate**: `synapse-animation` handles output based on input type:
   - **Excalidraw** → excalidraw-animate (SVG/WebM/GIF)
   - **Direct GIF** → PIL/imageio primitives (Slack/Discord optimized)
   - **Remotion** → staged reveals for technical explainers
5. **Integrate**: embed in slides, blog, or deliver standalone

## Master Protocols (MANDATORY)

- DSL syntax → `skills/synapse-forge/FORGE.DSL.md`
- Slides template → `skills/synapse-design/references/WHYJ-SLIDES.html`
- Writing workflow → `synapse-notes` or `synapse-tech-blog`
- Excalidraw diagrams → `skills/synapse-excalidraw/SKILL.md` (Phase 0 讨论确认 → Phase 1 生成 → Phase 2 上传确认 → Phase 3 同步 blog+slides)

## Slides Quality Gate

1. **No Fluff** — Stripped all social-media hooks and emojis
2. **Aggressive Pulse** — Conclusion hits like a hammer
3. **Codex imagegen only** — Raster illustration prompts invoke the built-in `$imagegen` skill and its default `image_gen` tool mode.
   Required controls for these prompts: white paper background, rough hand-drawn black ink, sparse labels, single accent `#D97757`, no gradients, no shadows, no 3D, no decorative elements, no emoji.
   - Do not route figure prompts to Gemini, Imagen APIs, Nano Banana, or other external providers. Do not silently fall back to an API/CLI generator.
4. **DESIGN.md precedence** — If an example-level `DESIGN.md` exists, its image rules dominate all other defaults; generated figure prompts and prompt-only fallbacks must be consistent and verifiable in the corresponding `figures/index.md`.

## Trigger

Use when the user asks for:

- Why.J Theater slide deck or DSL slides
- full Synapse orchestration (slides + figures + blog)
- `做PPT`, `演讲稿`, `技术分享`, `做成 slides`
- any request spanning multiple synapse sub-skills

## Prohibited

- NO X/Twitter threads
- NO Xiaoshu (Little Red Book) templates
- NO low-density summaries
