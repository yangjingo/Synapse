# Synapse

<div align="center">
  <img src="assets/logo.svg?v=2" alt="Synapse 逻辑锻造炉图标" width="144">

  **面向 AI 原生技术出版的逻辑锻造炉。**

  [English](README.md) · [三个 Skill 的介绍演示](docs/slides/synapse-skills-slides.html) · [快速开始](docs/QUICKSTART.md)

  [![Skill 版本](https://img.shields.io/badge/skills-v3.0.0-C45A20)](CHANGELOG.md#300---2026-11-28)
</div>

![研究笔记、日志与论文进入 Synapse 逻辑锻造炉，最终产出 Slides、文章、图表和动画](docs/assets/readme/synapse-hero.png)

<div align="center"><sub>原始证据 → 逻辑锻造 → 单一论证主干 → SLIDES · 文章 · 图表</sub></div>

Synapse 是一组可组合的 Codex Skills：像上图的锻造炉一样，把 URL、文件与原始笔记压缩成可追溯的单一论证主干，再从同一份 DSL 生成 Slides、技术文章和可编辑图表。最终交付嵌入真实视觉素材，不把图片 Prompt 当成成品。

## 安装

Human 交互式安装：

```bash
npx --yes skills add https://github.com/yangjingo/Synapse \
  --agent codex --global --full-depth --copy
```

Agent 无交互安装：

```bash
npx --yes skills add https://github.com/yangjingo/Synapse \
  --agent codex --global --full-depth --copy --skill "*" --yes
```

安装后重启 Codex。验证与升级方式见 [QUICKSTART](docs/QUICKSTART.md)。

## 使用

```text
使用 $synapse-talk-slides，把这些论文和笔记整理成一套 Why.J 风格的讲解幻灯片。
保留论点来源，并在最终页面嵌入真实图片。
```

| Skill | 职责 |
|---|---|
| [`$synapse-life-note`](skills/synapse-life-note/SKILL.md) | 写感想随笔、读书体会和成长记录，可适配小红书和微信公众号。 |
| [`$synapse-tech-blog`](skills/synapse-tech-blog/SKILL.md) | 写可验证、可复用的技术博客、论文解读与工程复盘，支持 Markdown、技术插图和离线 HTML。 |
| [`$synapse-talk-slides`](skills/synapse-talk-slides/SKILL.md) | 做技术讲解、观点表达、教学和汇报的 Slides，提供 Why.J Theater HTML 模板。 |

同一主题需要文章和 Slides 时，两份作品共用主张、数字与来源，各自按阅读和演讲的节奏展开。

## 看实际产出

- [三个 Skill 的介绍演示](docs/slides/synapse-skills-slides.html)
- [On-Policy Distillation](examples/opd/)
- [DeepSeek-V4](examples/deepseek-v4/)
- [CLI Revolution](examples/cli-revolution/)
- [Nano Claude Code](examples/nano-cc/)

贡献规范见 [AGENTS.md](AGENTS.md)。
