---
name: synapse-forge
description: Raw material → DSL pipeline (熔炉). Give it URLs, files, or raw text, and it produces a WhyJ-style DSL file (slides.dsl.md or blog.dsl.md). Handles ingestion, extraction, and DSL synthesis in the WhyJ engineering voice. Use for "熔炼这些素材", "帮我整理", "做成 slides", or any task that starts with source material and should produce structured DSL output.
repository: https://github.com/yangjingo/Synapse
homepage: https://github.com/yangjingo/Synapse
version: 1.0.0
---

# Synapse Forge (熔炉)

URLs → DSL. 给一堆素材，出结构化 DSL 文件。

## Read

1. `FORGE.DSL.md` — DSL 语法 + WhyJ 写作规范（合成时唯一参考文件）
2. `references/WHYJ-SLIDES-DSL.md` — slides DSL 语法规范
3. `references/BLOG-STYLE-CN.md` — 中文博客写作风格指南
4. `references/deepseek-v4-validation-note.md` — DSV4 源素材示例（voice 参考）
5. `references/deepseek-v4-long-validation-note.md` — DSV4 长 WhyJ 风格文章示例
6. Main `examples/` directory — 完整 forge→render 管线产出：
   - `cli-revolution/` — slides DSL + blog DSL
   - `deepseek-v4/` — slides DSL + blog DSL
   - `nano-cc/` — slides DSL + blog DSL
   - `opd/` — slides DSL + blog DSL + 5 SVG figures

## Pipeline

```
Stage 1: Fetch      — URLs/文件 → 原始内容
Stage 2: Extract    — 原始内容 → 关键摘录 + 数据点
Stage 3: Synthesize — 摘录 + 数据点 → DSL（.dsl.md）
```

最终产出：一个 `.dsl.md` 文件，交给下游 skill（synapse-pretext / synapse slides renderer）渲染为 HTML。

### Stage 1: Fetch & Parse

#### Tool Selection (by site type)

| Site Type | Primary Tool | Fallback | Why |
|-----------|-------------|----------|-----|
| Chinese sites (zhihu, weixin, bilibili) | `mcp__web-search-prime__web_search_prime` content_size=high, location=cn | `mcp__web-reader__webReader` | Anti-scraping truncates full fetch; search gives 2500-word summary reliably |
| English blogs / docs | `mcp__web-reader__webReader` | — | Full markdown, stable |
| arXiv | `mcp__web-reader__webReader` (HTML version URL) | — | Structured sections + figure URLs. Image URLs must use `/html/{id}vN/x{N}.png` format, not bare `/id` path |
| PDF | `mcp__web-reader__webReader` | — | Extract text from PDF links |
| Local file | Read tool | — | Full content, frontmatter if present |
| Inline text | Direct | — | As-is |

#### Parallel Fetch Strategy

For each source, launch **two tool calls in parallel**:
1. `mcp__web-search-prime__web_search_prime` — fast summary (always works, even with anti-scraping)
2. `mcp__web-reader__webReader` — full content (may fail for some Chinese sites)

Use whichever returns more content. If both succeed, prefer the reader output; if reader is truncated, merge with search summary.

#### Extraction

For each source, extract: title, author(s), date, body, image URLs, metadata.

### Stage 2: Extract & Annotate

Produce intermediate extraction (internal, not a deliverable):

- **Key Excerpts**: `[KEY]` prefix on important claims, data points
- **Source Attribution**: every excerpt gets `[Source: title + URL]`
- **Cross-Reference**: overlapping claims linked with `[SEE ALSO: ...]`
- **Data Points**: claims with values (claim, value, source, confidence)
- **Figure Inventory**: all images listed with descriptions and priority
- **Contradictions**: `[CONFLICT: ...]` where sources disagree
- **Gaps**: what's missing or needs verification

### Figure Handling (between Stage 2 and 3)

Reference: `skills/synapse-figure/SKILL.md` for full figure spec workflow.

Each figure gets a **title** — a short descriptive name derived from its editorial purpose in context, not a numeric index.

