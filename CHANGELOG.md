# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-02

### Added
- **4 complete examples** with full forge→render pipeline output (DSL + HTML + figures):
  - `examples/cli-revolution/` — CLI 革命 (slides + blog + 2 Excalidraw SVGs)
  - `examples/deepseek-v4/` — DeepSeek-V4 分析 (slides + blog + 2 Excalidraw SVGs)
  - `examples/nano-cc/` — Nano Claude Code (slides + blog + 2 Excalidraw SVGs)
  - `examples/opd/` — On-Policy Distillation (slides + blog + 5 Excalidraw SVGs)
- **synapse-excalidraw diagram pipeline**: Morandi palette system with 4 preset sets (classic/warm/cool/forest), `layout.js` programmatic API (`place`/`below`/`rightOf`/`arrowBetween`/`annotate`), `exc-to-svg.js` pure Node.js converter, collision detection via `validate()`, and library template support (`data-viz.excalidrawlib`, `stick-figures.excalidrawlib`).
- **Blog-Slides Figure Sync rule**: Excalidraw SVG figures must be synced across blog DSL/HTML and slides DSL/HTML simultaneously. Enforced in `synapse-excalidraw/SKILL.md` Phase 3.
- **Excalidraw Phase 0 mandatory design discussion**: ASCII preview mockups via `AskUserQuestion` before any code generation. Prevents wasted effort on rejected diagrams.
- **FORGE.DSL.md**: Unified DSL syntax specification for slides and blog.
- **dsv4-blog-layout.html template**: Self-contained blog HTML with inlined Pretext text layout engine (~2000 lines), `fitTitle()` binary search, figure zoom overlay.

### Changed
- **Skill count reduced from 7 to 5**: Removed `synapse-figure` and `synapse-viz`. Their responsibilities absorbed by `synapse-excalidraw` and `synapse-design`.
- **Reference migration**: Root `references/` (WHYJ-SLIDES.html, SLIDES-STYLE.md, WHYJ-SLIDES-DSL.md) migrated to corresponding sub-skill directories. Root `evals/` migrated to `skills/synapse-excalidraw/evals/`.
- **SKILL.md updates**: All 5 sub-skill SKILL.md files updated with new reference paths, backtick template literal rules for blog HTML, and Blog-Slides Figure Sync protocol.
- **Documentation rewrite**: `README.md`, `docs/PROJECT-INTRO-CN.md`, root `SKILL.md` updated to reflect current skill inventory, directory structure, and pipeline.
- **Slides DSL figure sync**: CLI/DSV4/Nano-CC slides DSL updated from `::visual` text prompts to `::image` SVG references. Slides HTML updated with `<img>` tags.

### Removed
- `skills/synapse-figure/` — absorbed by `synapse-excalidraw`
- `skills/synapse-viz/` — no longer needed
- `references/` (root) — migrated to `skills/synapse-design/references/`
- `evals/` (root) — migrated to `skills/synapse-excalidraw/evals/`
- `examples/cli-demo-slides/`, `examples/deepseek-v4-blog/`, `examples/nano-cc-slides/` — replaced by new example directories
- `examples/opd-slides.html`, `examples/opd-slides.md`, `examples/demo.html` — consolidated into `examples/opd/`
- `tmp/opd-materials/` — migrated to `examples/opd/`
- Duplicate files in `skills/synapse-forge/examples/`, `skills/synapse-design/examples/`, `skills/synapse-pretext/examples/`
- Old excalidraw library files with typo directory name (`exclidrawlib/`)

## [0.3.0] - 2026-04-29

### Added
- **synapse-forge skill**: New raw material ingestion and refinement skill (熔炉).
  - Accepts local files (`.md`, `.txt`, `.pdf`, `.html`, `.ipynb`) and URLs as input.
  - Three-stage pipeline: Fetch & Parse → Extract & Annotate → Structure & Refine.
  - Produces structured `forge-output.md` with Key Excerpts, Data Points, Figure Inventory.
  - Downloads and references key images/screenshots from URL sources.
  - Feeds directly into all downstream skills (slides, blog, figure, gif).
- **synapse-animation skill**: Merged Remotion animation and Slack GIF toolkit into a unified dual-mode skill.
  - GIF Mode: composable animation primitives (shake, bounce, pulse, kaleidoscope, etc.) with Slack/Discord validators.
  - Remotion Mode: code-driven technical animations with staged reveals, path tracing, sequencing.
  - Figure-to-GIF pipeline: mapping table from figure types to animation patterns, color/SVG handoff.
- **MiniMax plugin integration**: Added alternative toolchain references in `synapse-animation` for `gif-sticker-maker`, `vision-analysis`, `minimax-multimodal-toolkit`, and `shader-dev`.

