---
name: synapse-design
description: Turn source material such as notes, raw information, or a paper PDF into exactly two final blog artifacts in the WhyJ Engineering voice: one technical Markdown blog with static-image generation prompts, and one polished HTML blog using DESIGN.md-style rules and pretext-style text layout constraints. Use this whenever the user wants a publishable technical post rather than a neutral summary.
---

# Synapse Design

Use this skill to turn technical material into a WhyJ-style engineering blog package.

The target is not a neutral summary.  
The target is a two-artifact delivery that feels like:

- someone read the source carefully
- extracted the real mechanism
- decided what actually matters
- wrote it down in a way other engineers would save
- compressed the logic until each section carries one hard point

## Input / Output Contract

### Accepted input

This skill accepts one or more of:

- raw information
- working notes
- paper PDFs
- report text
- benchmark observations
- architecture notes

### Final output

This skill must end with exactly two final artifacts:

1. a technical blog Markdown file
2. a polished blog HTML file

Do not treat any other artifact as a final deliverable.

### Markdown artifact requirements

The Markdown artifact must:

- use the WhyJ voice
- be thesis-first and mechanism-driven
- be publishable as a technical blog post
- include a dedicated section for static illustration prompts
- include prompts suitable for image generation workflows such as Imagen or nano-banana
- define what each image should teach, not just how it should look

### HTML artifact requirements

The HTML artifact must:

- implement the same article argument, not a different summary
- use README-like structure for readability
- use DESIGN.md-style visual rules for typography, spacing, color roles, borders, captions, and callouts
- use pretext-style text layout constraints for title length, lead density, caption compactness, and callout geometry
- use real `pretext` layout when animated or geometry-sensitive text is part of the page behavior
- be polished enough to function as the publishable blog page

### Non-final artifacts

The following may exist only as intermediate planning material:

- remotion scene notes
- figure briefs
- image planning notes
- scratch summaries
- technical reports

If created during reasoning, collapse them into the final two outputs instead of presenting them as separate deliverables.

## Read

Read only what is needed:

1. `references/WHYJ-SLIDES.html` — slides rendering template (Reveal.js + KaTeX + pretext)
2. `references/SLIDES-STYLE.md` — slides visual style guide
3. `references/e2e-v6.0-*.html` — E2E evaluation outputs (4 files, reference for slides/blog rendering quality)
4. Main `examples/` directory — full forge→render pipeline outputs:
   - `cli-revolution/` — CLI Revolution (slides DSL + blog DSL + slides HTML + blog HTML)
   - `deepseek-v4/` — DeepSeek-V4 (slides DSL + blog DSL + slides HTML + blog HTML)
   - `nano-cc/` — Nano Claude Code (slides DSL + blog DSL + slides HTML + blog HTML)
   - `opd/` — OPD On-Policy Distillation (slides DSL + blog DSL + slides HTML + blog HTML + 5 SVG figures)

## Trigger

Use this skill when the user asks for:

- a blog note
- a paper note
- a technical note
- a publishable technical article
- a Markdown and HTML blog package
- a report rewritten in a stronger engineering voice
- a systems or LLM article that should read like a saved engineering notebook

Trigger even if the user does not say `blog`.  
Nearby requests that should trigger this skill include:

- `整理成笔记`
- `按我的风格写`
- `按 WhyJ 风格写`
- `不要写成流水账`
- `写成博客笔记`
- `做成可发布的技术解读`

## Core Style

- Thesis first.
- Explanation by mechanism, not by praise.
- Dense, but not padded.
- Strong judgment is allowed, but it must be earned.
- Use short labels and concrete technical nouns.
- Keep each section logically O(1): one section, one hard point.
- End with an aggressive pulse, not a soft landing.
- End with what the reader should remember.

## Workflow

### 1. Find the one sentence that matters

Before writing, decide:

- what is actually new
- what the source pretends is important
- what is truly important in practice

If you cannot state the spine in one sentence, the note is not ready.

### 2. Throw away section-by-section summary

