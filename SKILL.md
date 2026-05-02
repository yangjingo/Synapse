---
name: synapse
description: Master skill for Why.J Engineering. Orchestrates the full pipeline: forge ingests URLs/files → produces DSL, then renders to slides or blog HTML via copy-not-create. Delegates to synapse-forge (ingestion + DSL synthesis), synapse-pretext (blog rendering), and other sub-skills for figures, diagrams, and animation.
repository: https://github.com/yangjingo/Synapse
homepage: https://github.com/yangjingo/Synapse
version: 6.0
---

# Synapse

Master orchestrator for the Synapse skill system.

## Sub-Skills

| Skill | Directory | Purpose |
|-------|-----------|---------|
| `synapse-forge` | `skills/synapse-forge/` | URLs/files → DSL (熔炉): ingestion + synthesis |
| `synapse-design` | `skills/synapse-design/` | Content creation guidance (voice, structure, slides template) |
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
- **Context (01)**: 事实 1-N list. H2 emphasizes "现状分析". Pulse does high-level abstraction. visual-box with 🍌 nano-banana prompt.
- **Agenda (02)**: Questions grow from Context facts. `push-left` + `fragment`. NO image, NO pulse.
- **Mechanism (03-N)**: pulse + visual-box + pretext animation. 🍌 nano-banana (Excalidraw: black ink, white bg, stick figures, sparse labels). Max 5 points.
- **Take A Ways**: Q→A strict mapping. `push-left`, NO visual-box. Q4 → pulse with `fragment`.
- **Reference**: `.canvas-footer`. Bold title wraps `<a href>`, full URL inline. CSS `::before` auto-generates arrows — do NOT hand-write `→`.

### Rendering Rules

- **Watermark**: `whyj + {project_id} + YYYY/MM/DD`
- **HTML Title**: `{Project Name} | Synapse v{version}`
- **mark/strong**: both share `var(--strong-bg)`
- **DSL Directives**: `::math` → KaTeX, `::code` → `.code-container`, `::pulse` → `.pulse-layer`, `==text==` → `<mark>`
- **Pretext Animation**: all pages except Cover have `<div class="pretext-stage" data-pretext-src="slide">`

### Copy-Not-Create (MANDATORY)

Slides HTML MUST be copied from verified template, never hand-written. Hand-writing misses ~100 lines CSS + ~200 lines JS (Reveal.js, pretext, fonts, colors).

## Operation B: Engineering Blog

### Full Pipeline

1. **Ingest**: `synapse-forge` — URLs/files → Blog DSL
2. **Render**: `synapse-pretext` — copy `skills/synapse-pretext/examples/dsv4-blog-layout.html`, fill DSL content
3. **Verify**: JS syntax check (no prettier — breaks ~2000-line inlined library)

### Blog Rendering Protocol (synapse-pretext)

1. `cp skills/synapse-pretext/examples/dsv4-blog-layout.html` to target
2. Replace: TITLE, LEAD, SECTIONS, PULSE, meta-tag, meta-date, `<title>`
3. Backtick template literals for ALL content strings (Chinese `""` breaks JS `"..."`)
4. bodyHTML uses single quotes (contains HTML tags)
5. Image paths: relative from output directory
6. DO NOT run prettier
7. Verify: `node -e "new Function(require('fs').readFileSync('file','utf8').match(/<script.*>([\s\S]*)<\/script>/)[1])"`

### Blog Content Principles

- Senior-to-senior tone, zero marketing
- Thesis-first, mechanism-driven
- Follow `skills/synapse-forge/FORGE-DSL.md` Section C for voice and style

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

- DSL syntax → `skills/synapse-forge/FORGE.DSL.md` (唯一 DSL + 文风参考)
- Slides template → `skills/synapse-design/references/WHYJ-SLIDES.html`
- Blog template → `skills/synapse-pretext/examples/dsv4-blog-layout.html`
- Excalidraw diagrams → `skills/synapse-excalidraw/SKILL.md` (Phase 0 讨论确认 → Phase 1 生成 → Phase 2 上传确认 → Phase 3 同步 blog+slides)

## O(1) Quality Gate

1. **No Fluff** — Stripped all social-media hooks and emojis
2. **Aggressive Pulse** — Conclusion hits like a hammer
3. **Nano Banano** — Diagram prompts follow FIGURE-STYLE.md

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
