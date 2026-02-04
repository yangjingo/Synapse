---
name: synapse
description: AI-powered research blog writing assistant. Use when: writing technical blogs about AI/ML research, analyzing research papers for blog content, creating engineering posts following OpenAI/Anthropic/DeepMind style, polishing technical writing, or translating technical content between English and Chinese.
license: MIT. LICENSE.txt has complete terms
---

# Synapse - AI Tech Blog Writing Assistant

## Overview

Synapse connects research to writing, helping you create technical blog posts inspired by the world's leading AI research institutions and researchers.

The skill provides:
- Style guides and language patterns from each institution/researcher
- Complete templates for different blog post types
- Annotated examples with style breakdowns
- Pre-publish quality checklist
- Paper analysis script for extracting key insights

## Quick Start

### For Research Paper Blogs
1. Analyze the paper to extract insights (use paper_analyzer.py or manual extraction)
2. Choose the Research Paper template from `assets/templates/`
3. Draft following Anthropic Research style (examples in `references/EXAMPLES.md`)
4. Polish and review with checklist in `references/CHECKLIST.md`

### For Engineering Blogs
1. Use Engineering Blog template from `assets/templates/`
2. Follow Challenge → Solution structure (OpenAI Engineering style)
3. Include metrics tables and Before/After comparisons
4. Add Lessons Learned section

## Blog Type Decision Guide

### Research Paper Blog
Use when: Explaining a paper, novel technique, or research findings
- Recommended style: Anthropic Research or Karpathy
- Template: `assets/templates/research_paper_blog.md`
- Key elements: Problem statement, contributions, results, limitations

### Engineering Blog
Use when: System design, infrastructure, "how we built" posts
- Recommended style: OpenAI Engineering
- Template: `assets/templates/engineering_blog.md`
- Key elements: Background, challenges, solutions, metrics

### Tutorial/How-To
Use when: Teaching concepts or techniques
- Recommended style: Karpathy
- Key elements: Step-by-step guide, code examples, pro tips

### Personal Reflection
Use when: Career lessons, growth mindset
- Recommended style: Yi Tay
- Key elements: Personal narrative, gratitude, data sharing

## Reference Files

### Style Guides
`references/STYLE_GUIDES.md` - Detailed writing patterns for each style:
- OpenAI Research: Problem → Method → Results → Limitations
- OpenAI Engineering: Challenge → Solution with metrics tables
- Anthropic Research: Definition → Findings → Looking Forward
- Anthropic Engineering: Principles with numbered lists
- Karpathy: Conversational with "Tips & tricks"
- Yi Tay: Personal narrative with gratitude

### Templates
`references/TEMPLATES.md` - Complete templates for:
- Research Paper Blog
- Engineering Blog
- Tutorial/How-To
- Personal Reflection
- Quick Notes

`assets/templates/` - Copy-ready markdown templates:
- `research_paper_blog.md`
- `engineering_blog.md`

### Examples
`references/EXAMPLES.md` - Annotated real examples from:
- OpenAI: "Scaling PostgreSQL to power 800M users"
- Anthropic: "Disempowerment patterns in real-world AI usage"
- Anthropic: "How we built our multi-agent research system"
- Karpathy: "A Recipe for Training Neural Networks"

### Checklist
`references/CHECKLIST.md` - Pre-publish quality checklist covering:
- Content quality
- Structure & flow
- Technical accuracy
- Style consistency
- Visual elements
- Publication readiness

## Scripts

`scripts/paper_analyzer.py` - Extract key insights from research papers:

```bash
python scripts/paper_analyzer.py /path/to/paper.pdf
```

Extracts:
- Title and abstract
- Key contributions
- Method summary
- Results and metrics
- Limitations

## Key Style Principles

### OpenAI Style
- Concise, data-driven
- Challenge → Solution structure
- Metrics tables (Before/After)
- Engineering reliability focus
- "This is the story of how we..." framing

### Anthropic Style
- Academic but accessible
- Extensive concrete examples
- Numbered definitions
- Explicit "Limitations" section
- "Looking forward" conclusions

### Karpathy Style
- Conversational,深入浅出
- Code + intuition explanations
- "Tips & tricks" bulleted sections
- "What's happening" explanation blocks
- Humorous touches ("reaaally", "unfortunately")

### Yi Tay Style
- Personal narrative elements
- Gratitude and acknowledgements prominent
- Growth mindset framing
- Personal data/metrics sharing
- "When I first saw..." openings

## Writing Workflow

1. **Analyze** - Extract key insights from source material
2. **Structure** - Choose appropriate template and outline
3. **Draft** - Write following style guidelines
4. **Polish** - Apply style-specific improvements
5. **Review** - Use checklist in `references/CHECKLIST.md`
