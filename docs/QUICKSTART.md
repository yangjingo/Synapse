# Quickstart

整理好你的学习资料，选择输出格式，Synapse 帮你完成剩下的。

## 前提

- Claude Code（或任何支持 SKILL 的 AI 编程助手）
- 本仓库已安装为 skill：`npx skills add https://github.com/yangjingo/Synapse`

## 三步走

```
1. 整理素材         2. 选择输出          3. 微调
   URL / 文件 / 笔记   ──→  Blog 或 Slides  ──→  DSL / 插图
```

### Step 1: 准备素材

Synapse 接受三种输入：

| 输入类型 | 示例 |
|---------|------|
| **URL** | 论文链接、技术博客、API 文档 |
| **本地文件** | `.md`、`.txt`、`.pdf`、`.html` |
| **原始文本** | 直接粘贴的笔记、会议记录、观察 |

素材越详细，产出越精准。你可以混合使用多种输入。

### Step 2: 选择输出

用触发词告诉 Synapse 你要什么：

| 触发词示例 | 产出 |
|-----------|------|
| `帮我用 Synapse 做一个关于 XX 的 slides 和 blog` | Slides + Blog 全套 |
| `做成 WhyJ 风格的 slides`、`做PPT`、`技术分享` | 只做 Slides |
| `按 WhyJ 风格写一篇技术博客`、`整理成笔记` | 只做 Blog |
| `熔炼这些素材`、`提炼资料` | 只出 DSL，不渲染 HTML |

### Step 3: 微调

Pipeline 生成的中间产物都可以手动微调：

#### DSL 微调

Pipeline 会先生成 `.dsl.md` 文件（Slides DSL 或 Blog DSL），这是结构化的中间格式。你可以：

- 调整论点顺序、增删 section
- 修改 pulse（结论金句）的措辞
- 改变页面结构或 section 划分

DSL 修改后，重新渲染即可得到更新后的 HTML。

#### 插图微调

插图有三种生成和调整方式：

| 方式 | 适用场景 |
|------|---------|
| **Excalidraw 程序化生成** | 架构图、流程图、对比图 — 由 `layout.js` 生成 Morandi 色系 SVG |
| **Excalidraw 在线编辑** | 在 excalidraw.com 打开生成的图，手动拖拽微调布局和文字 |
| **Imagen / Nano-Banana** | 需要写实风格或复杂示意图时，用 AI 图像模型根据文字描述生成 |

生成后的 SVG 插图会自动同步到 Blog 和 Slides 中。如果你在 Excalidraw 在线编辑器中做了修改，导出新的 SVG 覆盖即可。

## 复现 4 个 Examples

### 1. CLI Revolution — CLI 不是复古，是结构性位移

```
输入素材：
- Cursor、Windsurf、Claude Code 等工具的使用经验（原始文本）
- CodeAct (ICML 2024) 论文: https://arxiv.org/abs/2402.01030
- SWE-bench (ICLR 2024): https://arxiv.org/abs/2310.06770
- OpenHands 项目: https://github.com/All-Hands-AI/OpenHands

触发：帮我用 Synapse 做一套关于 "CLI 正在取代 GUI 成为 Agent 时代交互层" 的 slides 和 blog
```

产出参考：`examples/cli-revolution/`
- Slides 预览：`examples/cli-revolution/cli-revolution-slides.html`
- Blog 预览：`examples/cli-revolution/cli-revolution-blog.html`

### 2. DeepSeek-V4 — 重写 long-context 的 cost curve

```
输入素材：
- skills/synapse-forge/references/deepseek-v4-validation-note.md — DSV4 核心分析笔记
- skills/synapse-forge/references/deepseek-v4-long-validation-note.md — DSV4 WhyJ 风格长文
- DeepSeek-V4 论文: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf
- 中文分析: https://mp.weixin.qq.com/s/F-0_bbwvQjlYaHVFW_uPNw
- API 文档: https://api-docs.deepseek.com/zh-cn/news/news260424

触发：帮我用 Synapse 做一套关于 "DeepSeek-V4 核心不是更大 MoE，而是重写 long-context cost curve" 的 slides 和 blog
```

产出参考：`examples/deepseek-v4/`
- Slides 预览：`examples/deepseek-v4/deepseek-v4-slides.html`
- Blog 预览：`examples/deepseek-v4/deepseek-v4-blog.html`

