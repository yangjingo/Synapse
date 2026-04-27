---
name: infra-llm-blog-illustration
description: Analyze, summarize, and specify figures for hard-core technical writing in infra, systems, LLM serving/training, kernels, compilers, memory systems, schedulers, and performance engineering. Use when extracting figure style from technical blogs or papers, building a reusable illustration spec, comparing diagram styles across sources, reviewing whether a figure is rigorous enough for a systems article, or generating prompts for dense engineering visuals.
---

# Infra + LLM Blog Illustration

Use this skill to turn source figures into a reusable technical illustration standard.

Treat figures as engineering artifacts, not decoration.

## Read

Read only what is needed:

1. `references/source-inventory.md`
2. `references/typography-and-color-systems.md` when the task needs stronger typography, color, or design-system output
3. `references/design-md-bridge.md` when the task needs a stronger productized UI language, a reusable DESIGN.md-style system, or a deliberate brand-adjacent visual direction
4. `references/animation-patterns.md` when the task needs motion, sequencing, or SVG draw-on behavior
5. `references/workflow-template.md` when the task is to produce a reusable working method
6. `assets/examples/blogs` and `assets/examples/images` when curated design references have been added
7. the source-specific image folders relevant to the request

Use the current local corpus as calibration:

- `assets/examples/blogs/sebastian-raschka-llm-architecture-comparison.md`
- `assets/examples/blogs/infra-llm-blog-spec.md`
- `assets/examples/blogs/vllm-deepseek-v4.md`

## Working Rules

- Optimize for rigor, not visual novelty.
- Describe repeated patterns, not one-off flourishes.
- Separate `visual style`, `information pattern`, and `editorial purpose`.
- Prefer conclusions that can be reused in future blogs or paper summaries.
- Keep source-specific notes in `references/source-inventory.md`, not in this file.
- Delegate typography, text-layout, and line-breaking decisions to the `pretext` skill when text geometry matters.
- Delegate palette and visual-system tokenization to `theme-factory` when the task needs a reusable color system.
- Delegate high-fidelity UI or web implementation to `frontend-design` when the output must ship as HTML/CSS/React.
- Delegate final raster illustration generation to `imagegen` when the task requires actual generated figure assets.
- Delegate code-driven motion graphics to `remotion-best-practices` when the figure should become an animation or video artifact.
- Borrow code-native component discipline from Tailwind Catalyst patterns when the figure system needs reusable panels, callouts, badges, or layout primitives.
- Treat `references/design-md-bridge.md` as the design-profile overlay. Use it for style direction; do not let it override the core requirement for technical rigor.
- Keep raw downloaded blog images outside the skill folder; only curated references, scripts, and reusable assets belong inside the skill.
- Keep curated examples inside `assets/examples/` and treat them as high-signal reference material.

## Skill Composition

Use this skill as the orchestrator for technical figure language.

Call other skills when the task crosses into their specialty:

- Use `pretext` for:
  - text measurement
  - title routing
  - multiline label layout
  - dense editorial typography
  - bubble, chip, or obstacle-aware text flow
- Use `theme-factory` for:
  - palette design
  - semantic color tokens
  - theme variants
  - reusable visual-system definition
- Use `frontend-design` for:
  - production-grade web rendering
  - HTML/CSS/React implementations of figures or article systems
  - responsive layout polish
  - code-native figure systems with reusable UI primitives when the output should live in a React/Tailwind codebase
- Use DESIGN.md-style profile references for:
  - choosing a higher-level product aesthetic for a blog page, article shell, or figure system
  - mapping a technical article to a familiar design posture such as `vercel`, `together.ai`, `stripe`, `notion`, or `claude`
  - generating a DESIGN.md-style brief before handing execution to `frontend-design`
- Use `imagegen` for:
  - final bitmap illustration generation
  - visual variants based on the figure spec
  - polished diagram-like hero graphics when the output should be a rendered image instead of code
  - Imagen-based image generation workflows
