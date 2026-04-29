# Synapse：在 AI 混沌期构建确定性的"硬核马具"

---

- **项目**: Synapse
- **身份**: Why.J Engineering
- **核心逻辑**: Agentic Engineering Taste

---

## 1. 为什么我们需要 Synapse？

在 2026 年的今天，AI 已经能够生成海量的代码 and 文本，但绝大多数产物都是**"高熵噪音"**。这些噪音充斥着营销号式的虚浮词汇、不稳定的逻辑结构以及低密度的信息表达。

**Synapse 的出现是为了定义"使用 Agent 的品味" (Agentic Taste)。**

我们不追求 AI 的"灵感"，我们追求的是通过人类的干预，赋予 AI 产出**"机械确定性"**的能力。这不仅仅是一套协议，更是一种审美选择。Synapse 将 Claude/Gemini 等模型转化为一个高压锻造炉，通过注入这种 Agentic Taste，将原始技术素材提纯为具备"Why.J 审美"的硬核工程资产。

## 2. 核心架构：Agentic Taste 的三条支柱

### I. Modern DSL：幻灯片的结构化基底
我们不再使用 PPT。在 Synapse 中，幻灯片是基于 **Why.J Theater DSL** 的结构化文本。这体现了对**"文本即基底"**的 Agentic Taste。
- **Push-Left Truth**: 拒绝居中，一切逻辑从左开始，象征着工程的起始。
- **65/35 非对称布局**: 给逻辑留白，给视觉留位。
- **@pulse 脉冲结论**: 每一页必须有一个像重锤一样击中核心的结论。

### II. O(1) 复杂度：极致的信息提纯
这种品味要求我们拒绝"大而全"的总结。

- **单页单逻辑**: 每一张 Slide 或每一段 Blog 必须在 O(1) 复杂度内可被消化。
- **祛魅原则**: 遇到"Agentic Workflow"自动转译为"带状态机的循环逻辑"。
- **禁止营销**: 严格禁止任何社交媒体风格的 Hook、Emoji 或虚假繁荣的修辞。

### III. Nano Banano：极客视觉美学
相比于精美的图库照片，我们更推崇 **Geek Stick Figures (极客火柴人)**。
- 这是一种"认知负荷最小化"的视觉方案。
- 所有的图表必须带有 `whyj + nano Banano` 的水印，象征着这不仅是生成的，更是经过"人工锻造"校验过的逻辑。

## 3. 技能体系：7 个 Sub-Skill + 主编排器

| Skill | 目录 | 用途 | 触发词示例 |
|-------|------|------|-----------|
| `synapse` | root `SKILL.md` | 主编排器，编排 slides + blog + 全局协议 | `做PPT`, `技术分享` |
| `synapse-forge` | `skills/synapse-forge/` | 素材熔炉：URL/文件 → 结构化摘录 + 截图下载 | `熔炼素材`, `提炼资料` |
| `synapse-design` | `skills/synapse-design/` | 源材料 → blog.md + blog.html | `写成博客笔记`, `按 WhyJ 风格写` |
| `synapse-figure` | `skills/synapse-figure/` | 技术插图编排（架构图、流水线、benchmark） | `插图规范`, `figure spec` |
| `synapse-viz` | `skills/synapse-viz/` | PyTorch 模型结构可视化 | `模型结构图`, `torchvista` |
| `synapse-pretext` | `skills/synapse-pretext/` | Pretext 文本布局集成 | `pretext`, `文本动画` |
| `synapse-gif` | `skills/synapse-gif/` | 动画 GIF + Remotion 技术动画 | `GIF`, `动画`, `remotion` |

每个子技能独立存放在 `skills/` 对应目录下，包含 SKILL.md 定义及所有源材料（references、assets、scripts）。

### 技能联动

- **synapse-forge → 全部**：熔炉是管线的第一站——URL/文件进来，结构化摘录出去，直接喂给下游任何技能
- **synapse-figure ↔ synapse-gif**：figure 定义图表结构和信息语义，gif 决定如何动起来（GIF 模式或 Remotion 模式）
- **synapse-design → synapse-gif**：blog 需要嵌入动画时，design 定义编辑目的，gif 限定动画范围
- **synapse-design → synapse-figure**：blog 需要技术插图时，design 定义插图意图，figure 产出插图规范
- **synapse-pretext → synapse-figure**：figure 中的标签密度、多行换行、标题路由委托给 pretext
- **synapse (root) → 全部**：根编排器协调所有子技能，驱动 Why.J Theater 和 Engineering Blog 两条产线

### 备选工具链（MiniMax Plugin Skills）

synapse-gif 支持备选外部工具：

| Plugin Skill | 场景 |
|---|---|
| `gif-sticker-maker` | 从照片生成 AI 角色贴纸 GIF |
| `vision-analysis` | 动画前分析源图片（OCR、目标检测） |
| `minimax-multimodal-toolkit` | TTS 语音、背景音乐、视频生成 |
| `shader-dev` | GPU 渲染特效（bloom、glitch、粒子系统） |

## 4. 工程实战：从 Hook 到 Merge

Synapse 的典型工作流展示了什么是真正的 **README-driven development**:

1. **Forge (熔炼)**: 输入杂乱的原始 Log、论文 PDF 或 URL，触发 `synapse-forge` 熔炉提炼结构化素材。
2. **Distill (提纯)**: 触发 `synapse` 主编排器，自动编排子技能进入"高压模式"。
3. **Validate (校验)**: 通过内置的 validator 脚本和 `prettier` 自动格式化，确保输出物在工程上是合规的。
4. **Merge (合并)**: 将提纯后的逻辑直接并入项目的 `references` 或 `examples`。

## 5. 智性克制：我们不确定未来，但深知当下

Synapse 承认技术的局限性。我们不承诺 AI 能解决所有架构问题，但我们承诺：**通过 Synapse 产出的每一行文字、每一张幻灯片，都必须是"干货直给"的硬核随笔。**

它是写给那些"深夜还在调参数、看日志、改路由表，并对满天飞的新名词冷冷一笑"的技术同类看的。


---