### 3. Nano Claude Code — 用 500 行 Python 复刻 Agent Loop

```
输入素材：
- Claude Code 源码: https://github.com/anthropics/claude-code
- Nano-Claude 项目: https://github.com/yangjingo/nano-claude
- 个人逆向工程笔记（原始文本）

触发：帮我用 Synapse 做一套关于 "用 500 行 Python 复刻 Claude Code 核心 Agent Loop" 的 slides 和 blog
```

产出参考：`examples/nano-cc/`
- Slides 预览：`examples/nano-cc/nano-cc-slides.html`
- Blog 预览：`examples/nano-cc/nano-cc-blog.html`

### 4. OPD — 1/10 GPU-hours 追平 RL

```
输入素材：
- OPD 论文及实验数据
- Qwen3、GLM-5、MiMo-V2-Flash 技术报告中 OPD 相关章节
- DeepSeek V4 后训练 pipeline

触发：帮我用 Synapse 做一套关于 "OPD 用 1/10 GPU-hours 追平 RL" 的 slides 和 blog
```

产出参考：`examples/opd/`
- Slides 预览：`examples/opd/opd-slides.html`
- Blog 预览：`examples/opd/opd-blog.html`

每个 example 的最终产出由 pipeline 根据素材和论点自动决定，通常包括 slides DSL + HTML、blog DSL + HTML、以及若干插图。

## 提高产出质量的技巧

### 素材准备

- **明确论点方向**：触发时用一句话说出你的核心论点（如 "CLI 正在取代 GUI 成为 Agent 时代交互层"），而不是泛泛的 "帮我做个 XX 的 slides"。论点越明确，DSL 结构越紧凑
- **混合输入效果更好**：URL + 本地笔记 + 原始文本组合使用，比纯 URL 效果好。本地笔记提供你的个人视角，URL 提供事实支撑
- **先熔炼再输出**：如果素材很多，先触发 `熔炼这些素材` 只出 DSL，确认论点和结构没问题后，再触发 slides/blog 渲染

### 触发控制

- **分步触发**：`先做 blog` → 确认内容 → `再做 slides`，比一次性要求全套更容易控制质量
- **指定风格**：`按 WhyJ 风格` 会触发对应的 voice 和结构约束，不加则可能得到更通用的输出
- **明确数量约束**：slides 默认 8-12 页，blog 默认 5-8 个 section。需要更多或更少时直接说明

### 插图控制

- **先确认再生成**：每次生成插图前，Synapse 会用 ASCII mockup 让你选择布局方案（曲线 vs 柱状 vs 循环等），选择后才开始画
- **指定色系**：可以说 `用暖色系`（warm）、`冷色系`（cool）、`森林系`（forest），默认是经典灰绿系
- **Excalidraw 在线微调**：生成的图会分享到 excalidraw.com，你可以在浏览器中拖拽调整，确认后再导出 SVG
- **复杂图用 Imagen**：需要写实风格的数据图表或场景示意图时，可以要求 `用 Imagen 生成这张图`

### DSL 微调

- **改论点不改结构**：修改 DSL 中某个 section 的 `pulse` 或 `body` 文字，比调整整体结构更安全
- **Context 页事实不超过 3 条**：如果 DSL 生成了 4 条以上事实，建议精简到 3 条，多余的移到 Mechanism 页面
- **PULSE 是锤子**：最后的结论必须是重新框定问题（reframe），不是总结。如果 PULSE 只是 recap，修改它

## 关于模型质量

这 4 个 examples 是基于 **GLM-5** 完成的。最终产出的质量与使用的模型能力直接相关：

- **DSL 结构**（slides 页面序列、blog section 划分）主要依赖 skill 本身的约束，对模型敏感度较低
- **内容质量**（论点深度、技术洞察、pulse 力度）高度依赖模型的推理能力和领域知识
- **插图**由 Excalidraw 程序化生成或 Imagen 模型生成，与文本模型无关
- **HTML 渲染**是模板复制+变量替换，与模型无关

如果使用能力更强的模型（如 Claude Opus、GPT-4o），内容密度和洞察力可能进一步提升。如果使用较小的模型，建议提供更详细的素材和明确的论点方向。