- Use `remotion-best-practices` for:
  - code-driven technical animations
  - SVG path drawing animations
  - explainer videos for architecture, flow, and sequencing
  - Remotion-based implementation details and rendering workflow
- Use `canvas-design` only when the task is a static visual composition rather than a systems figure or programmatic animation

Keep responsibilities clean:

- `infra-llm-blog-illustration` decides what the figure must communicate
- `pretext` decides how dense text should be laid out cleanly
- `theme-factory` decides how colors become a coherent token set
- `design-md-bridge.md` contributes product-level aesthetic references and DESIGN.md-style language
- `frontend-design` decides how the final web artifact is executed
- `imagegen` turns the figure spec into final generated image assets, preferably using Imagen when image generation is requested
- `remotion-best-practices` turns the figure spec into code-driven animation when motion is requested
- Tailwind Catalyst is a useful reference for spacing, hierarchy, and reusable component structure, but not the default visual aesthetic

## Workflow

### 1. Classify the source

Identify:

- source type: editorial blog, documentation set, technical paper, benchmark write-up, postmortem
- dominant figure types: architecture map, execution pipeline, swimlane, memory flow, operator breakdown, benchmark chart, trade-off table, before/after optimization

### 2. Extract stable visual traits

Summarize the repeated choices in:

- canvas
- color
- line and shape language
- typography
- density
- annotation style
- figure-to-caption relationship

Ignore isolated stylistic accidents.

### 3. Extract information patterns

Explain how the figures organize technical meaning:

- topology and ownership
- control flow
- data flow
- timing and overlap
- memory movement
- comparison and trade-off structure

### 4. Extract editorial purpose

State what the figures help the article or paper accomplish:

- introduce architecture
- explain a bottleneck
- justify an optimization
- show overlap or scheduling behavior
- compare alternatives
- make a benchmark conclusion legible

### 5. Produce reusable rules

Convert the observations into a spec that future figures can follow:

- supported figure categories
- visual language constraints
- label style
- caption style
- anti-patterns
- prompt template
- cross-skill handoff points for typography and color
- image-generation handoff points
- animation handoff points

### 6. Optional design-profile overlay

When the output is not just a figure but a full blog section, landing-style explainer, or reusable article UI system:

- read `references/design-md-bridge.md`
- choose one profile posture from `references/design-md-bridge.md`
- extract only transferable traits such as typography posture, spacing rhythm, surface treatment, accent logic, and CTA style
- keep figure semantics, labels, and system diagrams governed by this skill

The overlay may influence packaging, but not the correctness of the technical explanation.

## Default Figure Standard

Use this as the default target unless the source strongly argues otherwise.

### Visual posture

- flat
- explicit
- restrained
- systems-oriented
- dense but controlled

The figure should feel engineered, not branded or cinematic.

### Canvas

- Prefer white or very light neutral backgrounds.
- Keep backgrounds quiet.
- Use spacing and grouping instead of effects.
- Keep spacing behavior consistent across a multi-figure system when the visuals are implemented in code.

### Color

- Use a small semantic palette.
- Use color to encode roles, paths, or states.
- Keep primary text near-black and secondary text gray.
- Prefer blue or teal as the primary accent.
- Prefer orange, amber, or muted red as the secondary accent.
- Use green only when a positive or resolved state needs emphasis.

Avoid:

- rainbow coding
- neon gradients
- glowing highlights
- decorative shadows

When the palette needs to become reusable across many figures, convert it into a tokenized system with `theme-factory` or a `DESIGN.md`-style spec.

### Shapes and lines

- Use blocks, containers, arrows, braces, lanes, and callouts.
- Keep corners slightly rounded.
- Use thin to medium strokes.
- Make hierarchy and direction explicit.
- Reuse a small set of container and callout patterns across an article system instead of inventing new shells for every figure.

### Typography

- Use short, concrete labels.
- Prefer 2-6 words per block.
- Keep labels technical and operational.
- Keep display text compact and body annotations subordinate.
- Use `pretext` when label density, multiline wrapping, or title routing affects the figure quality.

Good labels:

