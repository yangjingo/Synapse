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
Use $synapse-talk-slides to turn these papers and notes into a Why.J-style deck. Keep every claim traceable and embed finished visuals.
```

| Skill | Job |
|---|---|
| [`$synapse-life-note`](skills/synapse-life-note/SKILL.md) | Write personal reflections and prepare Xiaohongshu or WeChat versions. |
| [`$synapse-tech-blog`](skills/synapse-tech-blog/SKILL.md) | Write verifiable engineering analyses for Notion and Bearblog. |
| [`$synapse-talk-slides`](skills/synapse-talk-slides/SKILL.md) | Explain technical topics or present a point of view with a slide deck. Includes Pretext and motion workflows. |

For a deck and an article on the same topic, run Talk Slides and Tech Blog with the same evidence and source links.

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
