# Forge Output Style Guide

Output format specification for `synapse-forge` refined material.

## File Naming

`forge-output.md` — single unified file per topic.

## Template

```markdown
# Forge Output: {topic}
Generated: YYYY/MM/DD

## Sources

- [Title](URL) — Author — YYYY/MM/DD — Type
- Local: `path/to/file` — brief description

## Key Excerpts

### Source: [Title](URL)

> [KEY] Exact quoted passage from the source.

Context: Why this matters for the topic. What question it answers.

> [KEY] Another important passage.

Context: Connection to other sources or downstream use.

### Source: Local: `path/to/file`

> [KEY] Quoted content from local file.

Context: Relevance note.

## Data Points

| Claim | Value | Source | Confidence |
|-------|-------|--------|-----------|
| Claim text | Numeric or categorical value | [Source](URL) | high/medium/low |

## Figure Inventory

| # | Description | Source URL | Local Path | Priority |
|---|-------------|-----------|------------|----------|
| 1 | Architecture diagram showing X | https://... | `assets/forge/topic/fig1.png` | high |
| 2 | Performance comparison table | https://... | `assets/forge/topic/fig2.png` | medium |
| 3 | Concept X visualization | — | _flag: synapse-figure recreate_ | high |

## Cross-References

- **Claim A** appears in Source 1 and Source 3 — consistent
- **Claim B** in Source 2 **contradicts** Source 4 — [CONFLICT: Source 2 says X, Source 4 says Y]

## Gaps & Questions

- Source 1 lacks numerical evidence for claim Z
- No source covers topic sub-area W
- Verification needed: [specific claim or data point]
```

## Annotation Markers

| Marker | Meaning |
|--------|---------|
| `[KEY]` | Critical excerpt, core to the topic |
| `[SEE ALSO: Source]` | Cross-reference to another source covering same point |
| `[CONFLICT: ...]` | Sources disagree on this point |
| `_flag: synapse-figure recreate_` | Image needs illustration, not downloadable |
| `high/medium/low` | Confidence level for data points |

## Confidence Levels

- **high**: Stated directly in source, verifiable, multiple sources agree
- **medium**: Inferred from source, single source, or unclear methodology
- **low**: Speculative, from non-primary source, or unverifiable
