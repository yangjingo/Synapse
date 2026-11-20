---
name: synapse-design
description: Choose a Synapse slide design profile and apply its DESIGN.md, verified template, typography, spacing, and figure placement to a deck.
metadata:
  version: 2.0.0
---

# Synapse Slide Design

Use the slide request, evidence spine, and target audience to choose the layout. The Synapse orchestrator owns the end-to-end deck workflow. This skill supplies slide profiles and visual templates. If a legacy call asks for writing, route notes to `synapse-notes` and technical articles to `synapse-tech-blog` before selecting a slide profile.

## DESIGN.md System

DESIGN.md is a plain-text design system document (YAML front matter + markdown prose) that gives AI agents a persistent, structured understanding of a visual identity.

### Format (Google Stitch spec)

A DESIGN.md file has two layers:

1. **YAML front matter** — machine-readable design tokens: `colors`, `typography`, `rounded`, `spacing`, `components`
2. **Markdown body** — human-readable design rationale in `##` sections: Overview, Colors, Typography, Layout, Elevation, Shapes, Components, Do's and Don'ts

### CLI Tools

```bash
# Install
npm install @google/design.md

# Validate a DESIGN.md
npx @google/design.md lint DESIGN.md

# Diff two versions
npx @google/design.md diff DESIGN.md DESIGN-v2.md

# Export to Tailwind or DTCG
npx @google/design.md export --format tailwind DESIGN.md > tailwind.theme.json

# Get the spec for agent context
npx @google/design.md spec
```

### Ready-to-use DESIGN.md files

69 curated brand design systems at `github.com/VoltAgent/awesome-design-md`:

- Copy a site's `DESIGN.md` into the project root
- Each file includes `DESIGN.md` + `preview.html` + `preview-dark.html`
- Available profiles: Vercel, Stripe, Notion, Linear, Figma, Apple, Tesla, BMW, and 60+ more

### How Synapse Uses DESIGN.md

When the HTML artifact needs a specific visual identity:

1. If present, prefer `examples/<project>/DESIGN.md` as the highest-priority source for figure and layout constraints.
2. Otherwise choose a profile from awesome-design-md or define a custom DESIGN.md
3. Use the token system (colors, typography, spacing, rounded) as CSS custom properties
4. Validate with `npx @google/design.md lint`
5. Map component tokens to classes in the slide output

The design tokens must serve the technical argument, not override it.

### Slides Design Profile (DESIGN.md Placeholder)

Slides use a **separate** DESIGN.md placeholder from blog HTML. Before rendering or restyling any deck, resolve:

```
{design.slides.profile}  →  excalidraw-slides  |  serif-slides
```

**If the user has not chosen a profile, ask:**

> 请选择 Slides 视觉风格：
> 1. **Excalidraw 手绘剧场** — 白底网格、Gochi Hand、粗黑边框、pretext 动画、Excalidraw 插图
> 2. **Claude 衬线编辑** — 奶油底、Cormorant + Noto Serif SC、hairline 分割线、blog 式自然排版

Do not guess. Do not mix the two profiles in one deck.

| Placeholder value | DESIGN.md stub | Style spec | HTML template |
|---|---|---|---|
| `excalidraw-slides` | `design-md/excalidraw-slides-design.md` | `references/SLIDES-STYLE.md` | `references/WHYJ-SLIDES.html` |
| `serif-slides` | `design-md/serif-slides-design.md` | `references/SLIDES-STYLE-SERIF.md` | `examples/quant-agent/quant-agent-slides.html` (reference impl.) |

After substitution, load **only** the row that matches `{design.slides.profile}`.

For article writing and HTML format selection, use `synapse-tech-blog` or `synapse-notes`.

### Reference

- Spec: `github.com/google-labs-code/design.md`
- Collection: `github.com/VoltAgent/awesome-design-md`
- CLI: `npx @google/design.md lint`

## Slide rendering

- Apply only the selected profile. Follow the main Synapse slides workflow for DSL, sources, and verified figures.
- Use real pretext integration where the selected profile has geometry-sensitive or animated text. Reference the actual figure files and verify the rendered deck.
- Keep instructions and figure prompts outside the deck's reading view. Run `node scripts/validate-slide-visuals.js` before handoff.
