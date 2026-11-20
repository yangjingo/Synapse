# Synapse

<div align="center">
  <img src="assets/logo.svg?v=2" alt="Synapse logic forge logo" width="144">

  **A logic forge for AI-native technical publishing.**

  [中文](README.zh-CN.md) · [Visual tour](docs/slides/index.html) · [Quickstart](docs/QUICKSTART.md)

  [![Release](https://img.shields.io/badge/release-v2.0.0-C45A20)](https://github.com/yangjingo/Synapse/releases/tag/v2.0.0)
  [![License: MIT](https://img.shields.io/badge/license-MIT-4A4338)](LICENSE.txt)
</div>

![Research notes, logs, and papers entering the Synapse logic forge and emerging as slides, an article, a diagram, and motion](docs/assets/readme/synapse-hero.png)

<div align="center"><sub>RAW EVIDENCE → LOGIC FORGE → ONE ARGUMENT SPINE → SLIDES · ARTICLE · DIAGRAM · MOTION</sub></div>

Synapse is a set of composable Codex Skills that turns URLs, files, and raw notes into traceable arguments and finished technical artifacts. Like the forge above, it compresses noisy inputs into one argument spine; that spine drives slides, engineering articles, diagrams, and motion—without leaving image prompts in the final output.

## Install

For a human-guided install:

```bash
npx --yes skills add https://github.com/yangjingo/Synapse \
  --agent codex --global --full-depth --copy
```

For an unattended agent install:

```bash
npx --yes skills add https://github.com/yangjingo/Synapse \
  --agent codex --global --full-depth --copy --skill "*" --yes
```

Restart Codex after installation. See the [Quickstart](docs/QUICKSTART.md) for verification and upgrade instructions.

## Use

```text
Use $synapse to turn these papers and notes into a Why.J-style slide deck
and engineering article. Keep every claim traceable and embed finished visuals.
```

For article-only work, choose [Technical Blog](skills/synapse-tech-blog/SKILL.md) or [WeChat](skills/synapse-wechat/SKILL.md). Paper, review, illustration, and publishing guidance is loaded by scenario.

| Skill | Job |
|---|---|
| `$synapse-tech-blog` | Technical articles, paper notes, reviews, and Notion/Bearblog handoff |
| `$synapse-wechat` | WeChat Official Account essays, reading notes, and technical adaptations |
| `$synapse-forge` | Sources → verified argument DSL |
| `$synapse-design` | Slide design profiles and templates |
| `$synapse-pretext` | Geometry-aware article rendering |
| `$synapse-excalidraw` | Editable technical diagrams |
| `$synapse-animation` | SVG, GIF, and Remotion motion |

## See the output

- [Visual introduction](docs/slides/index.html)
- [On-Policy Distillation](examples/opd/)
- [DeepSeek-V4](examples/deepseek-v4/)
- [CLI Revolution](examples/cli-revolution/)
- [Nano Claude Code](examples/nano-cc/)

## Develop

```bash
node scripts/refresh-skill-examples.js
node scripts/validate-slide-visuals.js
```

Contributor conventions are in [AGENTS.md](AGENTS.md).
