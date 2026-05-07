# FORGE-DSL: Synapse Forge DSL Format & Voice

DSL 语法定义 + WhyJ 写作规范。合成 DSL 时语法和文风一起参考。

---

## A. Slides DSL

### Page Sequence (MANDATORY order)

```
00 / Cover → 01 / Context → 02 / Agenda → 03-N / Mechanism → Take A Ways → Reference
```

### Page Separator

`---` between pages.

### Per-Page Syntax

```
# NN / PageType
## Heading Text
- **Label**: content with ==highlighted term==
::directive [args] ::
```

### Page Types

#### Cover

```
# 00 / Cover

## {Short Title}

{Chinese one-sentence thesis as subtitle}

Version: Synapse v{version} | Author: Why.J | Date: YYYY/MM/DD
```

- NO image, NO pulse, NO visual-box
- Subtitle is a Chinese sentence describing the talk's core thesis (NOT "Synapse vX.X")

#### Context

```
# 01 / Context

## 现状分析：{descriptive title}

- **事实 1**: {fact} with ==key term==
- **事实 2**: {fact} with ==key term==
- **事实 3**: {fact} with ==key term==

::pulse [「 {high-level abstraction of all facts} 」] ::

::visual {🍌 nano-banana prompt — Excalidraw hand-drawn style} ::
```

- Grid layout (65%/35%). Has pulse + visual-box.
- H2 must emphasize "现状分析".
- Pulse does high-level abstraction.
- **Context 事实硬上限 3 条**。如果素材超过 3 个关键事实，只保留最重要的 3 个，其余下沉到 Mechanism 页面。如果难以取舍，暂停并请用户确认选择。

#### Agenda

```
# 02 / Agenda

## {descriptive title}

- **Q1**: 事实 {X}→{Y} 的 {压缩逻辑/因果链} —— {question}
- **Q2**: ...
- **Q3**: ...
- **Q4**: {bigger-picture question}
```

- `push-left` layout. NO image, NO pulse, NO visual-box.
- Questions grow from Context facts, referencing fact numbers.
- Items use `fragment` class for sequential reveal.

#### Mechanism

```
# NN / Mechanism {Roman numeral}

## {topic-specific heading}

- **{Label}**: {explanation} with ==key term==
- **{Label}**: {explanation} with ==key term==
- **{Label}**: {explanation} with ==key term==

::pulse [「 {hammer conclusion} 」] ::

::visual {🍌 nano-banana prompt} ::
```

- Grid layout (65%/35%). Must have pulse + visual-box.
- Visual-box: nano-banana prompt OR `::code` OR `::math`.
- Max 5 bullet points per slide.

#### Take A Ways

```
# NN / Take A Ways

## Take A Ways

- **Q1 → A1**: {answer with ==key term==}
- **Q2 → A2**: {answer with ==key term==}
- **Q3 → A3**: {answer with ==key term==}

::pulse [「 {Q4 answer / final hammer} 」] [fragment] ::
```

- `push-left` layout. NO visual-box.
- Q→A strict mapping: Q1→A1, Q2→A2, Q3→A3.
- Q4 becomes pulse with fragment animation.

#### Reference

```
# NN / Reference

## Reference

- **{Title}** - {Author} - {URL}
- **{Title}** - {Author} - {URL}
- **{Title}** - {URL}
```

- `.canvas-footer` layout. NO image, NO pulse.
- Bold title is clickable link. Full URL displayed inline.
- CSS `::before` auto-generates arrows — do NOT hand-write `→`.

### Directives

| Directive | Syntax | Renders As |
|-----------|--------|-----------|
| `::visual` | `::visual {prompt text} ::` | nano-banana prompt in `.visual-box` |
| `::image` | `::image [path] [scale=N y=Npx] ::` | `<img>` in `.visual-box` |
| `::code` | `::code [lang] [content] ::` | `.code-container` in `.visual-box` |
| `::math` | `::math [LaTeX] ::` | KaTeX in `.visual-box` |
| `::pulse` | `::pulse [「 text 」] [fragment] ::` | `.pulse-layer` callout |

