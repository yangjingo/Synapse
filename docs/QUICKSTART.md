# Quickstart

5 分钟复现 4 个 examples。

## 前提

- Claude Code（或任何支持 SKILL 的 AI 编程助手）
- 本仓库已安装为 skill：`npx skills add https://github.com/yangjingo/Synapse`

## 触发词

| 目标 | 触发词示例 |
|------|-----------|
| Slides + Blog 全套 | `帮我用 Synapse 做一个关于 XX 的 slides 和 blog` |
| 只做 Slides | `做成 WhyJ 风格的 slides`、`做PPT`、`技术分享` |
| 只做 Blog | `按 WhyJ 风格写一篇技术博客`、`整理成笔记` |
| 素材熔炼 | `熔炼这些素材`、`提炼资料`、`帮我整理` |
| Excalidraw 图 | `画一个 XX 架构图`、`生成 Morandi 色系的 excalidraw 图` |

## 输入格式

Synapse 接受三种输入：

1. **URL** — 论文、技术博客、API 文档的链接
2. **本地文件** — `.md`、`.txt`、`.pdf`、`.html`
3. **原始文本** — 直接粘贴的笔记、会议记录、观察

## 复现 4 个 Examples

### 1. CLI Revolution — CLI 不是复古，是结构性位移

```
输入素材：
- Cursor、Windsurf、Claude Code 等工具的使用经验
- CodeAct (ICML 2024) 论文: https://arxiv.org/abs/2402.01030
- SWE-bench (ICLR 2024): https://arxiv.org/abs/2310.06770
- OpenHands 项目: https://github.com/All-Hands-AI/OpenHands

触发：帮我用 Synapse 做一套关于 "CLI 正在取代 GUI 成为 Agent 时代交互层" 的 slides 和 blog

产出：
  examples/cli-revolution/
  ├── cli-revolution-slides.dsl.md    # 10 页 WhyJ Theater slides
  ├── cli-revolution-slides.html      # Reveal.js 渲染 HTML
  ├── cli-revolution-blog.dsl.md      # Blog DSL
  ├── cli-revolution-blog.html        # Pretext 渲染 HTML
  └── figures/
      ├── figure-01-token-efficiency.svg  # CLI O(1) vs GUI O(n) 曲线
      └── figure-02-priority-stack.svg    # Agent-first vs 传统 SaaS
```

### 2. DeepSeek-V4 — 重写 long-context 的 cost curve

```
输入素材：
- DeepSeek-V4 论文: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf
- 中文分析: https://mp.weixin.qq.com/s/F-0_bbwvQjlYaHVFW_uPNw
- API 文档: https://api-docs.deepseek.com/zh-cn/news/news260424

触发：帮我用 Synapse 做一套关于 "DeepSeek-V4 核心不是更大 MoE，而是重写 long-context cost curve" 的 slides 和 blog

产出：
  examples/deepseek-v4/
  ├── deepseek-v4-slides.dsl.md       # 12 页 slides
  ├── deepseek-v4-slides.html
  ├── deepseek-v4-blog.dsl.md
  ├── deepseek-v4-blog.html
  └── figures/
      ├── figure-01-cost-curve.svg        # V3.2 vs V4 成本曲线
      └── figure-02-hybrid-attention.svg  # SWA/CSA/HCA + KV Cache
```

### 3. Nano Claude Code — 用 500 行 Python 复刻 Agent Loop

```
输入素材：
- Claude Code 源码: https://github.com/anthropics/claude-code
- Nano-Claude 项目: https://github.com/yangjingo/nano-claude
- 个人逆向工程笔记

触发：帮我用 Synapse 做一套关于 "用 500 行 Python 复刻 Claude Code 核心 Agent Loop" 的 slides 和 blog

产出：
  examples/nano-cc/
  ├── nano-cc-slides.dsl.md           # 8 页 slides
  ├── nano-cc-slides.html
  ├── nano-cc-blog.dsl.md
  ├── nano-cc-blog.html
  └── figures/
      ├── figure-01-agent-loop.svg    # Agent Loop 循环图
      └── figure-02-three-files.svg   # 50万行 → 3 文件
```

### 4. OPD — 1/10 GPU-hours 追平 RL

```
输入素材：
- OPD 论文及实验数据
- Qwen3、GLM-5、MiMo-V2-Flash 技术报告中 OPD 相关章节
- DeepSeek V4 后训练 pipeline

触发：帮我用 Synapse 做一套关于 "OPD 用 1/10 GPU-hours 追平 RL" 的 slides 和 blog

产出：
  examples/opd/
  ├── opd-slides.dsl.md               # 10 页 slides
  ├── opd-slides.html
  ├── opd-blog.dsl.md
  ├── opd-blog.html
  └── figures/                        # 5 张 Excalidraw SVG
      ├── figure-03-signal-density.svg
      ├── figure-04-fkl-rkl.svg
      ├── figure-05-overlap.svg
      └── figure-06-pipeline.svg
```

## Pipeline 流程

```
输入 (URL/文件/文本)
        │
        ▼
  synapse-forge
  Fetch → Extract → Synthesize
        │
        ▼
  DSL 文件 (*.dsl.md)
       ╱ ╲
      ╱   ╲
     ▼     ▼
  Slides   Blog
  Render   Render
     │     │
     ▼     ▼
  HTML    HTML
     │     │
     ▼     ▼
  synapse-excalidraw
  Morandi SVG → 同步到 Slides + Blog
```

## Excalidraw 图生成

图的生成遵循 Phase 0 → 3 流程：

1. **Phase 0** — 讨论：用 ASCII mockup 确认布局方案（曲线 vs 柱状 vs 循环等）
2. **Phase 1** — 生成：用 `layout.js` API 写脚本，Morandi 色系
3. **Phase 2** — 确认：上传 excalidraw.com，等用户确认
4. **Phase 3** — 导出：SVG 导出 + 同步到 blog 和 slides 的 DSL/HTML

## 关于模型质量

这 4 个 examples 是基于 **GLM-5** 完成的。最终产出的质量与使用的模型能力直接相关：

- **DSL 结构**（slides 页面序列、blog section 划分）主要依赖 skill 本身的约束，对模型敏感度较低
- **内容质量**（论点深度、技术洞察、pulse 力度）高度依赖模型的推理能力和领域知识
- **Excalidraw 图**由 `layout.js` API 程序化生成，与模型无关
- **HTML 渲染**是模板复制+变量替换，与模型无关

如果使用能力更强的模型（如 Claude Opus、GPT-4o），内容密度和洞察力可能进一步提升。如果使用较小的模型，建议在 forge 阶段提供更详细的素材和明确的论点方向。
