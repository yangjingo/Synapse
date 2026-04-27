# Animation Patterns

Use this reference when a technical figure should become an animation.

The point of motion is explanation, not decoration.

## When To Animate

Animate when motion makes one of these clearer:

- execution order
- data movement
- synchronization
- overlap between compute and communication
- before/after optimization
- progressive reveal of a mechanism

Do not animate when a static figure already explains the point cleanly.

## Core Motion Patterns

### 1. Staged Reveal

Use for:

- introducing architecture one subsystem at a time
- focusing attention on the currently discussed component

Rules:

- reveal major groups in logical order
- keep already revealed context visible but visually subdued
- do not reorder the layout during the reveal

### 2. Path Draw-On

Use for:

- request flow
- tensor flow
- network or memory movement
- dependency tracing

Implementation note:

- this maps well to SVG `stroke-dasharray` and `stroke-dashoffset`
- Remotion is a good default implementation path for this

### 3. Swimlane Sequencing

Use for:

- multi-device execution
- scheduler behavior
- overlap analysis

Rules:

- preserve lane alignment
- use motion to reveal temporal order, not to move the whole canvas
- barriers and handoffs must be explicit

### 4. Focus Shift

Use for:

- drilling into a subsystem after establishing the whole system

Rules:

- dim non-active context instead of removing it completely
- keep camera movement minimal
- let scale change only when it serves comprehension

### 5. Before / After Overlay

Use for:

- optimization comparisons
- architectural simplification
- bottleneck removal

Rules:

- keep the comparison frame consistent
- animate the changed region, not everything
- make the delta visually obvious

### 6. Benchmark Reveal

Use for:

- revealing latency, throughput, or scaling comparisons in a talk or video

Rules:

- reveal only if the order supports the conclusion
- keep axes, labels, and legend stable
- avoid flashy chart transitions

## Motion Language

Prefer:

- linear or restrained easing
- short purposeful transitions
- highlight, trace, reveal, and dim

Avoid:

- cinematic camera moves
- bouncing elements
- floating idle motion
- decorative particle systems
- transitions that re-layout the whole figure without semantic reason

## Tool Guidance

### Remotion

Default for:

- code-driven technical animation
- SVG draw-on effects
- staged timeline control
- reusable animation logic in React

### Manim

Strong conceptual reference for:

- mathematically precise vector drawing
- proof-like reveal order
- clean geometric sequencing

Use Manim-style thinking even if the implementation stays in Remotion:

- reveal in proof order
- let line drawing communicate logic
- keep motion subordinate to structure

## Output For Animated Figure Specs

When writing an animated figure spec, include:

### Motion Goal

- what the animation helps explain

### Static Base Figure

- the layout before motion is added

### Reveal Sequence

- step-by-step order of animation

### Motion Language

- draw-on, fade, dim, highlight, overlay, etc.

### Timing Notes

- rough pacing by phase

### Avoid

- motion behaviors that would reduce clarity
