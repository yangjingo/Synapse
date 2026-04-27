# Tool Fusion

Use this file when the note must become the final two-artifact blog delivery.

## DESIGN.md-like Role

Use DESIGN.md-like prose to specify:

- typography hierarchy
- spacing rhythm
- color roles
- caption and callout style

This is for communicating style to the model cleanly.

## Pretext Role

Use pretext-style thinking for:

- short title lines
- dense captions
- callout geometry
- compact but readable annotation blocks

When the output is an actual HTML page with animated or geometry-sensitive text, do not stop at "pretext-inspired".

Use real `pretext` integration:

- import `@chenglou/pretext` in a browser module or build step
- call `prepareWithSegments(...)`
- call `layoutWithLines(...)`
- use returned `lines` to render or animate text

Priority order for real `pretext` layout:

1. animated text fields
2. title
3. lead / thesis paragraph
4. captions

## Image Role

Only hand off to image generation after:

- figure purpose is explicit
- reading order is fixed
- labels are known

The final Markdown artifact should keep the image prompts inline as a reusable prompt pack.

Prefer prompts that are compatible with:

- Imagen
- nano-banana

When source images have incompatible aspect ratios:

- identify the target article slot first
- define the target ratio explicitly, for example `16:9`, `4:3`, `3:2`, or `1:1`
- tell the model whether to:
  - extend the canvas
  - recompose the layout
  - regenerate a matching version from the same technical intent
- preserve technical semantics and label hierarchy
- do not ask the model to merely "resize" a dense technical figure

## Combined Output

When this skill is used in its default mode, return exactly two final artifacts:

1. a Markdown blog post with static-image prompts
2. a polished HTML blog page

Do not promote separate figure briefs or motion plans to final-output status unless the user explicitly asks for them.
