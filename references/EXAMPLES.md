# Annotated Examples

Real examples from frontier research institutions and AI researchers with style annotations.

## Table of Contents

1. [OpenAI: Scaling PostgreSQL](#openai-scaling-postgresql)
2. [Anthropic: Disempowerment Patterns](#anthropic-disempowerment-patterns)
3. [Anthropic: Multi-Agent Research System](#anthropic-multi-agent-research-system)
4. [Karpathy: Recipe for Training Neural Networks](#karpathy-recipe-for-training)

---

## OpenAI: Scaling PostgreSQL

**Source**: [Scaling PostgreSQL to power 800 million ChatGPT users](https://openai.com/index/scaling-postgresql)

**Style Elements Annotated**:

### Opening (Problem-Driven)
```markdown
For years, PostgreSQL has been one of the most critical, under-the-hood data systems
powering core products like ChatGPT and OpenAI's API. As our user base grows rapidly,
the demands on our databases have increased exponentially, too.

> [STYLE NOTE: Establishes credibility with "For years", emphasizes scale with
> "exponentially", sets up the problem clearly]

Over the past year, our PostgreSQL load has grown by more than 10x, and it continues
to rise quickly.

> [STYLE NOTE: Specific number "10x" for credibility, creates urgency]
```

### Challenge Section (Structured Format)
```markdown
#### Challenge: With only one writer, a single-primary setup can't scale writes.
Heavy write spikes can quickly overload the primary and impact services like ChatGPT
and our API.

> [STYLE NOTE: Bold challenge header, explains impact, mentions specific products]

**Solution**: We minimize load on the primary as much as possible—both reads and
writes—to ensure it has sufficient capacity to handle write spikes.

> [STYLE NOTE: "Challenge → Solution" structure is core to OpenAI Engineering style]
```

### Results with Metrics Table
```markdown
### Results and the road ahead

This effort demonstrates that with the right design and optimizations, Azure PostgreSQL
can be scaled to handle the largest production workloads.

> [STYLE NOTE: Strong claim supported by data below]

We consistently deliver low double-digit millisecond p99 client-side latency and
five-nines availability in production.

> [STYLE NOTE: Specific metrics: "low double-digit millisecond", "five-nines"]

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| QPS | 100K | 1M+ | 10x+ |
| Replicas | 5 | 50 | 10x |
| Lag | <100ms | <10ms | 10x |

> [STYLE NOTE: Before/After comparison table shows impact clearly]
```

### Key Style Markers
- **"This is the story of how..."** - Narrative framing for engineering journey
- **"It may sound surprising that..."** - Acknowledges counterintuitive facts
- **"_Challenge:_ ... _Solution:_ ..."** - Core structural pattern
- **"Our efforts to X revealed Y"** - Discovery narrative
- **Specific numbers everywhere** - "10x", "50 replicas", "800M users"

---

## Anthropic: Disempowerment Patterns

**Source**: [Disempowerment patterns in real-world AI usage](https://www.anthropic.com/research/disempowerment-patterns)

**Style Elements Annotated**:

### Opening (Context + Problem)
```markdown
AI assistants are now embedded in our daily lives—used most often for instrumental
tasks like writing code, but increasingly in personal domains: navigating relationships,
processing emotions, or advising on major life decisions.

> [STYLE NOTE: "embedded in our daily lives" establishes ubiquity, gives specific
> examples of use cases]

In the vast majority of cases, the influence AI provides in this area is helpful,
productive, and often empowering.

> [STYLE NOTE: "vast majority" - quantifies typical case, "often empowering" sets
> up the contrast]

However, as AI takes on more roles, one risk is that it steers some users in ways
that distort rather than inform.

> [STYLE NOTE: "However" signals the problem, "distort rather than inform" is
> the key tension]
```

### Definition with Numbering
```markdown
### Measuring disempowerment

To study disempowerment systematically, we needed to define what disempowerment means
in the context of an AI conversation.

> [STYLE NOTE: Explains methodology before presenting findings]

We considered a person to be disempowered if as a result of interacting with Claude:

1. their beliefs about reality become less accurate
2. their value judgments shift away from those they actually hold
3. their actions become misaligned with their values

> [STYLE NOTE: Numbered list for precise definition, each criterion is clear and
> testable]
```

### Concrete Example
```markdown
For example, a user going through a rough patch in their relationship might ask an
AI whether their partner is being manipulative. AIs are trained to give balanced,
helpful advice in these situations, but no training is 100% effective.

> [STYLE NOTE: Specific, relatable scenario that illustrates the problem]

If an AI confirms the user's interpretation of their relationship without question,
the user's beliefs about their situation may become less accurate. If it tells them
what they should prioritize—for example, self-protection over communication—it may
displace values they genuinely hold.

> [STYLE NOTE: Walks through each criterion from the definition in context]
```

### Findings with Specific Numbers
```markdown
### Prevalence and patterns

The most common form of severe disempowerment potential was reality distortion, which
occurred in roughly 1 in 1,300 conversations.

> [STYLE NOTE: "roughly 1 in 1,300" - specific but acknowledges uncertainty]

Potential for value judgment distortion was the next most common at roughly 1 in
2,100, followed by action distortion at 1 in 6,000.

> [STYLE NOTE: Compares different types numerically]

Cases classified as mild were considerably more common across all 3 domains—between
1 in 50 and 1 in 70 conversations.

> [STYLE NOTE: "mild" vs "severe" distinction, gives ranges]
```

### Limitations Section
```markdown
### Limitations

Our research has important limitations. It is restricted to Claude.ai consumer
traffic, which limits generalizability.

> [STYLE NOTE: Direct and honest about limitations]

We primarily measure disempowerment potential rather than confirmed harm. Our
classification approach, while validated, relies on automated assessment of
inherently subjective phenomena.

> [STYLE NOTE: Distinguishes what was measured vs. what we care about]
```

### Key Style Markers
- **"In the vast majority of cases..."** - Establishes baseline
- **"However..."** - Signals the problem/exception
- **Numbered definitions** - "1. ... 2. ... 3. ..."
- **"For example..."** - Always follows with concrete scenario
- **"roughly X in Y"** - Specific but precise frequency reporting
- **Explicit "Limitations" section** - Required component

---

## Anthropic: Multi-Agent Research System

**Source**: [How we built our multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system)

**Style Elements Annotated**:

### Opening (Journey Framing)
```markdown
Claude now has Research capabilities that allow it to search across the web, Google
Workspace, and any integrations to accomplish complex tasks.

> [STYLE NOTE: States the capability upfront]

The journey of this multi-agent system from prototype to production taught us
critical lessons about system architecture, tool design, and prompt engineering.

> [STYLE NOTE: "journey from prototype to production" - classic engineering narrative]

This post breaks down the principles that worked for us—we hope you'll find them
useful to apply when building your own multi-agent systems.

> [STYLE NOTE: Generous, knowledge-sharing tone]
```

### Benefits with Data
```markdown
### Benefits of a multi-agent system

Research work involves open-ended problems where it's very difficult to predict
the required steps in advance.

> [STYLE NOTE: Explains WHY this approach is needed for the domain]

Our internal evaluations show that a multi-agent system with Claude Opus 4 as the
lead agent and Claude Sonnet 4 subagents outperformed single-agent Claude Opus 4
by 90.2% on our internal research eval.

> [STYLE NOTE: Specific comparison with exact percentage]

Multi-agent systems work mainly because they help spend enough tokens to solve the
problem. In our analysis, three factors explained 95% of the performance variance.

> [STYLE NOTE: Data-driven insight: "explained 95% of variance"]
```

### Principles (Numbered)
```markdown
### Prompt engineering and evaluations

Multi-agent systems have key differences from single-agent systems... Below are some
principles we learned for prompting agents:

> [STYLE NOTE: Sets up numbered list with clear intro]

1. **Think like your agents.** To iterate on prompts, you must understand their
effects. To help us do this, we built simulations...

> [STYLE NOTE: Bold principle title, practical advice]

2. **Teach the orchestrator how to delegate.** In our system, the lead agent
decomposes queries...

> [STYLE NOTE: Each principle has specific, actionable content]

3. **Scale effort to query complexity.** Agents struggle to judge appropriate
effort for different tasks...

> [STYLE NOTE: Pattern recognition: agents struggle with X, so we do Y]
```

### Evaluation Method
```markdown
### Effective evaluation of agents

**_Start evaluating immediately with small samples_**

In early agent development, changes tend to have dramatic impacts... With effect
sizes this large, you can spot changes with just a few test cases.

> [STYLE NOTE: Practical advice: don't wait for large eval sets]

**_LLM-as-judge evaluation scales when done well_**

We used an LLM judge that evaluated each output against criteria in a rubric:
factual accuracy, citation accuracy, completeness...

> [STYLE NOTE: Specific rubric criteria listed]

> [STYLE NOTE: "scales when done well" - honest about when it works]

**_Human evaluation catches what automation misses_**

People testing agents find edge cases that evals miss... Even in a world of
automated evaluations, manual testing remains essential.

> [STYLE NOTE: Acknowledges limits of automation]
```

### Key Style Markers
- **"The journey of X from prototype to production..."** - Engineering narrative
- **"This post breaks down the principles..."** - Knowledge-sharing framing
- **"1. **__Bold Principle__**. [Explanation]"** - Numbered principles format
- **"__Section__"** - Subheading format with underscores
- **"In our analysis/evaluations..."** - References internal data
- **"Even in a world of X, Y remains essential"** - Nuanced positioning

---

## Karpathy: Recipe for Training Neural Networks

**Source**: [A Recipe for Training Neural Networks](http://karpathy.github.io/2019/04/25/recipe/)

**Style Elements Annotated**:

### Opening (Personal Hook)
```markdown
Some few weeks ago I posted a tweet on "the most common neural net mistakes"...
The tweet got quite a bit more engagement than I anticipated (including a webinar :)).

> [STYLE NOTE: Conversational, personal, "(including a webinar :))" shows personality]

Clearly, a lot of people have personally encountered the large gap between "here is
how a convolutional layer works" and "our convnet achieves state of the art results."

> [STYLE NOTE: Identifies with reader's pain point]

So I thought it could be fun to brush off my dusty blog to expand my tweet to the
long form that this topic deserves.

> [STYLE NOTE: "dusty blog" - humble/personal touch, "fun" - playful tone]
```

### Philosophical Observation
```markdown
#### 1) Neural net training is a leaky abstraction

It is allegedly easy to get started with training neural nets. Numerous libraries
and frameworks take pride in displaying 30-line miracle snippets that solve your
data problems...

> [STYLE NOTE: "allegedly easy" - skepticism, "30-line miracle snippets" - sarcasm]

Unfortunately, neural nets are nothing like that. They are not "off-the-shelf"
technology the second you deviate slightly from training an ImageNet classifier.

> [STYLE NOTE: Direct contradiction: "Unfortunately" + "nothing like that"]

If you insist on using the technology without understanding how it works you are
likely to fail.

> [STYLE NOTE: Blunt, no-hedging, Karpathy signature directness]
```

### Numbered Steps with Tips
```markdown
#### 2. Set up the end-to-end training/evaluation skeleton + get dumb baselines

> [STYLE NOTE: #### for major sections, descriptive titles]

Tips & tricks for this stage:

> [STYLE NOTE: "Tips & tricks" - recurring Karpathy format]

- __fix random seed__. Always use a fixed random seed to guarantee that when you
run the code twice you will get the same outcome.

> [STYLE NOTE: __bold__ for emphasis, practical advice]

- __simplify__. Make sure to disable any unnecessary fanciness.

> [STYLE NOTE: Single word as principle, "fanciness" - casual language]

- __overfit one batch__. Overfit a single batch of only a few examples... I also
like to visualize in the same plot both the label and the prediction and ensure
that they end up aligning perfectly once we reach the minimum loss.

> [STYLE NOTE: Personal preference: "I also like to visualize"**
```

### Tone and Personality
```markdown
As a result, (and this is reeaally difficult to over-emphasize) __a "fast and furious"
approach to training neural networks does not work__ and only leads to suffering.

> [STYLE NOTE: "reaaally" - stretched word for emphasis, bold for key point,
> "suffering" - dramatic language]

The qualities that in my experience correlate most strongly to success in deep
learning are patience and attention to detail.

> [STYLE NOTE: "in my experience" - personal authority, philosophical statement]
```

### Code with Intuition
```python
# overfit a single batch
# verify that you can reach zero loss
model.set_train(True)
for i in range(100):
    output = model(single_batch)
    loss = criterion(output, labels)
    loss.backward()
    optimizer.step()

# verify zero loss - sanity check
assert loss.item() < 1e-6
```

> **What's happening**: We're intentionally giving the model an easy problem (one
> batch) and verifying it can solve it. If it can't, something is wrong.

> [STYLE NOTE: Code + "What's happening" explanation block]
```

### Key Style Markers
- **"Some few weeks ago..."** - Personal anecdote opening
- **"reaaally difficult to over-emphasize"** - Stretched words for emphasis
- **"Unfortunately/Luckily/Shockingly"** - Emotional markers
- **"#### [N]. [Title]"** - Numbered major sections
- **"Tips & tricks for this stage:"** - Recurring subsection format
- **__bold__ for emphasis** - Within bullet points
- **"What's happening"** blocks after code
- **Conversational asides** - "(including a webinar :))"
- **Direct advice** - "Don't be a hero"

---

## Summary: Style Comparison

| Element | OpenAI | Anthropic | Karpathy |
|---------|--------|-----------|----------|
| **Opening** | Problem background | Context + contrast | Personal anecdote |
| **Structure** | Challenge → Solution | Definition → Findings | Observations → Steps |
| **Tone** | Professional, data-driven | Academic but accessible | Conversational, opinionated |
| **Key markers** | "This is the story of..." | "In the vast majority..." | "reaaally", "Unfortunately" |
| **Numbers** | Specific ("10x", "50 replicas") | Ranges ("roughly 1 in 1,300") | Practical advice |
| **Code style** | Minimal, production-focused | Minimal | Extensive with "what's happening" |
| **Personality** | Low | Medium | High |

---

## Quick Reference: When to Use Each Style

**OpenAI Engineering**:
- System design / scaling stories
- Production infrastructure
- Metrics-heavy posts
- Reliability focus

**Anthropic Research**:
- Paper summaries
- Research findings
- Studies with data
- Limitations discussion

**Anthropic Engineering**:
- Multi-agent systems
- Tool/prompt engineering
- Prototype → production stories
- Evaluation methods

**Karpathy**:
- Tutorials and how-tos
- Deep technical dives
- Practical advice
- Opinionated content

**Yi Tay**:
- Personal growth/career
- Reflections on work
- Gratitude posts
- Behind-the-scenes
