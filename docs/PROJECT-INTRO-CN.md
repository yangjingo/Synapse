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

### III. Morandi + Excalidraw：极客视觉美学
相比于精美的图库照片，我们更推崇 **Morandi 色系的手绘架构图**。
- Excalidraw 手绘风格 + Morandi 低饱和度色系 = 认知负荷最小化
- 4 套 Morandi 色系（classic/warm/cool/forest），语义化颜色映射
- 通过 `layout.js` API 程序化生成，`validate()` 碰撞检测保证质量

## 3. 技能体系：5 个 Sub-Skill + 主编排器

| Skill | 目录 | 用途 | 触发词示例 |
|-------|------|------|-----------|
| `synapse` | root `SKILL.md` | 主编排器，编排 slides + blog + 全局协议 | `做PPT`, `技术分享` |
| `synapse-forge` | `skills/synapse-forge/` | 素材熔炉：URL/文件 → DSL（slides DSL + blog DSL） | `熔炼素材`, `提炼资料` |
| `synapse-design` | `skills/synapse-design/` | 内容设计：voice、slides 结构、slides HTML 模板 | `按 WhyJ 风格写` |
| `synapse-pretext` | `skills/synapse-pretext/` | Blog 渲染：DSL → HTML + Pretext 文本排版引擎 | `pretext`, `blog渲染` |
| `synapse-excalidraw` | `skills/synapse-excalidraw/` | Excalidraw 图表生成（Morandi 色系，layout.js API） | `excalidraw`, `架构图` |
| `synapse-animation` | `skills/synapse-animation/` | 动画 SVG/GIF + Remotion 技术动画 | `GIF`, `动画`, `remotion` |

每个子技能独立存放在 `skills/` 对应目录下，包含 SKILL.md 定义及所有源材料（references、scripts、examples）。

### 技能联动

```
URL/文件 → synapse-forge → DSL (.dsl.md)
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
         synapse-design   synapse-pretext   synapse-excalidraw
         slides HTML      blog HTML         Morandi SVG 图
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                      synapse-excalidraw
                      图同步到 blog + slides
```

- **synapse-forge → 全部**：熔炉是管线的第一站——URL/文件进来，DSL 出去，直接喂给下游
- **synapse-design → slides**：design 提供 slides 模板和风格规范
- **synapse-pretext → blog**：pretext 提供 blog 模板和文本排版引擎
- **synapse-excalidraw → blog + slides**：生成 SVG 图后必须同时更新 blog 和 slides（Blog-Slides Figure Sync）
- **synapse (root) → 全部**：根编排器协调所有子技能

## 4. 工程实战：从 Hook 到 Merge

Synapse 的典型工作流展示了什么是真正的 **README-driven development**:

1. **Forge (熔炼)**: 输入杂乱的原始 Log、论文 PDF 或 URL，触发 `synapse-forge` 熔炉提炼结构化 DSL。
2. **Design (设计)**: 通过 `synapse-design` 和 `synapse-pretext` 分别渲染 slides 和 blog HTML。
3. **Figure (插图)**: 通过 `synapse-excalidraw` 生成 Morandi 色系手绘架构图，同步到 blog 和 slides。
4. **Validate (校验)**: 内置 validator 脚本校验 DSL 结构，`node --check` 校验 JS 语法。
5. **Merge (合并)**: 将最终产物归入 `examples/` 对应目录。

## 5. Examples 产出结构

每个 example 目录包含完整的 forge→render 管线产出：

```
examples/
├── cli-revolution/          ← CLI 革命
│   ├── cli-revolution-slides.dsl.md
│   ├── cli-revolution-blog.dsl.md
│   ├── cli-revolution-slides.html
│   ├── cli-revolution-blog.html
│   └── figures/             ← 2 张 Excalidraw SVG + .excalidraw 源文件
├── deepseek-v4/             ← DeepSeek-V4 分析
│   └── (同结构，2 张 SVG)
├── nano-cc/                 ← Nano Claude Code
│   └── (同结构，2 张 SVG)
└── opd/                     ← On-Policy Distillation
    └── (同结构，5 张 SVG)
```

## 6. 智性克制：我们不确定未来，但深知当下

Synapse 承认技术的局限性。我们不承诺 AI 能解决所有架构问题，但我们承诺：**通过 Synapse 产出的每一行文字、每一张幻灯片，都必须是"干货直给"的硬核随笔。**

它是写给那些"深夜还在调参数、看日志、改路由表，并对满天飞的新名词冷冷一笑"的技术同类看的。


---