### Inline Formatting

| Syntax | Renders As |
|--------|-----------|
| `==text==` | `<mark>` (highlighted with accent background) |
| `**text**` | `<strong>` (same visual as mark) |

### Metadata Fields

| Field | Format | Example |
|-------|--------|---------|
| Watermark | `whyj + {SLUG} + YYYY/MM/DD` | `whyj + CLI-REV + 2026/04/26` |
| HTML title | `{Project Name} \| Synapse v{version}` | `CLI Revolution \| Synapse v6.0` |
| Cover meta | `Version: Synapse v{version} \| Author: Why.J \| Date: YYYY/MM/DD` | |

---

## B. Blog DSL

### Metadata (first section)

```
Category: {tag}
Date/Author: YYYY/MM/DD · {author}
Page title: {title for <title> tag}
```

### Top-Level Variables

```
TITLE: {string}          — Article headline, fitted via fitTitle()
LEAD: {string}           — Opening thesis paragraph
SECTIONS: [{object}]     — Ordered section array (see below)
PULSE: {string}          — Final takeaway / closing hammer
```

### SECTIONS Array

Each entry is one of three types:

#### Text Section

```
{
  heading: `{section title}`,
  body: `{prose body — plain text, used for text measurement}`,
  bodyHTML: '<div>...<a href="url">linked text</a>...</div>',  // optional
  callout: `{highlighted callout (optional)}`
}
```

- `body`: **always plain text** — no HTML, no markdown. Used by the renderer for line measurement and layout calculation.
- `bodyHTML`: **required when body contains hyperlinks**. Uses `<div>` per paragraph, `<a>` for links. Rendered via `innerHTML`. Single-quoted JS string with straight double quotes for HTML attributes.
- When bodyHTML is present, the renderer uses it for display but still uses `body` for measurement.

#### Inline References (Blog-specific)

Blog posts embed citations directly in the body text as hyperlinks, not as numbered `[N]` footnotes:

- **DSL**: `[THUNLP 的论文](https://arxiv.org/abs/...)`
- **HTML body**: `THUNLP 的论文` (plain text, for measurement)
- **HTML bodyHTML**: `<a href="https://arxiv.org/abs/..." target="_blank">THUNLP 的论文</a>` (for rendering)

Style: weave the source naturally into the sentence. "V4 报告里写了..." not "According to [1]...". The link turns the source name into a clickable reference.

#### Transitions (起承转合)

Each text section should have narrative flow between sections — like a lecture script, not isolated bullet points:

- **Section openers** should connect to the previous section's conclusion or figure
  - "看完 R1 的路线，核心问题来了：V4 到底改了什么？"
  - "知道坑在哪了，下一个问题是：怎么避坑？"
- **Section closers** should lead into the next figure or section
  - "下面这张图就是 V4 用这个思路整合多专家的流程。"
  - "下面几张图分别展示了...的做法。"
- **Mid-article pivots** use explicit turns
  - "OPD 听起来很好用，但不是拿过来就能跑的。"
  - "技术聊完了，最后说点题外话。"

Overall arc follows slides logic: 起(Context) → 承(Mechanism) → 转(Failure/Conditions) → 合(Insights/Takeaway).

#### Figure Section

```
{
  image: `{relative path to image}`,
  caption: `{Figure N: what this figure teaches, not just what it shows}`,
  prompt: `{generation prompt if image missing}`
}
```

Figure caption principle: **explain WHY, not just WHAT**. A good caption tells the reader what insight the figure encodes — why the curves have these shapes, what the visual difference means, how it connects to the surrounding argument. Not just labels like "XX vs YY comparison."

Examples:
- Weak: "Figure 3: Forward KL vs Reverse KL 数据流对比"
- Strong: "Figure 3: Forward KL 的期望算在教师分布上，Student 只能被动拟合；Reverse KL 的期望算在学生分布上，信号密度从 O(1) 跳到 O(N)"

#### Reference Section

```
{
  heading: `Reference`,
  body: `[1] {Title}
