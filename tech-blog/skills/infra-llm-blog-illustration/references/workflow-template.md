# Hard-Core Technical Figure Workflow

Use this as the default workflow for figure work in infra, systems, and LLM writing.

## 1. Static Figure Workflow

1. Define the question the figure must answer.
2. Choose the figure class.
3. Write the information hierarchy.
4. Decide the labels.
5. Define the visual constraints.
6. Write the caption.
7. Generate or implement the figure.
8. Review for clarity and technical correctness.

### Required Output

- Figure intent
- Figure type
- Layout
- Labels
- Visual language
- Caption
- Avoid

## 2. Animated Figure Workflow

1. Build the static base figure first.
2. Define what motion adds that static cannot.
3. Choose the motion pattern.
4. Write the reveal sequence.
5. Choose the implementation path:
   - `imagegen` for static generated image
   - `remotion-best-practices` for code-driven animation
6. Review whether motion improved explanation or only added noise.

### Required Output

- Motion goal
- Static base figure
- Reveal sequence
- Motion language
- Timing notes
- Avoid

## 3. Imagen Prompt Template

Use when the output should be a generated image:

`Create a clean, dense engineering illustration for a hard-core technical article. Use a white or light neutral background, restrained blue/teal and orange accents, compact rounded rectangles, thin arrows, precise labels, and explicit subsystem boundaries. Explain [TOPIC] as a [FIGURE TYPE]. Make the reading order obvious and the technical structure explicit. Keep it flat, editorial, and systems-oriented. Avoid generic SaaS dashboards, 3D hardware art, decorative gradients, rainbow color coding, oversized icons, and vague labels.`

## 4. Remotion Prompt Template

Use when the output should be a code-driven animation:

`Create a Remotion-based technical explainer animation for [TOPIC]. Start from a static engineering diagram with a white or light neutral background, restrained semantic colors, compact labels, and explicit subsystem boundaries. Use staged reveal, SVG path draw-on, highlight, dim, and timeline sequencing only where they improve understanding. Keep motion minimal, semantic, and code-driven. Avoid decorative motion, cinematic camera moves, generic dashboard chrome, and non-semantic transitions.`

## 5. Paper Figure Summary Template

Use this template when summarizing figures from a paper:

### Source Summary

- paper title
- domain
- what kind of technical argument the paper is making

### Figure Inventory

- architecture maps
- operator diagrams
- memory or communication figures
- charts
- ablations
- timelines or sequences

### Style Traits

- canvas
- color
- shapes and lines
- typography
- density
- annotation strategy

### Information Patterns

- how the figures compress mechanism or evidence

### Editorial Purpose

- what the figure is doing in the paper's argument

### Reusable Rules

- what should be copied into future blog or paper figures

### Avoid

- what is paper-specific or weak and should not be reused
