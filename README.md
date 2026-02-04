# Synapse

<div align="center">

<img src="assets/logo.png" alt="Synapse Logo" width="180">

**Your AI-powered research blog writing assistant**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE.txt)
[![Claude](https://img.shields.io/badge/Claude-Skill-purple.svg)](https://claude.ai)

</div>

## Overview

Synapse is a [Claude Skill](https://claude.ai/docs/skills) that helps you write technical blog posts following the styles of the world's leading AI research institutions. Like a synapse connecting ideas to expression, it bridges the gap between research papers and engaging technical content.

## Installation

```bash
claude plugin install https://github.com/yangjingo/Synapse
```

Verify installation:
```bash
claude plugin list
```

## Usage

The skill automatically activates when you ask Claude to:
- Write technical blog posts about AI/ML research
- Analyze research papers for blog content
- Create engineering blog posts
- Polish or improve technical writing
- Translate technical content between English and Chinese

### Example Prompts

| Task | Prompt |
|------|--------|
| **Research Blog** | "Write a blog post about 'Attention Is All You Need' following Anthropic's style" |
| **Paper Analysis** | "Analyze this research paper and extract key contributions" |
| **Engineering Blog** | "Write an engineering blog following OpenAI's Challenge→Solution structure" |
| **Polishing** | "Review and improve this technical blog post" |
| **Translation** | "Translate this technical content from English to Chinese" |

### Available Styles

- **OpenAI** - Concise, data-driven, Challenge→Solution structure
- **Anthropic** - Academic rigor with extensive examples, explicit limitations
- **DeepMind** - Minimalist, performance-focused
- **Karpathy** - Conversational, 深入浅出, with "Tips & tricks"
- **Yi Tay** - Personal narrative, gratitude, growth mindset

## Features

### Ready-to-Use Templates
- Research Paper Blog
- Engineering / "How We Built" Blog
- Tutorial / How-To Guide
- Personal Reflection
- Quick Notes

### Resources
- **Style Guides** - Writing patterns from each institution/researcher
- **Annotated Examples** - Real posts with style breakdowns
- **Checklists** - Pre-publish quality verification
- **Paper Analyzer** - Extract key insights from PDFs

## Directory Structure

```
synapse/
├── SKILL.md                    # Main skill file
├── assets/templates/           # Markdown templates
├── references/                 # Style guides, examples, checklists
└── scripts/paper_analyzer.py   # Paper analysis utility
```

## Resources

- [OpenAI Research](https://openai.com/research)
- [Anthropic Research](https://www.anthropic.com/research)
- [DeepMind Research](https://deepmind.google/research/)
- [xAI Blog](https://x.ai/blog)
- [Lilian Weng's Blog](https://lilianweng.github.io/)
- [The Thinking Machine](https://thinkingmachine.org/)
- [Andrej Karpathy's Blog](http://karpathy.github.io/)
- [Yi Tay's Blog](https://www.yitay.net/blog)

## License

MIT License - see [LICENSE.txt](LICENSE.txt) for details.

---

<div align="center">

<strong>Synapse</strong> — Where research meets writing

</div>