[2] {Title}
...`,
  bodyHTML: '<div><a href="{url}" target="_blank">[1] {Title} - {Author}</a></div><div><a href="{url}" target="_blank">[2] {Title}</a></div>...'
}
```

- `body`: numbered list with `[N]` prefix, plain text for measurement
- `bodyHTML`: each reference in its own `<div>`, with `<a>` linking to the source. Single-quoted JS string
- References in `bodyHTML` include author/source info that may be abbreviated in `body`
- Inline references in preceding sections link directly to the same URLs; this section serves as a consolidated bibliography

### SECTIONS Sequence (typical)

1. Text: thesis / core problem
2. Text + callout: first mechanism
3. Figure: architecture diagram
4. Text + callout: second mechanism
5. Figure: detail diagram
6. Text: supporting mechanism
7. Text: efficiency / data
8. Text: tradeoffs
9. Text: engineering takeaway
10. Reference

Not every article needs all 10. Minimum: thesis → mechanism → takeaway → reference.

### Content Rules

- ALL content strings use backtick template literals (`` ` ``), except `bodyHTML` which uses single-quoted strings with straight double quotes for HTML attributes
- `bodyHTML` strings MUST use `'single quotes'` as JS delimiter — this preserves straight `"` for HTML attributes (`href="..."`, `target="_blank"`)
- **NO curly quotes** (`""`) as JS string delimiters — causes SyntaxError white-screen
- Image paths: relative from output directory
- `callout` renders as highlighted blockquote
- `prompt` shown as placeholder when image file is missing
- Inline references: embed source links directly in prose, not as `[N]` footnotes
- Reference section uses item list format: `- **Title** - URL`

---

## C. Voice: WhyJ 写作规范

### 活人感（不可妥协）

Blog 是人写的散文，写给活人看的。DSL 标签（`::pulse`、`::math`）属于幻灯片，不属于段落。

- **像凌晨两点给同事解释问题那样写**，不像下午两点写论文那样写
- **口语可以，粗糙可以。** 过度润色消灭的是人味
- **个人判断保持个人化**："Python 是我最熟悉的工具" > "生态轻量、SDK 成熟"
- **情绪是信号**："跑不起来，没有手感" > "缺乏运行环境的静态阅读无法感知动态反馈"
- **兴奋带来的啰嗦是好的**：8 条发自真实的反思，好过压缩后的 5 条 "Action Items"

润色陷阱——以下转换会消灭人味：

| 原文（保留） | 过度润色（避免） |
|-------------|-----------------|
| "我只是在用，并不理解它。" | "陷入'使用幻觉'的认知熵增" |
| "牵出十几个模块" | "依赖纠缠" |
| "删掉之后系统还能跑吗？" | "每一层删除都是一次深度考问" |
| "觉得好玩就开始" | （被整条删除） |

**原则**：如果润色后这句话像是任何人都能写出来的，那就是错误的润色。

### Synapse 创作五律

#### I. 祛魅原则 (Anti-Hype)

拒绝名词泡沫，直击工程本质。遇到高大上的新词（如 Agentic Workflow），自动转译为具体的工程实现（如"带状态机的循环逻辑"）。不卖关子，首段即进入战场。

#### II. 伤痕美学 (Failure-Driven)

失败的细节比成功的结论更有信息熵。详细记录"因为某某限制导致某某方案失败"的过程。用"坑"来定义"路"。

#### III. 古典基座 (Foundational Logic)

前沿 AI 问题的解药往往藏在经典软件工程里。强调解耦、约束、确定性。始终保持架构师视角。

#### IV. 机械精度 (Terminological Precision)

使用具有机械感和结构感的动词：注入、暴露、编排、路由、原子化。排版追求高信息密度。

#### V. 智性克制 (Skeptical Humility)

结论不给定论，多用设问或开放式结尾。承认技术的局限性，比吹嘘技术的全能更显专业。

### 句式红黑榜

#### 禁区：油腻营销号句式（任何一条出现，整段重写）

| 句式类型 | 典型模版 | 为什么油腻 |
|----------|---------|-----------|
| 虚假的深刻 | "不是 **XXX**，而是 **XXXX**" | 用否定句强行制造洞察假象 |
| 定义的傲慢 | "**XXX** 的本质是 **XXXX**" | 没讲事实就盖棺定论 |
| 爹味儿劝诫 | "别被 **XXXX** 唬住，核心是..." | 预设读者是小白 |
| 廉价的真诚 | "我得说一句实在话 / 说白了" | 后面接的往往是更大的废话 |
| 套路化互动 | "怎么办？为什么？我直接回三条！" | 强行制造节奏感 |

#### 推荐：硬核工程师句式

**描述事实**（用"观察"代替"洞察"）：
- "今天调了一下午，发现了一个细节：……"
- "从数据/代码表现来看，情况是这样的：……"
- "这事儿没那么玄学，主要就是因为……"

**展示过程**（用"尝试"代替"定论"）：
- "原本以为是 A 的问题，后来发现坑在 B 身上。"
- "我们试了三种方案，最后只有这个暴力逻辑跑通了。"
- "绕了一圈回来，发现最管用的还是这几行代码。"

**设定边界**（用"局部性"代替"绝对化"）：
- "在 X 这个特定配置下，会有明显的 Y 现象。"
- "我不确定这是否普适，但在我这儿，它解决了 Z。"
- "目前的方案上限也就到这了，再往后就是浪费算力。"

**高阶递进**：
- "不仅是代码写完了，关键是它把以前那些冗余的依赖链全理顺了。"

### 固定句式库

#### 开头 / 引入
- `这事儿没那么玄学，主要就是因为 [具体原因]。` — 打破迷思，快速进入事实
- `今天调了一下午，发现了一个细节：[具体发现]。` — 用个人经历做钩子
- `最近在搞 [X]，遇到一个很典型的坑：[Y]。` — 工程实战开场白
- `从 [数据/代码/日志] 来看，情况是这样的：[事实描述]。` — 数据先行

#### 过渡 / 转折
- `原本以为是 [A] 的问题，后来发现坑在 [B] 身上。`
- `绕了一圈回来，发现最管用的还是 [最简单的方案]。`
- `我们试了 [N] 种方案，最后只有 [暴力/简单方案] 跑通了。`
- `说到 [X]，很多人会想到 [Y]。但实际场景里，[Z] 才是真正的瓶颈。`

#### 论点 / 判断
- `在 [具体条件] 下，会有明显的 [现象]。`
- `我不确定这是否普适，但在我这儿，它解决了 [具体问题]。`
- `目前的方案上限也就到这了，再往后就是浪费 [算力/时间]。`

#### 递进 / 总结
- `不仅是 [显性成果]，关键是它把 [隐性痛点] 全理顺了。`
- `好处是 [A]，代价是 [B]。值不值，看你自己的场景。`
- `简单说：[一句话结论]。展开说：[后续段落]。`

#### 收尾 / 留白
- `以上就是我目前的理解。如果有更好的做法，欢迎交流。`
- `先这样。等跑起来再说。`
- `这事儿还有得琢磨。`

### 去油三技巧

1. **动词 > 名词**：别写"进行性能的深度优化"，写"把算子利用率拉到了 90%"
2. **具体 > 抽象**：别写"底层逻辑"，写"显存分布"或"推理延迟"
3. **Bitter Lesson 视角**：少吹捧"人类精妙的设计模式"，多关注"通用算法和大规模计算"

### 风格参照

写作时参照这些作者的"怎么说话"——朴实、锋利、不端着：

- **赵程阳**：短句、口语化、零废话，"活人感"最佳中文样本
- **王垠**：犀利不留情面，论点有根有据
- **阮一峰**：最平实的语言讲最复杂的道理，该停就停
- **李沐**：裸奔式复盘，失败不隐藏，成功不夸大
- **田渊栋**：用回报矩阵和概率论拆沉重话题，智性克制

### 结构原则

- **Thesis first** — 不按源文献的章节顺序，按自己的论点重建
- **One section, one hard point** — 每段逻辑 O(1)
- **Mechanism over praise** — 解释 how it works，不说 how great it is
- **End with aggressive pulse** — 最后一句重锤，不礼貌收尾
