# Synapse Forge (熔炉)

URLs → DSL. 给一堆素材，出结构化 DSL 文件。

## 产出示例

- For complete repository examples, see the [OPD article](../../../../examples/opd/opd-blog.dsl.md) and [matching deck](../../../../examples/opd/opd-slides.dsl.md).

## Pipeline

```
Stage 1: Fetch      — URLs/文件 → 原始内容
Stage 2: Extract    — 原始内容 → 关键摘录 + 数据点
Stage 3: Synthesize — 摘录 + 数据点 → DSL（.dsl.md）
```

最终产出：一个 `.dsl.md` 文件，交给Slides 或 Tech Blog 的工作流渲染为 HTML。

### Stage 1: Fetch & Parse

#### MCP Service Setup (智谱 GLM)

Forge 依赖两个 MCP 服务进行网页抓取和搜索，均由智谱 AI (`open.bigmodel.cn`) 提供，需要 API Token。

在 `~/.claude.json` 的 `mcpServers` 中配置：

```json
{
  "mcpServers": {
    "web-search-prime": {
      "type": "http",
      "url": "https://open.bigmodel.cn/api/mcp/web_search_prime/mcp",
      "headers": {
        "Authorization": "Bearer {YOUR_GLM_API_KEY}"
      }
    },
    "web-reader": {
      "type": "http",
      "url": "https://open.bigmodel.cn/api/mcp/web_reader/mcp",
      "headers": {
        "Authorization": "Bearer {YOUR_GLM_API_KEY}"
      }
    }
  }
}
```

