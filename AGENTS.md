# Repository Guidelines

## Project Structure & Module Organization

Each authoring category owns one entry point under `skills/`. Life Note covers reflection and social publishing formats. Tech Blog owns articles, source extraction, and editable technical diagrams. Talk Slides owns decks, Pretext, and motion. Keep optional workflow instructions and supporting files inside their owning skill. End-to-end sample outputs belong in `examples/<topic>/`; keep a topic's `*-blog.dsl.md`, `*-blog.html`, `*-slides.dsl.md`, `*-slides.html`, and `figures/` together. Shared documentation and branding live in `docs/` and `assets/`.

## Build, Test, and Development Commands

There is no package manifest or compiled build. Work directly with the Markdown, HTML, JavaScript, and Python sources.

- `npx prettier --write path/to/file.html` formats generated HTML.
- `python skills/synapse-tech-blog/workflows/forge/scripts/struct_validator.py examples/<topic>` checks slide ordering and required structural sections.
- `python skills/synapse-tech-blog/workflows/forge/scripts/content_validator.py examples/<topic>` checks cover, outline, takeaway, reference, and visual-content rules.
- `node skills/synapse-tech-blog/workflows/forge/scripts/url_validator.js --urls examples/<topic>` verifies external links; this requires network access.
- `node skills/synapse-tech-blog/workflows/excalidraw/scripts/validate.js --strict path/to/file.excalidraw` detects diagram collisions and arrow crossings.

Open generated HTML in a browser to confirm typography, overflow, images, and slide navigation.

## Coding Style & Naming Conventions

Follow the surrounding file: JavaScript uses two-space indentation, semicolons, single quotes, and `camelCase`; Python uses four spaces, `snake_case`, type hints where useful, and standard-library imports first. Keep Markdown headings short and imperative. Use lowercase kebab-case for topic directories and artifact stems, such as `deepseek-v4/deepseek-v4-slides.html`. Name figures sequentially (`figure-01-cost-curve.svg`) and keep editable `.excalidraw` sources beside exports.

## Testing Guidelines

No centralized test runner or coverage threshold exists. Run the relevant validators for every changed artifact and manually inspect rendered output. When changing a validator, exercise both a known-good example and a deliberately invalid temporary fixture. Avoid committing browser screenshots or generated debug output unless they are intentional example assets.

## Commit & Pull Request Guidelines

History follows Conventional Commit prefixes, chiefly `feat:`, `docs:`, and `chore:`. Write a concise imperative subject describing one logical change. Pull requests should summarize affected skills/examples, list validation commands run, link relevant issues or source material, and include before/after screenshots for visual changes. Do not mix unrelated regenerated artifacts into the same PR.
