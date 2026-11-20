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

::image [./figures/figure-01-context.svg] [scale=100] ::
```

- Grid layout (65%/35%). Has pulse + visual-box.
- Build the figure from a prompt enriched by `examples/<project>/DESIGN.md` when present, then replace the planning prompt with a real `::image` path before finalizing.
- The generation prompt must include `#FAFAF7` paper, rough `#4A4338` ink, sparse labels, one `#C45A20` accent, no gradients, shadows, 3D, clutter, or emoji.
- Route raster generation through Codex `$imagegen`; vector/code-native diagrams may be generated as SVG. A final example must never display the prompt itself.
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

::image [./figures/figure-NN-mechanism.svg] [scale=100] ::
```

- Grid layout (65%/35%). Must have pulse + visual-box.
- Visual-box: finished `::image` OR `::code` OR `::math`; prompt text is planning metadata, not slide content.
- When `examples/<project>/DESIGN.md` exists, enrich the prompt with its `Figure prompt suffix / 风格控制` and `文件落地`.
- Generation path for any new/recreated raster visual: invoke `$imagegen` and use its default built-in `image_gen` tool mode. If it fails, report the failure; API/CLI fallback requires explicit user approval.
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
| `::visual` | `::visual {prompt text} ::` | Planning-only directive; must be resolved to `::image` before final output |
| `::image` | `::image [path] [scale=N y=Npx] ::` | `<img>` in `.visual-box` |
| `::code` | `::code [lang] [content] ::` | `.code-container` in `.visual-box` |
| `::math` | `::math [LaTeX] ::` | KaTeX in `.visual-box` |
| `::pulse` | `::pulse [「 text 」] [fragment] ::` | `.pulse-layer` callout |

For outputs under `examples/<project>/`, merge `examples/<project>/DESIGN.md` controls into the generation prompt, record that prompt in `figures/index.md`, render the asset, and commit only a concrete `::image` directive to the final slides DSL. Run `node scripts/validate-slide-visuals.js` before completion.

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
  prompt: `{detailed generation prompt — attached to figure, exposed in zoom overlay}`
}
```

Figure caption principle: **explain WHY, not just WHAT**. A good caption tells the reader what insight the figure encodes — why the curves have these shapes, what the visual difference means, how it connects to the surrounding argument. Not just labels like "XX vs YY comparison."

Figure prompt principle: **stored generation spec**. The `prompt` field is preserved in the data model and available in the zoom overlay for review, while the normal figure card stays clean (image + caption only).
1. **When image exists**: prompt is attached to the figure and surfaced on click/zoom for reproduction.
2. **When image missing**: placeholder and prompt are both shown in zoom/click flow, so generation is still recoverable.
3. **Generation traceability**: record `codex-imagegen`, `synapse-excalidraw`, or another explicitly approved path in `figures/index.md`, including the reason for any approved fallback.
4. **Path rule**: figure image paths in `SECTIONS` and `::image` must use `./figures/...` so the path is portable from example HTML.

Prompt format — must include concrete visual details:
```
"Create a dense, clean engineering figure for a hard-core technical article.
Use {background color} background, {specific hex colors for each element}.
{Describe the precise visual layout: axes, curves, bars, annotations, labels}.
{Include specific data points or labels that appear in the figure}.
All fonts in Virgil/hand-drawn style.
Keep it flat, technical, editorial.
Avoid: marketing aesthetics, 3D hardware art, decorative gradients, rainbow color coding, oversized icons, vague labels."
```

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
- **NO curly quotes** (“” / U+201C/U+201D) as JS string delimiters — causes SyntaxError white-screen. **3+ incidents**. Curly quotes are fine as string **content** (“质量保持”) but NEVER as **delimiters**. After ANY edit to .html templates, verify:
  ```
  node -e "new Function('async function _m(){' + require('fs').readFileSync('FILE','utf8').match(/<script type=\"module\">([\\s\\S]*)<\\/script>/)[1] + '}'); console.log('OK')"
  ```
- Image paths: relative from output directory
- `callout` renders as highlighted blockquote
- `prompt` shown as placeholder when image file is missing
- Inline references: embed source links directly in prose, not as `[N]` footnotes
- Reference section uses item list format: `- **Title** - URL`

---

## C. Article editorial guidance

Use `synapse-tech-blog` for technical prose, paper notes, and retrospectives. Use `synapse-wechat` for a WeChat Official Account article. This file specifies the DSL representation. Apply the relevant article reference before converting the evidence into DSL.
