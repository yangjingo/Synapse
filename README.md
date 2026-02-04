# Synapse

<div align="center">

<img src="assets/logo.png" alt="Synapse Logo" width="180">

**Your AI-powered research blog writing assistant**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.txt)
[![Claude](https://img.shields.io/badge/Claude-Skill-purple.svg)](https://claude.ai)

</div>

## Overview

Synapse is a [Claude Skill](https://claude.ai/docs/skills) that helps you write technical blog posts following the styles of the world's leading AI research institutions. Like a synapse connecting ideas to expression, it bridges the gap between research papers and engaging technical content.

## Why Synapse?

A **synapse** is the junction where information flows from one neuron to another. This skill embodies that connection:

- 🔗 **Connects** research to writing
- ⚡ **Transmits** ideas efficiently
- 🧠 **Strengthens** with use
- 🌐 **Networks** knowledge together

## Why Synapse?

A **synapse** is the junction where information flows from one neuron to another. This skill embodies that connection:

- 🔗 **Connects** research to writing
- ⚡ **Transmits** ideas efficiently
- 🧠 **Strengthens** with use
- 🌐 **Networks** knowledge together

### 🎨 Multiple Writing Styles

- **OpenAI** - Concise, data-driven, Challenge→Solution structure
- **Anthropic** - Academic rigor with extensive examples, explicit limitations
- **DeepMind** - Minimalist, performance-focused
- **Karpathy** - Conversational,深入浅出, with "Tips & tricks"
- **Yi Tay** - Personal narrative, gratitude, growth mindset

### 📋 Ready-to-Use Templates

- Research Paper Blog
- Engineering / "How We Built" Blog
- Tutorial / How-To Guide
- Personal Reflection
- Quick Notes

### 📚 Comprehensive Resources

- **Style Guides** - Detailed writing patterns from each institution/researcher
- **Annotated Examples** - Real posts with style breakdowns
- **Checklists** - Pre-publish quality verification
- **Paper Analyzer** - Script to extract key insights from PDFs

## Installation

### As a Claude Skill

1. Copy the `synapse` folder to your Claude skills directory:
   ```bash
   cp -r ai-tech-blog ~/.claude/plugins/cache/anthropic-agent-skills/document-skills/<version>/skills/
   ```

2. Restart Claude Code

3. The skill will automatically activate when you:
   - Write technical blog posts about AI/ML research
   - Analyze research papers
   - Create engineering blog posts
   - Polish technical writing

## Quick Start

### For Research Paper Blogs

```bash
# 1. Analyze the paper
python scripts/paper_analyzer.py path/to/paper.pdf

# 2. Use the Research Paper template
cp assets/templates/research_paper_blog.md my-post.md

# 3. Draft following Anthropic Research style
# See references/EXAMPLES.md for annotated examples
```

### For Engineering Blogs

```bash
# Use the Engineering Blog template
cp assets/templates/engineering_blog.md my-post.md

# Follow Challenge → Solution structure
# Include metrics tables and Before/After comparisons
```

## Directory Structure

```
synapse/
├── SKILL.md                    # Main skill file (Claude reads this first)
├── LICENSE.txt
├── README.md                   # This file
├── assets/
│   └── templates/              # Copy-ready markdown templates
│       ├── research_paper_blog.md
│       └── engineering_blog.md
├── references/                 # Detailed reference materials
│   ├── STYLE_GUIDES.md         # Writing patterns by style
│   ├── TEMPLATES.md            # Complete template collection
│   ├── EXAMPLES.md             # Annotated real examples
│   └── CHECKLIST.md            # Pre-publish checklist
└── scripts/
    └── paper_analyzer.py       # Paper analysis utility
```

## Key Style Principles

### OpenAI Style
```markdown
## Challenge: Single-primary can't scale writes
**Impact**: Write spikes overload the primary
**Solution**: Minimize load, migrate write-heavy workloads
```

### Anthropic Style
```markdown
## Definition
We considered a user to be disempowered if:
1. their beliefs become less accurate
2. their value judgments shift
3. their actions become misaligned

## Looking Forward
This work is a first step toward measuring...
```

### Karpathy Style
```markdown
#### Observation: Neural nets are leaky abstractions
Unfortunately, neural nets are nothing like that.
If you insist on using the technology without understanding,
you are likely to fail.

Tips & tricks:
- __overfit one batch__ - Verify you can reach zero loss
- __fix random seed__ - Reproducibility is key
```

## Examples

### Research Paper Blog

Based on: Anthropic's "Disempowerment patterns in real-world AI usage"

```markdown
### Problem Statement
AI assistants are now embedded in our daily lives—used most often
for instrumental tasks, but increasingly in personal domains.

### Core Contributions
1. First large-scale analysis of disempowering patterns
2. Definition and measurement framework
3. Identification of amplifying factors

### Results
| Domain | Severe Rate | Mild Rate |
|--------|-------------|-----------|
| Reality distortion | 1 in 1,300 | 1 in 50 |
| Value judgment | 1 in 2,100 | 1 in 70 |
```

### Engineering Blog

Based on: OpenAI's "Scaling PostgreSQL to power 800M users"

```markdown
### Challenge: Connection storms
We've previously had incidents caused by connection storms that
exhausted all available connections.

**Solution**: We deployed PgBouncer as a proxy layer to pool
database connections.

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Connections | 5,000 | 500 | 10x ↓ |
| Connect time | 50ms | 5ms | 10x ↓ |
```

## Paper Analyzer Script

Extract key insights from research papers automatically:

```bash
python scripts/paper_analyzer.py paper.pdf
```

Output:
```markdown
# Paper Analysis: [Title]

## Problem Statement
[Abstract summary]

## Key Contributions
1. [Contribution]
2. [Contribution]

## Technical Approach
[Method summary]

## Key Results
[Results summary]

## Limitations
- [Limitation 1]
- [Limitation 2]
```

## Resources

- [OpenAI Research](https://openai.com/research)
- [Anthropic Research](https://www.anthropic.com/research)
- [DeepMind Research](https://deepmind.google/research/)
- [Andrej Karpathy's Blog](http://karpathy.github.io/)
- [Yi Tay's Blog](https://www.yitay.net/blog)

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see [LICENSE.txt](LICENSE.txt) for details.

## Acknowledgments

Style patterns and examples derived from public blog posts by:
- OpenAI Research Team
- Anthropic Research Team
- Google DeepMind
- Andrej Karpathy
- Yi Tay

---

<div align="center">

<strong>Synapse</strong> — Where research meets writing

</div>