#### Step 1: Figure Inventory

For each image in the source, record:

| Field | Content | Example |
|-------|---------|---------|
| **URL** | original image URL | `https://arxiv.org/.../x7.png` |
| **Title** | short descriptive name from context | `token-dynamics`, `fkl-decomposition` |
| **Figure type** | category from figure skill | architecture map / benchmark chart / conceptual diagram |
| **Editorial purpose** | what this figure teaches | "explain bottleneck", "compare alternatives" |
| **Priority** | essential vs supplementary | essential = compresses understanding |

Only include figures that **compress understanding** — skip decoration, stock photos, author avatars, cover images not referenced in body text, and repeated info.

#### Step 2: Download & Validate

```bash
mkdir -p figures
curl -sL -o "figures/{source}-{title}.{ext}" "{url}"
```

**Naming**: `{source}-{title}.{ext}` where:
- `{source}` = author or project slug (e.g. `lirumor`, `tml`, `jiulaoshi`)
- `{title}` = descriptive name from Step 1 (e.g. `token-dynamics`, `kl-heatmap`)
- `{ext}` = actual file extension (verify after download)

**Validate** after download — servers may return HTML error pages instead of images:

```bash
file "figures/{source}-{title}.{ext}"
```

- If `HTML document` → download failed, delete file, proceed to Step 4 (prompt generation)
- If extension mismatch (e.g. `.png` but actually SVG) → rename to correct extension
- If file size < 1KB → likely error page, delete

Run downloads **in parallel** for multiple images in the same source.

#### Step 3: Classify Slot

Determine target slot based on source aspect ratio:

| Slot | Aspect Ratio | Use For |
|------|-------------|---------|
| `hero` | > 2:1 | Full-width banner, pipeline overview |
| `balanced` | ~4:3 | Architecture map, system diagram |
| `tight` | ~1:1 | Formula, icon grid, detail crop |

#### Step 4: Prompt Generation (when image needs recreation)

If download fails or image needs regeneration, write a prompt following `synapse-figure` prompt template:

```
Create a dense, clean engineering figure for a hard-core technical article.
Use white/light neutral background, restrained blue/teal and orange accents,
compact rounded rectangles, thin arrows, precise labels, explicit subsystem boundaries.
Explain [TOPIC] as a [FIGURE TYPE].
Keep it flat, technical, editorial.
Avoid: marketing aesthetics, 3D hardware art, decorative gradients, rainbow color coding, oversized icons, vague labels.
```

Delegate to `synapse-figure` (Imagen) for raster generation or `synapse-excalidraw` for hand-drawn style.

#### Step 5: DSL Reference

In DSL output, reference figures using **local paths** (not remote URLs):

| Status | `Image` field | `Prompt` field |
|--------|--------------|----------------|
| Downloaded OK | `figures/{source}-{title}.{ext}` | (optional, for recreation) |
| Download failed | (empty or placeholder) | generation prompt |
| Needs custom figure | (empty) | full prompt spec |

Figure paths in DSL always use relative paths from the output directory.

#### Figure Inventory File

After processing all sources, write `figures/index.md` in the figures directory. This is a quick-overview document for the user to browse all figures at a glance.

Format — group by source, render images inline with `![](path)`, annotate each figure with purpose and key data:

```markdown
# Figure Index

N figures from M sources.

## {Source Name}

### {source}-{title} — {descriptive title}

![{source}-{title}]({source}-{title}.{ext})

> {what this figure teaches}。{core data point it supports}

---
```

Key requirements:
- **Render inline**: use `![name](./figures/{source}-{title}.{ext})` so images display directly in markdown preview
- **Relative path**: always use `./figures/` prefix (relative to index.md location)
- **Annotate below**: blockquote (`>`) with purpose + key data point
- **Group by source**: use `##` headers per source
- **Separate with `---`**: each figure gets its own visual block
- **Key Data is critical**: link each figure to a specific quantitative claim so the user can judge which figures matter for synthesis

