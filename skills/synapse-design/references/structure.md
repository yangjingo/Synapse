# Structure

Default delivery structure:

This skill ships two final artifacts:

1. a technical blog Markdown file
2. a polished blog HTML file

Both artifacts should share the same argument spine.

Default article structure inside both artifacts:

## 1. Thesis paragraph

State:

- what this is really about
- why it matters
- what the reader should track

## 2. The real problem

Explain the actual engineering bottleneck.

## 3. The core design move

Explain what changed and why it is a meaningful change.

## 4. The enabling details

Explain the hidden system pieces that make the headline idea viable.

## 5. Tradeoffs and risk

Show where the story can still break.

## 6. Engineering takeaway

List what an infra or model engineer should actually carry forward.

## 7. What to remember

End with a compressed final point.

## 8. Aggressive Pulse

End with one hard sentence that reframes the whole piece.

Examples:

- `The real story is not model scale. The real story is whether the runtime can cash the architectural check.`
- `If the cost curve does not move, long context is still a demo, not a system capability.`

## Markdown-only addition

The Markdown artifact should add one more section near the end:

## 9. Static illustration prompts

For each proposed figure, include:

- filename
- purpose
- placement in the article
- prompt for Imagen or nano-banana
- short avoid list

## HTML-only addition

The HTML artifact should translate the same article into:

- README-like section order
- DESIGN.md-style page hierarchy
- pretext-style text density and caption control

## Notes

- Not every article needs all 8 sections, but the logic should stay.
- If section 8 is present, it should be a hammer, not a recap.
- Section titles can be rewritten to fit the article.
- If visuals are included, place them after the section they clarify.
- The Markdown and HTML outputs should not drift into different theses.
