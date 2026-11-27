# Synapse Slides

Start from the audience, purpose, and delivery format. Use a page plan for straightforward decks. Use Slides DSL when a complex deck or a paired article needs a traceable intermediate draft.

## Choose a format

Honor the user’s format, template, and project design requirements. For PowerPoint, create and inspect a native `.pptx` file. For HTML, start from the bundled [Why.J Theater template](../templates/whyj-slides.html).

## Canvas aspect ratios

Set the logical canvas first. For HTML with a ratio control, offer 16:9, 16:10, and 4:3. Preserve any original template size as a separate option. A narrower canvas should reflow the grid and protect the figure and takeaway space before the full canvas is scaled to the viewing window. Fit figures without changing their own aspect ratio. Check every slide in the requested ratios and move overflow into a new slide or the speaker notes when the layout cannot fit legibly.

## Build and verify

1. **Shape the deck.** Outline the message and supporting material for each slide. Group scattered material by claim, evidence, and source before drafting Slides DSL. Tie each agenda question to the factual context and answer it in the takeaway.
2. **Finish the visuals.** Build editable diagrams for HTML. When generating new raster illustrations, use Codex `$imagegen` in built-in `image_gen` mode. Report a failure before changing providers. Store external figure assets and their specs in `figures/`, and resolve each pending `::visual` before delivery.
3. **Render from the selected template.** Preserve the selected format’s typography and navigation. For HTML, retain the template’s Reveal.js setup and slide interactions. Map `::math` to KaTeX, `::code` to the code block, `::pulse` to a `.pulse-layer` sentence delimited by square brackets and revealed on its own playback step, and `==text==` to highlighting. Keep the normal reading view free of prompts and placeholders. Keep the template’s metadata, watermark, and reference styles.
4. **Check typography and navigation.** Open or render the result and check slide order, figure legibility, links, and clipping. For HTML, verify keyboard navigation. For native decks, verify the exported slides and any speaker notes. For examples in the Synapse checkout also run `node skills/synapse-talk-slides/scripts/validate-slide-visuals.js`.

For a matching article, keep claims, figures, and source identifiers consistent across outputs.
