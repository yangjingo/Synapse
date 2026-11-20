# Synapse

<div align="center">
  <img src="assets/logo.svg?v=2" alt="Synapse 逻辑锻造炉图标" width="144">

  **面向 AI 原生技术出版的逻辑锻造炉。**

  [English](README.md) · [视觉介绍](docs/slides/index.html) · [快速开始](docs/QUICKSTART.md)
</div>

![研究笔记、日志与论文进入 Synapse 逻辑锻造炉，最终产出 Slides、文章、图表和动画](docs/assets/readme/synapse-hero.png)

<div align="center"><sub>原始证据 → 逻辑锻造 → 单一论证主干 → SLIDES · 文章 · 图表 · 动画</sub></div>

Synapse 是一组可组合的 Codex Skills：像上图的锻造炉一样，把 URL、文件与原始笔记压缩成可追溯的单一论证主干，再从同一份 DSL 生成 Slides、技术文章、可编辑图表与动画。最终交付嵌入真实视觉素材，不把图片 Prompt 当成成品。

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
使用 $synapse，把这些论文和笔记做成 Why.J 风格的 Slides 与技术文章。
保留论点来源，并在最终页面嵌入真实图片。
```

| Skill | 职责 |
|---|---|
| [`$synapse-life-note`](skills/synapse-life-note/SKILL.md) | 写感触随笔，记录经历、读书体会和个人判断的变化。 |
| [`$synapse-tech-blog`](skills/synapse-tech-blog/SKILL.md) | 写技术博客、论文解读和工程复盘，用可验证、可复用的判断建立技术影响力。 |
| [`$synapse-slides`](skills/synapse-slides/SKILL.md) | 制作技术分享、论文汇报、教学和项目汇报等 Slides，含 Pretext 文字排版。 |
| [`$synapse`](skills/synapse/SKILL.md) | 协调 Slides、技术博客等组合交付，按需使用资料提取、绘图与动效。 |

Pretext 随 Slides 使用。公众号、Notion 和 Bearblog 是按需选择的交付格式。

## 看实际产出

- [项目视觉介绍](docs/slides/index.html)
- [On-Policy Distillation](examples/opd/)
- [DeepSeek-V4](examples/deepseek-v4/)
- [CLI Revolution](examples/cli-revolution/)
- [Nano Claude Code](examples/nano-cc/)

贡献规范见 [AGENTS.md](AGENTS.md)。
