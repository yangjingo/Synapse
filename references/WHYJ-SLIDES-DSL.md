# WHY.J SLIDES DSL

本协议定义了用于生成 "Why.J Style" 工程演讲幻灯片的标准 Markdown 扩展语法。

## 1. 核心语法 (Core Syntax)

- `---`: **幻灯片分隔符**。
- `# [Label]`: 映射至左上角 `.ui-label`（如 `# 01 / Context`）。
- `## [Title]`: 映射至 `.header-layer h2` 标题。
- `==Text==`: 映射至 `<strong>` 标签，触发 **Marker (涂抹)** 视觉效果。

### 2. 侧边栏组件 (Right-side 35% Visual Box)

所有 `::` 开头的组件默认渲染在右侧 35% 的 `.visual-box` 中。

- `::image [src] [scale=1.0 y=0] ::`
  - `src`: 支持绝对路径或 URL。
  - `scale`: 缩放比例（默认 1.0）。
  - `y`: 垂直位移（如 `-20px`）。
- `::code [lang] [content] ::`
  - 渲染高亮代码块。
- `::math [latex] ::`
  - 渲染 KaTeX 数学公式。

### 3. 脉冲结论层 (Pulse Conclusion)

- `::pulse [text] [rotate=-1.5deg y=0 scale=1.0] ::`
  - `text`: 结论文本。
  - `rotate`: 旋转角度（默认 -1.5deg）。
  - `y`: 垂直位移。
  - `scale`: 缩放。

### 4. 引用与文献层 (Reference Layer)

- `::reference [Title] [URL] ::`
  - 用于在幻灯片底部或右侧插入参考链接，样式为极简手写字体。

## 2. 标准示例 (Standard Example)

```markdown
---

# 01 / Context

## 现状：被碎片的 Chat 淹没的技术灵魂

- **现状**: 大量深度技术被掩埋在碎片化的笔记中。
- **方案**: 建立一套 **O(1) 复杂度** 的视觉协议。
- **扩展**: 每一个列表项均需完整展开，严禁折叠。

::image [/assets/logo.png] [scale=0.8 y=10px] ::

::pulse [「 停止对话，开始推理。 」] [rotate=-2deg y=20px] ::

::reference [Engineering Manifesto] [https://whyj.io/manifesto] ::
```

## 3. 结构化序列 (Sequence)

1. **00 / Cover**
2. **01 / Context**
3. **02 / Agenda**
4. **03-08 / Mechanism** (逻辑详情，列表项必须全部展开)
5. **09 / Takeaways**
6. **10 / Reference** (引用汇总页)
