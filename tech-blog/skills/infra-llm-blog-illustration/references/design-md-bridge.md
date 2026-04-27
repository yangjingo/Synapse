# DESIGN.md Bridge

This file bridges `infra-llm-blog-illustration` with a reusable DESIGN.md-style profile layer.

Use it when a task needs both:

- systems-grade technical clarity
- a stronger product or editorial visual posture

Do not use it when the task is only about extracting technical figure rules from source blogs or papers.

## Integration Model

Keep the responsibilities separate:

- `infra-llm-blog-illustration` owns information architecture, diagram rigor, figure taxonomy, annotation rules, and editorial purpose
- the DESIGN.md-style profile layer contributes transferable visual posture such as typography mood, surface behavior, contrast model, spacing rhythm, and accent philosophy

The design profile is an overlay, not the source of truth.

## What To Borrow

Safe to borrow:

- canvas mood
- spacing density
- type hierarchy
- monochrome vs accent-heavy posture
- button and panel styling for article UI shells
- section separators
- callout box treatment
- caption shell styling

Do not borrow blindly:

- brand logos
- trademarked identity language
- product-specific iconography
- marketing claims
- decorative patterns that reduce figure legibility

## Recommended Profile Mapping

Choose a profile based on the article goal.

### `together.ai`

Use for:

- infra platform explainers
- distributed systems architecture
- cluster, topology, and pipeline visuals
- blueprint-like technical pages

Borrow:

- technical, open-infra posture
- sharper section framing
- blueprint-like contrast and structure

Avoid:

- turning the page into a decorative sci-fi dashboard

### `vercel`

Use for:

- precise productized engineering blogs
- clean launch-style explainers
- black, white, and restrained accent systems

Borrow:

- typography discipline
- monochrome precision
- clean CTA and panel styling

Avoid:

- over-minimalizing diagrams until information density suffers

### `stripe`

Use for:

- polished educational explainers
- API or workflow walkthroughs
- figures that need a more refined, layered presentation

Borrow:

- elegant hierarchy
- refined spacing
- controlled accent gradients only at shell level

Avoid:

- decorative gradients inside system diagrams

### `notion`

Use for:

- reading-heavy technical essays
- note-like long-form explainers
- article systems with many captions, side notes, and structured callouts

Borrow:

- editorial calm
- soft surfaces
- reading-first content pacing

Avoid:

- making mechanism diagrams feel casual or underspecified

### `claude`

Use for:

- calm editorial product surfaces
- article shells that need warmth without visual noise
- human-readable explainers with strong prose support

Borrow:

- warm-neutral canvas treatment
- gentle section hierarchy
- restrained accent usage

Avoid:

- letting warmth soften engineering precision

## Default Selection Rule

If the user does not specify a profile:

- pick `together.ai` for infra-heavy architecture explainers
- pick `vercel` for productized engineering pages
- pick `notion` for reading-heavy technical essays

## Output Pattern

When a design-profile overlay is used, produce the result in this order:

1. technical figure rules
2. chosen design profile
3. transferable traits to borrow
4. anti-patterns to avoid
5. final prompt or implementation brief

## Suggested Prompt Clause

Append a clause like this to downstream prompts:

`Use the technical rigor and diagram semantics from infra-llm-blog-illustration, with a packaging layer inspired by a DESIGN.md-style [profile] posture. Borrow typography rhythm, spacing, and shell treatment, but keep diagrams explicit, flat, and systems-first.`