- **Token 获取**: 在 [智谱开放平台](https://open.bigmodel.cn/) 注册并创建 API Key
- **web-search-prime**: 网页搜索，支持 `content_size=high`（2500 字摘要）和 `location=cn`（中文内容优化）
- **web-reader**: 网页全文抓取，支持 `retain_images=true`（保留图片 URL）和 `with_images_summary=true`（图片摘要）
- 两个服务共用同一个 API Key

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

#### Image Extraction from Web Sources

When source articles contain figures that need to be downloaded (especially Chinese sites like WeChat, Zhihu):

```
mcp__web-reader__webReader(
  url: "https://mp.weixin.qq.com/s/...",
  return_format: "markdown",
  retain_images: true,
  with_images_summary: true
)
```

- `retain_images: true` — preserves all image URLs in the markdown output
- `with_images_summary: true` — adds an images summary section listing all extracted images
- **Critical for WeChat articles**: WeChat CDN images (`mmbiz.qpic.cn`) are only accessible with proper referer. The web-reader fetches them during page parsing when the referer is correct. Extract URLs from the output, then download with curl:

```bash
mkdir -p figures
curl -sL -o "figures/{name}.png" "{image_url}"
```

- Verify downloads: `file figures/*.png` — reject any that are `HTML document` (error pages)
- For arXiv: use `mcp__web-reader__webReader` on the HTML version URL to get image paths in `/html/{id}vN/x{N}.png` format

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
mkdir -p figures                # within target example root, e.g. examples/<project>/figures
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

If download fails or image needs regeneration, compose the prompt before calling any renderer:

1. State the point the figure needs to show, its composition, and the actual labels, values, and units. For an architecture diagram, include component boundaries, the main path, and the attachment points for each arrow.
2. Apply any `examples/<project>/DESIGN.md` controls before generation. Append the `Figure prompt suffix / 风格控制` and include `文件落地` and display constraints.
3. Move explanatory sentences into the caption or article. When the remaining elements crowd the panel, use a separate detail view or split the comparison into aligned panels.
4. Inspect the rendered figure at its embedded size. Confirm that the main relationship is legible from the geometry and short labels and that arrows, labels, and axes stay distinct.

Render raster illustrations from the filled-in prompt using the Codex built-in `$imagegen` skill and its default `image_gen` tool mode.

Do not route raster generation through Gemini, Imagen APIs, Nano Banana, or another external provider. If built-in `image_gen` is unavailable or fails, report the failure; use the `$imagegen` CLI/API fallback only after explicit user approval. Choose SVG/manual generation directly only when the requested artifact is intentionally vector/code-native, and record that path in `figures/index.md`.

### Mandatory output contract (for SKILL-compliant examples)

For final slide examples, every planned visual must be rendered and referenced through `::image [./figures/...]`. Do not leave `::visual`, `Codex imagegen`, `Figure prompt`, or another prompt block visible in slides HTML. Preserve reusable prompts in `figures/index.md`, not in the presentation canvas. Validate with `node skills/synapse-talk-slides/scripts/validate-slide-visuals.js`.

- Write every generated figure into `./figures/` under the target example root (`./examples/<project>/figures`).
- File names must be local and HTML-consumable (PNG/JPG/SVG), defaulting to `figure-XX-descriptivename.*`.
- Keep the project's visual style controls intact. Use consistent color and line semantics across figures in the same artifact.
- Generated prompts must preserve the final concatenated style block in `figures/index.md` (`figure_style`) and record `generated_by` for traceability.

#### Step 5: DSL Reference

In DSL output, reference figures using **local paths** (not remote URLs):

| Status | `Image` field | `Prompt` field |
|--------|--------------|----------------|
| Downloaded OK | `figures/{source}-{title}.{ext}` | (optional, for recreation) |
| Download failed | (empty or placeholder) | generation prompt |
| Needs custom figure | (empty) | full prompt spec |

Figure paths in DSL always use relative paths from the output directory.
- For example outputs under `examples/<project>/`, place generated files in `./figures/` and reference paths as `./figures/...` (so HTML can load them directly).

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
- **Generation metadata**: append at least one line in the blockquote with `generated_by` and `figure_style` and note whether fallback occurred

### Stage 3: Synthesize DSL

Use the extracted evidence to build a DSL in the requested format. Use `synapse-life-note` to capture or synthesize working material. Use `synapse-tech-blog` for a full reader-facing technical argument.

Take the extracted material and produce a DSL file (`*.dsl.md`). The user specifies the target format:

#### Target: Slides DSL

1. **Decide the one sentence** — what is actually new, what matters in practice
2. **Collect facts** from Stage 2 data points → these become Context page. **硬上限 3 条事实**。如果素材超过 3 个关键事实，只保留最重要的 3 个，其余下沉到 Mechanism 页面。如果难以取舍，暂停并请用户确认选择
3. **Grow questions** from facts → Agenda page (Q1-Q4, referencing fact numbers)
4. **One mechanism per slide** → Mechanism pages, each with pulse + visual prompt
5. **Q→A strict mapping** → Take A Ways (Q1→A1, Q2→A2, Q3→A3, Q4→pulse)
6. **Source list** → Reference page

#### Target: Blog DSL

Encode the verified question, claims, sources, and planned figures in the working DSL. Preserve the evidence boundary and identify unresolved gaps.

## Downstream

DSL 文件交给下游 skill 渲染：

| DSL 输出 | 渲染 Skill | 模板 |
|----------|-----------|------|
| Slides DSL | synapse-talk-slides | [Why.J Theater Slides](../../../synapse-talk-slides/templates/whyj-slides.html) |
| Blog DSL | synapse-tech-blog | [Why.J Theater 博客](../../templates/whyj-theater-blog.html) |

## Trigger Phrases

- English: "Forge these sources", "Extract key points from", "Melt these down"
- Chinese: "熔炼这些素材", "提炼这些资料", "帮我整理这些来源", "把资料过一遍熔炉"
- Also triggers on: user provides URLs + asks for slides or blog output

## Quality Gate

1. **Sourced** — every claim traces to an input source
2. **Thesis-clear** — one sentence spine, no fluff
3. **Structure sound** — Slides: 事实→问题→机制→回答. Blog: problem→move→details→takeaway
4. **Voice correct** — WhyJ engineering tone, not corporate explainer
5. **DSL valid** — follows FORGE.DSL.md syntax, can be directly rendered
6. **Context 3-fact limit** — Context page 事实不超过 3 条。超出时只保留最重要的 3 条，其余下沉到 Mechanism 页面。难以取舍时暂停请用户确认

## Figure Naming Convention

导出的 figure 文件统一命名：

```
figure-XX-descriptivename.{svg,png,jpg}
```

- `XX` = 对应 slides 页码（如 Context=01, M1=03, M2=04, M3=05, M4=06）
- 所有 figure 放在 `figures/` 目录
- HTML 引用使用 `./figures/figure-XX-name.svg` 相对路径

## Check the rendered output

- Trace each claim to its evidence and mark inferences or missing evidence.
- Resolve figure placeholders before delivery. Keep generation prompts with the source material. Verify that figure placement and zoom match the selected template.
- Enable the browser console when opening the result. Use valid JavaScript delimiters in code and preserve the source punctuation inside strings.