Do not mirror the source heading order unless the source structure is unusually good.

Rebuild around:

1. the real problem
2. the design move
3. the enabling system details
4. the tradeoffs
5. the engineering takeaway

### 3. Write as a note worth saving

Good note qualities:

- a clear point of view
- enough source detail to be trusted
- enough compression to be reread quickly
- no dead summary paragraphs

Bad note qualities:

- recap without judgment
- generic admiration
- soft claims like `very powerful` without mechanism
- social-media hooks
- warm-up paragraphs that delay the thesis

### 4. Add visuals only when they compress understanding

When visuals are needed:

- specify what the figure teaches
- keep labels short
- preserve technical semantics
- turn figure intent into static-image prompts inside the Markdown artifact
- use page style only after the figure logic is fixed

When source images have highly inconsistent aspect ratios:

- do not rely on CSS alone to force harmony
- classify the target figure slot first, for example `hero`, `wide`, `balanced`, `tight`, or `tall`
- if the source image ratio differs too much from the target slot, create a fill-or-extend image prompt instead of stretching the original
- require the prompt to preserve the technical structure while matching the target ratio
- state the target ratio explicitly inside the prompt

### 5. Finish with a real takeaway

The ending should tell the reader what changes in how they think about the system.

### 6. Ship only the two final artifacts

Before finishing, verify:

- the Markdown file contains the full blog text and image prompts
- the HTML file contains the same argument in a polished page form
- there is no third artifact presented as a required final result

## Output Format

Unless the user explicitly overrides it, produce:

1. `blog.md`
2. `blog.html`

Inside `blog.md`, produce:

1. title
2. opening thesis paragraph
3. 4-7 mechanism-driven sections
4. static illustration prompt section for Imagen or nano-banana
5. final `what to remember` section

Inside the static illustration prompt section, when aspect-ratio repair is needed, include:

1. source image reference
2. target slot type
3. target aspect ratio
4. whether the model should extend, recompose, or regenerate
5. the final prompt

Inside `blog.html`, produce:

1. the same title and thesis
2. the same core sections
3. polished static figures or figure slots
4. DESIGN.md-style visual hierarchy
5. pretext-style text density control

## Tool Fusion

When the task also includes presentation:

- use DESIGN.md-like language to define visual rules in prose
- use real `pretext` integration, not hand-wavy imitation, when the page depends on text geometry
- use image generation planning only after the figure spec is explicit
- keep remotion-style scene thinking as optional internal planning, not as a final required output

When `pretext` is required in HTML output:

- load it in the browser with a module import when appropriate
- use `prepareWithSegments(...)`
- then use `layoutWithLines(...)`
- use the resulting `lines` to drive text layout
- apply this at minimum to animated text fields
- prefer extending it to title, lead, and caption layout when those are part of the reading experience

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

1. Choose a profile from awesome-design-md or define a custom DESIGN.md
2. Use the token system (colors, typography, spacing, rounded) as CSS custom properties
3. Validate with `npx @google/design.md lint`
4. Map component tokens to HTML/CSS classes in the blog output

The design tokens must serve the technical argument, not override it.

### Reference

- Spec: `github.com/google-labs-code/design.md`
- Collection: `github.com/VoltAgent/awesome-design-md`
- CLI: `npx @google/design.md lint`

## Rules

- Do not sound neutral when the evidence supports a stronger conclusion.
- Do not oversell.
- Do not write social-media style hooks.
- Do not write X-thread style sections.
- Do not keep dead weight from the source.
- Do not let page style become more important than the technical argument.
- Do not return more than the two final artifacts unless the user explicitly asks for extras.
- Do not claim `pretext` usage unless the page is actually using `pretext` APIs.
- **All JS content strings in HTML output MUST use backtick template literals** — never `"..."` or `"..."` (Chinese curly quotes). JS only recognizes `"` (U+0022), `'` (U+0027), and `` ` `` (U+0060) as string delimiters. Curly quotes `""` cause `SyntaxError: Invalid or unexpected token` and white-screen rendering failure.
