# Source Inventory

This file tracks the current visual corpus behind `infra-llm-blog-illustration`.

Use it as calibration context, not as the final output.

## Current Local Sources

### 1. Sebastian Raschka article images

Example note:

- `assets/examples/blogs/sebastian-raschka-llm-architecture-comparison.md`

Profile:

- editorial long-form systems blog
- modular comparison graphics
- light background
- explanatory charts and diagrams

Main value:

- good reference for article-level figure pacing and comparison visuals

### 2. GitCode DeepSeek-V4 figures

Example note:

- `assets/examples/blogs/infra-llm-blog-spec.md`

Profile:

- documentation-first engineering visuals
- many process diagrams, kernel visuals, swimlanes, and memory or operator schematics
- white background
- high technical specificity

Main value:

- good reference for hard-core mechanism explanation

### 3. vLLM DeepSeek-V4 blog images

Example note:

- `assets/examples/blogs/vllm-deepseek-v4.md`

Profile:

- cleaner modern engineering blog treatment
- more polished spacing and controlled branding
- restrained accents

Main value:

- good reference for balancing rigor with editorial cleanliness

## Shared Direction Across Sources

The common style traits are:

- flat visuals
- explicit structure
- low decoration
- systems-first explanation
- readable density

## Supplemental Design Profile Library

For product-level packaging and article-shell styling, this skill may reference the bridge file:

- `references/design-md-bridge.md`

Treat the bridge as a secondary style layer, not as a technical-source corpus.
Use it to shape typography, spacing, surface treatment, and page posture around the figures defined by this skill.

## How To Add Future Paper Sources

When new technical papers are analyzed, append them in this format:

### [Paper Or Article Name]

Reference:

- `[local folder path]`

Profile:

- source type
- dominant figure types
- visual traits

Main value:

- what this source contributes to the skill calibration

Do not expand the core `SKILL.md` with long source-specific notes.
Keep source accumulation here.
