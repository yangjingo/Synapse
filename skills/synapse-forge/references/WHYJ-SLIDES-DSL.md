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
- `Reference` 页的列表项支持两种模板：
  - `Title - Source - URL`（书籍/论文）
  - `Title - URL`（项目/工具）

## 2. 标准示例 (Standard Example)

```markdown
---

# 00 / Cover

标题 + 自我介绍

# 01 / Context

## 现状：被碎片的 Chat 淹没的技术灵魂

- **现状1**: 大量深度技术被掩埋在碎片化的笔记中。
- **现状2**: 
- **现状3**: 每一个列表项均需完整展开，严禁折叠。

::image [/assets/logo.png] [scale=0.8 y=10px] ::

::pulse [「 停止对话，开始推理。 」] [rotate=-2deg y=20px] ::

::reference [Engineering Manifesto] [https://whyj.io/manifesto] ::
```

```markdown
---

# 02 / Agenda


# 11 / Reference

## Reference

- **Refactoring 2nd Edition** - Martin Fowler - https://book-refactoring2.ifmicro.com/
- **The Way of Code** - Rick Rubin - https://www.thewayofcode.com
- **Claude Code Wiki** - https://openedclaude.github.io/claude-reviews-claude
- **Nano-Claude Artifacts** - https://github.com/yangjingo/nano-claude

::reference [SWE-bench: Evaluating Engineering Agents] [https://www.swebench.com/] ::
```

## 3. Page Type Rules

- **Cover (00)**: NO image, NO pulse. Title + Chinese subtitle (topic thesis) + metadata only. Subtitle is NOT "Synapse vX.X".
- **Context (01)**: Collects factual information (事实 1, 事实 2, ...). H2 emphasizes "现状分析". Pulse does high-level abstraction. Must have `::pulse` and visual-box with 🍌 nano-banana prompt.
- **Agenda (02)**: Questions grow from Context facts (e.g. "事实 2→3 的压缩逻辑 —— Q1"). NO image, NO pulse. Items rendered with `class="fragment"` for sequential reveal.
- **Mechanism (03-N)**: Must have `::pulse` and `::image`/`::code`/`::math`. visual-box contains 🍌 nano-banana prompt.
- **Take Aways**: Strictly answers Agenda questions (Q1→A1, Q2→A2, Q3→A3). NO visual-box, uses push-left. Q4 becomes `::pulse` with fragment animation.
- **Reference (11)**: Uses `.canvas-footer` layout. Bold title wraps `<a href>` link, full URL text still displayed. Has arrows on items. NO image, NO pulse.

## 4. Structural Sequence

1. **00 / Cover**
2. **01 / Context** (事实收集 → pulse 高度抽象)
3. **02 / Agenda** (从事实中生长出问题)
4. **03-N / Mechanism** (逻辑详情，列表项必须全部展开)
5. **Takeaways** (Q→A 严格对应)
6. **Reference** (引用汇总页)
