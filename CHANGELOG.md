# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **External Dependencies**: Complex tooling (pretext, theme-factory, frontend-design, imagegen, remotion) marked as `<!-- TODO: CLI tool -->` for future CLI extraction.

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
