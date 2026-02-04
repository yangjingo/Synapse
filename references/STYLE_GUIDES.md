# Style Guides for AI Tech Blog Writing

Comprehensive writing style patterns from frontier research institutions and prominent AI researchers.

## Table of Contents

1. [OpenAI Research Style](#openai-research-style)
2. [OpenAI Engineering Style](#openai-engineering-style)
3. [Anthropic Research Style](#anthropic-research-style)
4. [Anthropic Engineering Style](#anthropic-engineering-style)
5. [DeepMind Style](#deepmind-style)
6. [Andrej Karpathy Style](#andrej-karpathy-style)
7. [Yi Tay Style](#yi-tay-style)

---

## OpenAI Research Style

### Content Structure

```
Problem Statement → Method → Results → Discussion → Limitations
```

### Title Patterns
- "Detecting and reducing scheming in AI models"
- "Learning to reason with LLMs"
- "Introducing [Model Name]"
- "How AI Is [Action] [Context]"

### Language Templates

**Opening hooks:**
- "For years, [system/technology] has been [state]..."
- "Our research will eventually lead to [goal]..."
- "We believe [principle]..."

**Problem description:**
- "This is a [adjective] problem because [reason]..."
- "The key challenge is: [one-sentence problem]"
- "Despite [progress], [remaining challenge] persists..."

**Method introduction:**
- "To address this, we [approach]..."
- "Our approach consists of [N] components..."
- "We [verb] by [method]..."

**Results presentation:**
- "We found that [finding]..."
- "Our method achieves [metric] of [value]..."
- "Compared to [baseline], we observe [improvement]..."

**Limitations:**
- "Our approach has several limitations..."
- "First, [limitation]... Second, [limitation]..."

### Key Characteristics
- Concise paragraphs (2-4 sentences)
- Data-driven claims
- Specific metrics (e.g., "95.2% accuracy")
- Minimal jargon without explanation

---

## OpenAI Engineering Style

### Content Structure

```
Background → Challenge(s) → Solution(s) → Results → Future Work
```

### Title Patterns
- "Scaling [System] to power [Scale] [Users/Requests]"
- "How we scaled [System] to [Scale]"
- "Building [Feature] at OpenAI"

### Language Templates

**Opening:**
- "For years, [System] has been one of the most critical, under-the-hood systems powering [Products]..."
- "As our user base grows rapidly, the demands on our [System] have increased exponentially..."
- "Our efforts to [goal] revealed a new insight: [insight]..."
- "This is the story of how we've [action] at OpenAI to [result]..."

**Challenge description:**
- "**_Challenge:_** With [constraint], [problem]..."
- "We identified several [issues] in [system]. In the past, [consequence]..."
- "It may sound surprising that [fact]; however, [explanation]..."

**Solution description:**
- "**_Solution:_** We [action] to [goal]..."
- "To mitigate [problem], we've [solution]..."
- "We implemented [solution] which [effect]..."

**Results:**
- "This effort demonstrates that with [conditions], [system] can [result]..."
- "We consistently deliver [metrics] in production..."
- "Over the past [time], we've had only [X] SEV-0 incidents..."

### Key Characteristics
- **Challenge → Solution** structure with subheadings
- Metrics tables (Before/After comparisons)
- Production reliability focus
- Honest discussion of SEVs (incidents)
- Specific technical details (configs, numbers)

---

## Anthropic Research Style

### Content Structure

```
Background → Problem Definition → Methodology → Findings → Discussion → Looking Forward → Limitations
```

### Title Patterns
- "[Concept] patterns in [Context]"
- "The [Concept] axis: [Subtitle]"
- "How [AI/System] [Action] [Target]"
- "Next-generation [System/Method]"

### Language Templates

**Opening:**
- "[System] are now embedded in [context]—used most often for [primary use], but increasingly in [secondary use]..."
- "In the vast majority of cases, [typical outcome]... However, [exception/risk]..."
- "As part of our research into [area], we're publishing [content]... We focus on [focus]..."

**Problem definition:**
- "To study [topic] systematically, we needed to define [concept]..."
- "We considered [X] to be [condition] if as a result of [interaction]: 1. [criterion1] 2. [criterion2] 3. [criterion3]..."
- "For example, a user who [scenario]... We would consider their interactions to be [classification] if..."

**Methodology:**
- "We used these definitions with [method] to examine [data]..."
- "Across the vast majority of [observations], we saw [pattern]..."
- "We also looked at different [dimensions] to determine [question]..."

**Findings:**
- "The most common form of [category] was [finding], which occurred in [frequency]..."
- "We also found that [pattern]... suggesting that [implication]..."

**Discussion:**
- "What's notable across these patterns is that [observation]..."
- "Most concerning were cases of [category]... Here, users [behavior]..."

**Limitations:**
- "Our research has important limitations..."
- "It is restricted to [scope]..."
- "We primarily measure [proxy] rather than [true outcome]..."

### Key Characteristics
- Extensive concrete examples/scenarios
- Numbered definitions for key concepts
- Data visualizations with detailed captions
- Explicit "Limitations" section
- "Looking forward" conclusion section

---

## Anthropic Engineering Style

### Content Structure

```
Problem Background → Architecture Overview → Technical Deep Dive → Evaluation → Production Challenges → Conclusion
```

### Title Patterns
- "How we built our [System]"
- "Effective [Concept] for [Domain]"
- "Writing [Tools] for AI Agents — with AI Agents"
- "Building [Systems] with the [SDK]"

### Language Templates

**Opening:**
- "[System] now has [Capability] that allow it to [Action]..."
- "The journey of this [System] from prototype to production taught us critical lessons about [Lesson1], [Lesson2], and [Lesson3]..."
- "This post breaks down the principles that worked for us—we hope you'll find them useful to apply when building your own [Systems]..."

**Benefits:**
- "[Problem] involves [characteristics]..."
- "This unpredictability makes [approach] particularly well-suited for [domain]..."
- "Our internal evaluations show that [system] [performance]..."

**Principles (numbered):**
- "1. **__[Principle]__**. [Explanation]..."
- "The essence of [concept] is [definition]..."

**Evaluation:**
- "__[Method]__... [Implementation details]..."
- "This method was especially effective when [condition]..."
- "Even in a world of [automation], [manual aspect] remains essential..."

**Engineering challenges:**
- "__[Challenge Category]__... [Details]..."
- "In traditional software, [contrast]... In [domain], [difference]..."
- "When building [systems], the last mile often becomes most of the journey..."

**Conclusion:**
- "Despite these challenges, [system] has proven valuable for [use case]..."
- "[System] can operate reliably at scale with [requirements]..."
- "We're already seeing these systems [impact]..."

### Key Characteristics
- Multi-agent system coordination focus
- "Principles" with numbered lists
- Prompt engineering insights
- LLM-as-judge evaluation methods
- Production reliability discussions

---

## DeepMind Style

### Content Structure

```
Introduction → Background → Method → Results → Discussion → Conclusion
```

### Title Patterns
- "[Model Name]: A [Adjective] [Type] for [Task]"
- "Scaling [Concept] with [Method]"
- "Towards [Goal]: [Subtitle]"

### Language Templates

**Opening:**
- "We introduce [Model/Method], a [description] that achieves [result]..."
- "Recent advances in [field] have enabled [capability]..."
- "Here we show [finding]..."

**Method:**
- "Our approach consists of [N] stages..."
- "We build on [previous work] by [innovation]..."

**Results:**
- "[Model] achieves state-of-the-art performance on [benchmark]..."
- "We demonstrate that [finding]..."

### Key Characteristics
- Minimalist, content-focused
- Clear visualizations
- Emphasis on SOTA performance
- Concise descriptions

---

## Andrej Karpathy Style

### Content Structure

```
Hook → Observations → Philosophy → Detailed Steps → Tips & Tricks → Conclusion
```

### Title Patterns
- "A Recipe for [Task]"
- "Software 2.0"
- "Yes you should understand [Concept]"
- "[Topic]: [Subtitle]"

### Language Templates

**Opening:**
- "Some few weeks ago I [action]... The [response] got quite a bit more engagement than I anticipated..."
- "So I thought it could be fun to [action]... However, instead of [expected], I wanted to [actual]..."

**Observations/Philosophy:**
- "#### [N]. [Observation Title]"
- "Here's what's going on..." [Intuitive explanation]
- "The trick to doing so is [method]..."

**Steps (numbered with ####):**
- "#### [N]. [Step Title]"
- "**Tips & tricks for this stage:**"
  - "__[Tip]__..."
  - "__[Tip]__..."

**Tone indicators:**
- "reaaally difficult to over-emphasize"
- "unfortunately / luckily / shockingly"
- "for sure no / just kidding"
- "conquer world here"

**Code style:**
```python
# Key intuition: [explanation]
def function():
    # Step 1: [action]
    result = process(input)
    # Step 2: [action]
    return final
```

> **What's happening**: The key idea is that [intuition].

### Key Characteristics
- Conversational, blog-like tone
- Humor and personality
- "Tips & tricks" bulleted sections
- Bold emphasis for key points
- Code with intuitive explanations
- Deep technical but accessible

---

## Yi Tay Style

### Content Structure

```
Personal Hook → Gratitude → Growth Reflection → Technical Content → Acknowledgements → Final Words
```

### Title Patterns
- "Leaving [Company/Role]"
- "Training great LLMs entirely from ground up in the wilderness"
- "On [Concept], [Concept2] and [Concept3]"
- "What happened to [Model/Architecture]?"

### Language Templates

**Opening:**
- "When I first saw [reference]'s '[title]' post, it was hard to imagine that one day I would be writing mine..."
- "After about [time] of being at [role], I've decided to [decision]..."
- "In my own eyes, this indeed feels like [metaphor]..."

**Gratitude:**
- "I learned so much..."
- "From the deepest depths of my heart, I thank [names]..."
- "Big thanks and shout out to [names]..."

**Growth reflection:**
- "From a broader perspective, I learned [lesson]..."
- "If I had to characterise my growth, I think that [description]..."
- "I am of the opinion that [belief]..."

**Data sharing:**
- "Here is some proof..."
- "I wrote a total of ~[N] [items] over [time]..."
- "A fun fact is that..."

**Closing:**
- "The [time period] has been amazing and wonderful..."
- "What's next? That'll have to wait for another time!"
- "Remember, this post is about [theme]..."

### Key Characteristics
- Personal narrative elements
- Gratitude and acknowledgements prominent
- Growth mindset framing
- Sharing personal data/metrics
- Photos and personal touches
- Appendix sections for supplementary content

---

## Cross-Cutting Best Practices

### For All Styles
1. **Start with concrete examples** before abstract patterns
2. **Use numbered lists** for key definitions/steps
3. **Include code snippets** with explanatory comments
4. **Add figures/diagrams** with descriptive captions
5. **Acknowledge limitations** explicitly
6. **Cite sources** properly

### Opening Hooks
- **Problem-driven**: "The challenge is..."
- **Story-driven**: "When I first..."
- **Insight-driven**: "Some few weeks ago..."
- **Research-driven**: "As part of our research..."

### Ending Templates
- **Looking forward**: "Until now, concerns about... This work is a first step toward..."
- **Action-oriented**: "Get started with... today"
- **Reflective**: "The [period] has been... I'm excited for..."
- **Summary**: "The most important lesson is..."

### Figure/Table Captions
- "Figure 1: [Description]. Notably, [key insight]."
- "Table 1: [Description]. The [metric] shows [pattern]."
