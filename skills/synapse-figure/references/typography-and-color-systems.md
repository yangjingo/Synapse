# Typography And Color Systems

Use this reference when `infra-llm-blog-illustration` needs stronger typography or a better color system.

## Pretext

Primary idea:

- Pretext is a pure JavaScript/TypeScript multiline text measurement and layout library.

Why it matters here:

- hard-core technical figures often fail because labels wrap badly
- dense captions, title routing, obstacle-aware text, and multiline labels need layout control
- Pretext helps when text geometry is part of the figure quality, not just decoration

What to borrow conceptually:

- measure before rendering
- treat line breaks as a design decision
- allow tight, editorial multiline compositions
- support obstacle-aware and width-tight text layouts

Relevant sources:

- Pretext GitHub: pure JS/TS multiline text measurement and layout
  Source: https://github.com/chenglou/pretext
- Pretext Demos: title routing, bubbles, editorial flow, rich text, masonry
  Source: https://chenglou.me/pretext/
- Pretext.js Blog: text layout, browser internals, React usage, rich text, chat sizing
  Source: https://pretextjs.dev/blog

Useful trigger for `pretext` skill:

- the figure has dense multiline labels
- the title must route around shapes or columns
- the article wants strong typographic hierarchy without DOM guesswork

## DESIGN.md

Primary idea:

- DESIGN.md is a format for describing visual identity to coding agents with tokens plus rationale.

Why it matters here:

- technical figure systems need stable color and typography rules
- tokenized color and type decisions are easier to reuse across many blog posts
- rationale matters because the agent needs to know not just the token values, but why they exist

What to borrow conceptually:

- define tokens and prose together
- treat colors and typography as a persistent system
- make semantic tokens explicit
- validate contrast and structural consistency

Relevant sources:

- Google Labs design.md repo
  Key point: a DESIGN.md file combines machine-readable design tokens with human-readable rationale
  Source: https://github.com/google-labs-code/design.md/tree/main
- Awesome DESIGN.md
  Key point: use upstream profile examples as method references, not as required local dependencies
  Source: https://github.com/VoltAgent/awesome-design-md
- Stitch docs overview
  Source: https://stitch.withgoogle.com/docs/design-md/overview

Useful trigger for `theme-factory` or future DESIGN.md output:

- the user wants a reusable palette across many technical figures
- the user wants consistent type hierarchy across a whole blog series
- the task benefits from semantic tokens instead of ad hoc color picking

## Tailwind Catalyst / UI Kit

Primary idea:

- Tailwind's Catalyst UI kit is a code-native component system designed to be copied into your codebase and customized directly.

Why it matters here:

- technical illustration systems benefit from component discipline
- spacing, hierarchy, container design, and API consistency matter as much as raw colors
- a good figure system should feel like a coherent set of reusable components, not isolated one-off diagrams

What to borrow conceptually:

- every pixel designed with intent
- production-ready component structure
- code-first customization instead of abstract design tooling
- a starter kit mindset for building your own visual system

What to avoid copying blindly:

- generic SaaS dashboard aesthetics
- overly productized UI chrome in places where a technical figure should stay diagrammatic
- treating system diagrams like app screens

Relevant source:

- Tailwind CSS Plus UI Kit / Catalyst
  Key points:
  - built with React, Headless UI, Tailwind CSS
  - intended as a foundation for your own component system
  - components are copied into the codebase and customized directly
  - emphasizes intentional pixels, maintainability, accessibility, and code ownership
  Source: https://tailwindcss.com/plus/ui-kit?ref=sidebar

Useful trigger for `frontend-design`:

- the output should become a reusable article component library
- the technical figures need card, panel, callout, badge, or layout primitives
- the visual system needs to live in React/Tailwind rather than only in prompts

## Recommended Collaboration Pattern

Use these systems in this order:

1. `infra-llm-blog-illustration`
   Define figure purpose, figure class, and information hierarchy.
2. `pretext`
   Refine label layout, multiline wrapping, title routing, and dense editorial typography.
3. `theme-factory`
   Turn accents into a coherent tokenized palette.
4. `frontend-design`
   Implement the system in HTML/CSS/React when needed.
5. `remotion-best-practices`
   Implement code-driven animation when the output is motion rather than a static image.

## Practical Rules

- Do not choose colors before the figure roles are clear.
- Do not choose fonts before the text density and hierarchy are clear.
- Use typography to reduce cognitive load, not to decorate.
- Use color to separate semantics, not to increase excitement.
- Use component discipline and spacing discipline when the figure system is implemented in code.

## Remotion

Primary idea:

- Remotion is a code-first video and motion-graphics framework, and Remotion maintains official agent skills for AI coding agents.

Why it matters here:

- technical figure animation should be scripted, inspectable, and semantically controlled
- staged reveals, path tracing, SVG stroke drawing, and sequence-based explainer motion fit Remotion well
- the motion layer should stay subordinate to the explanatory structure defined by this skill

Relevant source:

- Remotion Agent Skills docs
  Key points:
  - Remotion maintains a list of Agent Skills for best practices in Remotion projects
  - These skills are useful for AI agents like Claude Code, Codex, or Cursor
  - Install command: `npx skills add remotion-dev/skills`
  - Last updated: April 22, 2026
  Source: https://www.remotion.dev/docs/ai/skills

Useful trigger for `remotion-best-practices`:

- the user wants animated technical figures
- the user wants video or motion-graphics output
- the figure needs SVG path drawing, staged reveal, or timeline-based explanation