- `KV Cache`
- `Expert Routing`
- `Prefill`
- `Decode`
- `HBM Staging`
- `All-Gather`

Bad labels:

- sentence-length box text
- slogan-like headings
- vague names such as `Optimization Module`

For text-heavy visuals, prefer:

- strong hierarchy
- measured line length
- deliberate multiline wrapping
- fewer font styles, more spacing discipline

## Animation Rule

Use motion only when it improves explanation.

Good reasons to animate:

- reveal execution order
- show data movement
- show dependency or synchronization
- compare before and after an optimization
- trace how a request, tensor, or signal moves through the system

Bad reasons to animate:

- decoration
- generic floating motion
- looping effects that do not teach anything
- cinematic transitions that obscure structure

Prefer:

- staged reveals
- path tracing
- lane-by-lane sequencing
- before/after overlays
- callout emphasis on the active subsystem

Avoid:

- excessive camera motion
- flashy easing
- background particles
- non-semantic motion flourishes

## Figure Type Rules

### Architecture map

Use to show:

- major components
- ownership boundaries
- primary data or control paths

Require:

- subsystem grouping
- explicit arrows
- minimal but meaningful annotations

### Execution pipeline

Use to show:

- stage order
- request lifecycle
- compile-to-execute flow

Require:

- clean progression
- clear transitions
- visible synchronization or handoff points

### Swimlane or timeline

Use to show:

- multi-device or multi-actor flow
- overlap
- scheduler behavior
- communication vs compute

Require:

- distinct lanes
- temporal alignment
- obvious barriers or handoffs

### Memory or communication flow

Use to show:

- cache behavior
- locality changes
- sharding
- dispatch, scatter, reduce, all-gather

Require:

- directional flow
- boundary crossing
- replicated vs sharded state

### Kernel or operator breakdown

Use to show:

- fused kernels
- tiling strategies
- hardware-aware decomposition

Require:

- only the mechanism needed for the argument
- aggressive simplification

Animation fit:

- use sequential highlighting or path tracing to show operator stages
- use motion to explain where overlap or fusion happens

### Benchmark chart

Use to show:

- latency
- throughput
- memory
- scaling

Require:

- a clear metric
- a clean comparison
- an obvious takeaway

Animation fit:

- reveal lines or bars progressively only if the order supports the conclusion
- avoid animated charts when a static comparison is clearer

### Trade-off table

Use to show:

- architecture or implementation choices

Require:

- options
- strengths
- costs
- fit conditions

Animation fit:

- usually static
- animate only for staged comparison in a video context

## Caption Rule

Write captions that do two things:

1. State what the figure shows.
2. State what the reader should notice.

Example:

- `Prefill and decode follow different communication patterns; the optimization removes unnecessary cross-device synchronization on the decode path.`

## Anti-Patterns

Reject or rewrite figures that rely on:

- 3D chips or glowing hardware art
- hero-graphic aesthetics
- decorative gradients
- oversized icons in place of system structure
- excessive text inside every box
- fake dashboard UI used as explanation
- visual symmetry that hides real system asymmetry

## Output

When summarizing a source, use this order:

### Source Summary

- what the source is
- what kind of technical writing it represents

### Figure Inventory

- the major figure categories in the source

### Style Traits

- canvas
- color
- shapes and lines
- typography
- density
- annotation strategy

### Information Patterns

- how the figures organize technical meaning

### Editorial Purpose

- what the figures help the article or paper accomplish

### Reusable Rules

- the rules worth carrying forward

### Skill Handoffs

- when to use `pretext`
- when to use `theme-factory`
- when to use `frontend-design`
- when to use `imagegen`
- when to use `remotion-best-practices`

When using `frontend-design`, prefer:

- reusable primitives
- spacing discipline
- stable container hierarchy
- minimal chrome
- no generic dashboard drift

### Avoid

- what should not be copied

### Prompt Template

- a reusable prompt or instruction block for future figure generation

## Prompt Template

Use this when a direct generation prompt is needed:

`Create a dense, clean engineering figure for a hard-core technical article. Use a white or very light neutral background, restrained blue/teal and orange accents, compact rounded rectangles, thin arrows, precise labels, and explicit subsystem boundaries. Explain [TOPIC] as a [FIGURE TYPE], making data flow, control flow, timing, or trade-offs immediately legible. Keep it flat, technical, and editorial. Avoid marketing aesthetics, 3D hardware art, decorative gradients, rainbow color coding, oversized icons, and vague labels.`

## Imagen Generation Rule

When the user asks to generate the actual illustration, do not stop at style analysis.

Do this:

1. Use this skill to define the figure intent, figure type, layout, labels, color posture, and anti-patterns.
2. Hand off the final image prompt to `imagegen`.
3. Prefer Imagen-based generation for the final raster illustration when available.

Before handing off, convert the figure spec into an image prompt that includes:

- the technical topic
- the figure class
- the reading order
- the visual constraints
- the label style
- what to avoid

If the source figure ratio does not fit the target article slot:

- name the target slot type first
- specify the target aspect ratio explicitly
- decide whether the model should extend, recompose, or regenerate
- preserve the original technical meaning rather than stretching the source bitmap

Do not ask the image model to invent the technical structure.
Define the structure first in this skill, then generate.

## Animation Generation Rule

When the user asks for animated technical figures, do not treat that as a styling request only.

Do this:

1. Define the figure purpose, layout, reading order, and semantic motion.
2. Decide whether the output should be:
   - static figure
   - generated image
   - code-driven animation
3. If animation is requested, hand off implementation to `remotion-best-practices`.

Use Remotion by default for code-driven animation when:

- the animation should be built with React
- the motion is based on SVG shapes, path drawing, staged reveals, or timeline sequencing
- the final output is video or reusable motion code

Use a Manim-style approach conceptually when:

- the animation depends on mathematically precise geometric construction
- the figure is driven by vector drawing order
- the explanation benefits from line-by-line proof-like reveal

Even in those cases, keep this skill responsible for:

- the explanatory structure
- the motion semantics
- the sequence of reveals
- what each animated phase teaches

Do not add motion until the static figure logic is already coherent.

## Typography And Color Escalation

Escalate to other skills when the request asks for more than figure taxonomy:

- If the user wants better font systems, line routing, text compaction, or editorial title layout, use `pretext`.
- If the user wants better color systems, richer palettes, or reusable tokens across many figures, use `theme-factory`.
- If the user wants an implemented article system or web artifact, use `frontend-design`.
- If the user wants the final illustration asset itself, use `imagegen` and prefer Imagen-based generation.
- If the user wants code-driven animated diagrams or explainer videos, use `remotion-best-practices`.

When these skills are used together, keep this order:

1. `infra-llm-blog-illustration`: define figure purpose and information structure
2. `pretext`: refine typography and line layout
3. `theme-factory`: define palette and semantic color tokens
4. `frontend-design`: implement the visual system in code if needed
5. `imagegen`: generate the final illustration asset with Imagen when image output is requested
6. `remotion-best-practices`: implement motion when animated output is requested

## Maintain

Append future paper or article sources to `references/source-inventory.md` using the same summary format.
Append future typography and color-system references to `references/typography-and-color-systems.md`.
Append future motion references to `references/animation-patterns.md`.
Store user-approved blog design references in:

- `assets/examples/blogs`
- `assets/examples/images`

When adding a new example, record both:

- writing traits: hierarchy, density, rhythm, title treatment, caption behavior
- figure traits: layout, palette, typography, diagram language, chart style

## Scripts

Use bundled scripts when the user needs a starter artifact instead of prose only:

- `scripts/make-svg-scaffold.mjs`
  Generate a starter SVG from a small JSON spec with palette tokens and positioned blocks.
- `scripts/emit-color-tokens.mjs`
  Convert a palette JSON file into CSS custom properties for SVG, HTML, or Remotion usage.

Prefer these scripts over hand-writing repetitive SVG shells or token blocks.