### Changed
- **Root skill naming**: Root `SKILL.md` renamed from `synapse-forge` to `synapse`. The `synapse-forge` name now refers to the new material ingestion skill.
- **Skill consolidation**: Removed redundant `tech-blog/` directory. All skills now live exclusively under `skills/`.
- **Reference consolidation**: Moved `BLOG-STYLE.md`, `BLOG-STYLE-CN.md` to `skills/synapse-design/references/`; moved `FIGURE-STYLE.md` to `skills/synapse-figure/references/`. Root `references/` now contains only slides-specific protocols.
- **Cross-skill reference cleanup**: Replaced all stale skill names across all SKILL.md files:
  - `theme-factory` → `synapse-design`
  - `frontend-design` → `synapse-design`
  - `imagegen` → `synapse-figure`
  - `canvas-design` → `synapse-figure`
  - `pretext` (as skill name) → `synapse-pretext`
  - `synapse-remotion` → `synapse-animation`
  - `synapse-blog`/`synapse-fig` → `synapse-design`/`synapse-figure`
  - `synapse-forge` (in sub-skill context) → Synapse root
- **Documentation refresh**: Updated `README.md`, `CHANGELOG.md`, and `docs/PROJECT-INTRO-CN.md` to reflect current skill inventory and cross-skill relationships.
- **Figure↔GIF integration**: Bidirectional pipeline between `synapse-figure` and `synapse-animation` with concrete handoff patterns (color tokens, SVG scaffolds, figure-type-to-animation mapping).

### Removed
- `tech-blog/` directory (32 files, fully consolidated into `skills/`).
- `references/BLOG-STYLE.md`, `references/BLOG-STYLE-CN.md`, `references/FIGURE-STYLE.md` (moved to sub-skill directories).

## [0.2.0] - 2026-04-27

### Added
- **Synapse Skill System (v6.0)**: Unified 6-skill architecture replacing the single `synapse-logic-forge`.
  - `synapse-forge`: Master orchestrator (root SKILL.md).
  - `synapse-design`: WhyJ-style blog production (source → blog.md + blog.html).
  - `synapse-figure`: Technical illustration orchestration for infra/LLM blogs.
  - `synapse-viz`: PyTorch model structure visualization via torchvista.
  - `synapse-pretext`: Pretext text layout integration.
  - `synapse-remotion`: Remotion animation integration.
- **Skills Directory**: Consolidated all sub-skill source material (references, assets, scripts, evals) into `skills/` subdirectories.
- **Trigger Sections**: All skills now have explicit trigger phrases (English + Chinese).
- **SEO Meta Module**: Planned for synapse-design HTML output (title, description, Article schema).

### Changed
- **Naming**: Shortened from `synapse-logic-forge` to `synapse-forge`. All sub-skills follow `synapse-{noun}` pattern.
- **Directory Reorganization**: Moved `tech-blog/skills/*/` source material into `skills/synapse-{name}/` directories. Each sub-skill is now self-contained.
- **Version Alignment**: Root `SKILL.md` and all sub-skill SKILL.md files are now consistent at v6.0.
- **Syntax Unification**: `@pulse:` DSL syntax, flexible page count, WHYJ-SLIDES.html as master template — consistent across all files.

### Removed
- `.claude/skills/synapse-logic-forge.md` (replaced by root SKILL.md).
- `.claude/skills/synapse-forge.md`, `synapse-blog.md`, `synapse-fig.md`, `synapse-viz.md` (flat files replaced by `skills/` subdirectories).

## [0.1.0] - 2026-03-30

### Added
- **Why.J Theater DSL**: A high-density markdown-based slide protocol (`@pulse`, `::visual`, `==marker==`).
- **Nano Banano Protocol**: Logic Sketch Protocol for minimalist hand-drawn diagrams with invisible watermarks (`FIGURE-STYLE.md`).
- **Synapse Logic Forge (v5.1)**: Re-engineered Claude Skill focused on "Engineering Theater" and high-density technical blogs.
- **Taste Judger Tool**: A dual-mode (HTML/MD) auditor to enforce O(1) complexity and "Push-Left" visual integrity.
- **Structural Integrity**: Mandatory 00-06 slide sequence (Cover, Context, Agenda, Mechanism, Takeaways).
- **Absolute Push-Left**: Non-negotiable visual alignment for all engineering content.

### Changed
- **Rebranding**: Project pivoted from a general research blog assistant to the "Why.J Engineering" content architect.
- **README.md**: Completely rewritten to reflect the "Logic Forge" mission and simplified O(1) directory structure.
- **SLIDES-STYLE.md**: Updated to the latest HTML/Reveal.js engine with forced left-alignment and physical watermarking.

### Removed
- **Social Media Fluff**: Deprecated templates and instructions for X (Twitter) threads and Xiaoshu (Red) posts.
- **Legacy Style Guides**: Removed redundant reference files (STYLE_GUIDES.md, TEMPLATES.md, CHECKLIST.md) to maintain repository O(1) load.
- **Old Script Assets**: Cleaned up assets/templates to align with the distilled engineering focus.

---
**Why.J Engineering** — *Distilling noise into logic since 2026.*
