---
name: synapse-remotion
description: Integrate Remotion for code-driven technical animations and video in Synapse outputs. Use when slide animations, architecture explainers, pipeline sequencing, SVG path animations, or Remotion-based rendering are needed. Delegates to remotion-best-practices for implementation details.
---

# Synapse Remotion

Use this skill to integrate Remotion code-driven animation into Synapse outputs.

Remotion makes videos programmatically with React. In the Synapse context, it turns static technical figures into animated explainers.

## When to Use

- Technical architecture animations with staged reveals
- Execution pipeline sequencing with path tracing
- SVG path drawing animations for system diagrams
- Before/after optimization overlays
- Explainer videos for architecture, flow, and sequencing

## When NOT to Use

- Decoration or generic floating motion
- Looping effects that do not teach anything
- Cinematic transitions that obscure structure
- Any animation where a static figure is clearer

## Integration

### Install Remotion

```
npx create-video@latest
```

### Skill Delegation

Delegate implementation details to `remotion-best-practices`:

- React component structure for video compositions
- `<Composition>` and `<Sequence>` usage
- Rendering workflows (Lambda, Cloud Run, local)
- `<Player>` for web embedding
- Audio and caption integration

This skill (`synapse-remotion`) owns:
- the explanatory structure and motion semantics
- the sequence of reveals and what each phase teaches
- the decision whether animation adds value over static

`remotion-best-practices` owns:
- the implementation details
- the rendering pipeline
- the React/Remotion API usage

## Synapse Context

### With synapse-figure

When `synapse-figure` defines a figure that should become animated:

1. `synapse-figure` defines figure intent, type, layout, labels
2. `synapse-remotion` decides the motion semantics and reveal sequence
3. `remotion-best-practices` implements the Remotion composition

### With synapse-design (blog)

When a blog needs an embedded animated explainer:

1. `synapse-design` defines the editorial purpose
2. `synapse-remotion` scopes the animation to what teaches
3. Output is a `<Player>` embed or a rendered video asset

### With synapse-forge (slides)

When slides need animated transitions or reveals:

1. `synapse-forge` defines the slide sequence
2. `synapse-remotion` adds motion only where it improves explanation
3. Prefer Reveal.js transitions for slide decks; reserve Remotion for complex technical animations

## Animation Rules

Good reasons to animate:

- reveal execution order
- show data movement
- show dependency or synchronization
- compare before/after optimization
- trace request/tensor/signal flow through system

Bad reasons to animate:

- decoration
- generic floating motion
- looping effects with no teaching value
- cinematic transitions hiding structure

Preferred motion patterns:

- staged reveals
- path tracing
- lane-by-lane sequencing
- before/after overlays
- callout emphasis on active subsystem

## Rule

- Do not add motion until the static figure logic is already coherent.
- Delegate implementation to `remotion-best-practices`, not this skill.
- Keep animation semantic, not decorative.

## Reference

- Docs: https://www.remotion.dev/docs
- Skills: https://www.remotion.dev/docs/ai/skills
- Repo: https://github.com/remotion-dev/remotion
- Install skills: `npx skills add remotion-dev/skills`
