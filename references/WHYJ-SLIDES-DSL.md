# WHY.J SLIDES DSL (Markdown)

This document defines the Markdown DSL used to generate "Why.J Style" engineering theater slides.

## 1. Syntax Overview
- `---`: Slide separator.
- `# [Label]`: Mapping to `.ui-label`.
- `## [Title]`: Mapping to `.header-layer h2`.
- `==Text==`: Mapping to `<strong>` with marker effect.
- `::visual [Content] ::`: Mapping to the 35% right-side `.visual-box`. **MUST be left-aligned**.
- `::code [Language] [Code] ::`: Mapping to `.code-container`.
- `::math [LaTeX] ::`: Mapping to `.math-container`.
- `@pulse: [Text]`: Mapping to `.pulse-layer` (Conclusion).

## 2. Mandatory Structural Sequence
Every deck produced by the Forge MUST follow this O(1) sequence:
1. **00 / Cover**: Identity & Context.
2. **01 / Context**: The "Why now?" logic.
3. **02 / Agenda**: 4 Questions-based tree (Using `.no-bullet` and `.push-left`).
4. **03-05 / Mechanism**: High-density engineering logic.
5. **06 / Takeaways**: Action-oriented summary (3 items max).

## 3. The "Absolute Push-Left" Rule
- NO `center` tags or `text-align: center`.
- All `::visual` blocks MUST default to `flex-start`.
- Every HTML slide MUST carry the "whyj + nano banano + 2026/03/30" watermark in the bottom-right.

## 2. Reverse-Engineered Template (Full Example)

```markdown
---
layout: cover
label: 00 / Cover
title: Why.J Theater
subtitle: ==面向开发者的 11-Page 简约演讲协议手册==
author: Why.J
date: 2026.03.29
source: "The Engineering Presentation Manifesto"
---

# 01 / Context
## 现状：被碎片的 Chat 淹没的技术灵魂

- **现状**: 大量深度技术被掩埋在碎片化的笔记中。
- **痛点**: 传统的 PPT 正在掩盖深度的工程逻辑。
- **方案**: 建立一套 **O(1) 复杂度** 的视觉协议。

::visual
FLOW
::

@pulse: 「 停止对话，开始推理。 」

---

# 02 / Agenda
## Contents: 解构简约协议

- **Q1**: 什么是 **O(1) 逻辑复杂度** 的排版准则？
- **Q2**: 为什么 **Push-Left** 是唯一的布局真理？
- **Q3**: 如何通过 **Markdown DSL** 实现秒级渲染？
- **Q4**: **赤土黄** 配色背后的工程美学逻辑？

---

# 03 / Philosophy
## 核心哲学：O(1) 认知载荷

- **原子化**: 每一页只传递 **1个核心逻辑**。
- **去嵌套**: 严禁逻辑循环，只允许线性向下。
- **5秒原则**: 读者应在 5 秒内扫描完所有 Point。

::visual
O(1)
::

@pulse: 「 简洁是复杂的另一种重构。 」

---

# 04 / Layer A
## 标题层：上下文的绝对隔离

- **视觉锚点**: 8px 粗实线划定 **Context** 边界。
- **语义化**: 标题应是一个深刻的问题。
- **统治力**: `clamp` 确保全平台视觉重心。

::visual
[Header Line Graphic]
::

@pulse: 「 每一个 Slide 都是一个独立的模块。 」

---

# 05 / Layer B
## 演示层：65/35 的非对称美学

- **Logic Block**: 左侧承载高密度的列表逻辑。
- **Visual Detail**: 右侧承载辅助图块。
- **呼吸感**: 右侧 40% 留白。

::visual
[65% Logic Split Graphic]
::

@pulse: 「 留白是 CPU 的缓存空间。 」

---

# 06 / Layer C
## 脉冲层：左下角的灵魂一击

- **位置**: 强制定位在左侧逻辑块正下方。
- **旋转**: **-1.5度** 打破工程的死板。
- **硬阴影**: 12px 厚重投影产生悬浮感。

::visual
@pulse: 「 结论不狠，演讲不稳。 」
::

@pulse: 「 结论是逻辑的唯一出口。 」

---

# 07 / Aesthetics
## 视觉语法：赤土黄与马克笔

- **Claude Color**: `#d97757` 智性温暖感。
- **Marker Effect**: `==text==` 触发涂抹（`<strong>`）。
- **Grid**: 40px 极致淡化网格线。

::visual
==SMART MARKER==
::

@pulse: 「 配色即品牌，品牌即信任。 」

---

# 08 / Code
## 硬核实现：DSL 映射逻辑

- **逻辑注入**: Markdown 标签直接映射 Grid。
- **样式解耦**: 内容与视觉彻底分离。
- **高亮准则**: 为核心逻辑路径染色。

::code
```javascript
// Why.J Style Parser
function renderPulse(text) {
  return `<div class="pulse">${text}</div>`;
}
```
::

@pulse: 「 代码是演讲的终极证据。 」

---

# 09 / Math
## 直觉公式：推理的伸缩法则

- **计算主权**: 性能与时间成正比。
- **数学直觉**: 每一个算力单元都在纠错。

::math
P(\text{success}) \propto \log(\text{Compute}_{\text{reasoning}})
::

@pulse: 「 数学是逻辑的骨骼。 」

---

# 10 / Summary
## Takeaways：简约表达终极准则

- **极简主义**: 视觉只是 README，你才是主进程。
- **线性思维**: 拒绝嵌套循环，只走 **O(1) 路径**。
- **行动导向**: 结尾必须触发明确行动。
```