### Stage 3: Synthesize DSL

This is the core creative step. Read `FORGE-DSL.md` Section C for voice and style rules.

Take the extracted material and produce a DSL file (`*.dsl.md`). The user specifies the target format:

#### Target: Slides DSL

1. **Decide the one sentence** — what is actually new, what matters in practice
2. **Collect facts** from Stage 2 data points → these become Context page. **硬上限 3 条事实**。如果素材超过 3 个关键事实，只保留最重要的 3 个，其余下沉到 Mechanism 页面。如果难以取舍，暂停并请用户确认选择
3. **Grow questions** from facts → Agenda page (Q1-Q4, referencing fact numbers)
4. **One mechanism per slide** → Mechanism pages, each with pulse + visual prompt
5. **Q→A strict mapping** → Take A Ways (Q1→A1, Q2→A2, Q3→A3, Q4→pulse)
6. **Source list** → Reference page

Follow `FORGE-DSL.md` Section A for exact DSL syntax.

#### Target: Blog DSL

1. **Find the thesis** — one sentence that the whole piece defends
2. **Rebuild** around: real problem → design move → enabling details → tradeoffs → takeaway
3. **Do NOT mirror source heading order** — rebuild around what matters
4. **Add figures** only when they compress understanding — specify what each figure teaches
5. **End with hammer** — PULSE must reframe, not recap

Follow `FORGE-DSL.md` Section B for exact DSL syntax.

#### Synthesis Rules (from FORGE-DSL.md Section C)

- **Thesis first**, not section-by-section summary
- **Mechanism over praise** — explain how it works, not how great it is
- **One section, one hard point** — logically O(1)
- **End with aggressive pulse**, not soft landing
- **活人感** — like explaining to a colleague at 2am
- **祛魅原则** — translate buzzwords to concrete engineering reality
- **No oily phrases** — avoid "不是X而是X", "X的本质是X"

## Downstream

DSL 文件交给下游 skill 渲染：

| DSL 输出 | 渲染 Skill | 模板 |
|----------|-----------|------|
| Slides DSL | synapse (slides renderer) | `skills/synapse-design/references/WHYJ-SLIDES.html` |
| Blog DSL | synapse-pretext | `skills/synapse-pretext/examples/dsv4-blog-layout.html` |

## Trigger Phrases

- English: "Forge these sources", "Extract key points from", "Melt these down"
- Chinese: "熔炼这些素材", "提炼这些资料", "帮我整理这些来源", "把资料过一遍熔炉"
- Also triggers on: user provides URLs + asks for slides or blog output

## Quality Gate

1. **Sourced** — every claim traces to an input source
2. **Thesis-clear** — one sentence spine, no fluff
3. **Structure sound** — Slides: 事实→问题→机制→回答. Blog: problem→move→details→takeaway
4. **Voice correct** — WhyJ engineering tone, not corporate explainer
5. **DSL valid** — follows FORGE-DSL.md syntax, can be directly rendered
6. **Context 3-fact limit** — Context page 事实不超过 3 条。超出时只保留最重要的 3 条，其余下沉到 Mechanism 页面。难以取舍时暂停请用户确认

## Figure Naming Convention

导出的 figure 文件统一命名：

```
figure-XX-descriptivename.{svg,png,jpg}
```

- `XX` = 对应 slides 页码（如 Context=01, M1=03, M2=04, M3=05, M4=06）
- 所有 figure 放在 `figures/` 目录
- HTML 引用使用 `./figures/figure-XX-name.svg` 相对路径

## Prohibited

- NO hallucinated content — if source doesn't say it, don't include it
- NO summary-only output — forge produces DSL with judgment, not vague summaries
- NO oily marketing phrases — see FORGE-DSL.md Section C 句式红黑榜
- NO curly-quote string delimiters in rendered HTML — when rendering DSL to HTML (blog or slides), all JS content strings must use backtick template literals. Curly quotes `""` (U+201C/U+201D) are not valid JS string delimiters and cause SyntaxError white-screen failure
