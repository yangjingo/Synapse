---
name: synapse-forge
description: Raw material ingestion and refinement skill (熔炉). Accepts local files + URLs, extracts key excerpts, downloads screenshots, produces structured material for downstream synapse skills.
repository: https://github.com/yangjingo/Synapse
homepage: https://github.com/yangjingo/Synapse
version: 6.0
---

# Synapse Forge (熔炉)

Raw material → structured, cited, illustrated output. The first stage of any Synapse pipeline.

## Input Protocol

Accepts any combination of:

- **Local files**: `.md`, `.txt`, `.pdf`, `.html`, `.ipynb` — read via Read tool
- **URLs**: web articles, arXiv papers, blog posts, documentation — fetch via web-reader MCP
- **Inline text**: pasted content from user
- **Mixed**: local files + URLs + inline in a single request

## Processing Pipeline

### Stage 1: Fetch & Parse

| Input Type | Tool | Extraction |
|-----------|------|-----------|
| Local file | Read tool | Full content, frontmatter if present |
| URL | `mcp__web-reader__webReader` | Title, author, date, body, image URLs |
| arXiv | `mcp__web-reader__webReader` (HTML version) | Title, authors, abstract, sections, figures |
| Inline | Direct | As-is |

For each source, extract:
- Title, author(s), publication date
- Main content body (strip navigation, ads, boilerplate)
- All image/figure URLs with surrounding context
- Key metadata (paper type, source credibility)

### Stage 2: Extract & Annotate

- **Key Excerpts**: Mark important arguments, claims, data points with `[KEY]` prefix
- **Source Attribution**: Every excerpt gets `[Source: title + URL/path]` tag
- **Cross-Reference**: When multiple sources cover the same claim, link them with `[SEE ALSO: ...]`
- **Image Inventory**: List all images found, annotate which are "key figures" with descriptions
- **Contradictions**: Flag where sources disagree with `[CONFLICT: ...]`

### Stage 3: Structure & Refine

Produce unified `forge-output.md` following `FORGE-STYLE.md` format:

```markdown
# Forge Output: {topic}
Generated: YYYY/MM/DD

## Sources
- [Title](URL) — Author — Date — Type (paper/blog/docs)
- Local: `path/to/file` — description

## Key Excerpts
### Source: [Title](URL)
> [KEY] quoted passage here
> Context: why this matters

## Data Points
| Claim | Value | Source | Confidence |

## Figure Inventory
| # | Description | Source URL | Local Path | Priority |

## Gaps & Questions
- What's missing from the sources?
- What needs verification?
```

## Image/Screenshot Handling

1. **Identify**: For each URL source, scan for `<img>`, `<figure>`, `<svg>`, `<canvas>` elements
2. **Download**: Save key images to `assets/forge/{topic}/` via Bash (curl)
3. **Reference**: Each image gets both source URL and local path in output
4. **Flag**: If image cannot be downloaded, add to Figure Inventory with `synapse-figure` recreation note

## Downstream Integration

Forge output feeds directly into:

| Skill | What It Reads |
|-------|--------------|
| `synapse` (root, slides) | Key Excerpts + Data Points → slide content |
| `synapse-design` (blog) | Full output → blog.md thesis + evidence |
| `synapse-figure` | Figure Inventory → illustration prompts |
| `synapse-gif` | Figure Inventory + Data Points → animation targets |

## Trigger Phrases

- English: "Forge these sources", "Refine these materials", "Extract key points from", "Melt these down"
- Chinese: "熔炼这些素材", "提炼这些资料", "帮我整理这些来源", "把资料过一遍熔炉"

## Quality Gate

Before delivering forge output, verify:

1. **Sourced** — Every claim has a source tag, no floating assertions
2. **Contextual** — No orphan excerpts; all have context notes explaining relevance
3. **Complete Inventory** — All images from sources are listed (downloaded or flagged)
4. **Downstream-Ready** — Output can be consumed by other skills without re-fetching
5. **No Duplication** — Cross-referenced overlapping sources, merged where redundant

## Prohibited

- NO hallucinated content — if a source doesn't say it, don't include it
- NO unsourced claims — every data point must trace to an input
- NO summary-only output — forge produces excerpts + annotations, not vague summaries
