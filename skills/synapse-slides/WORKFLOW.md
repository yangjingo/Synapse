# Synapse Slides

Start from the audience, purpose, and delivery format in [the Slides entry point](SKILL.md). Use a page plan for straightforward decks. Use Slides DSL when it helps keep a complex deck or a paired article traceable.

## Choose a format and profile

Honor the user’s format, template, and project `DESIGN.md`. When the user asks for PowerPoint, use the available presentation tools to create and inspect a native `.pptx` file. For HTML, use the appropriate bundled profile below. Why.J Theater is the default for a Why.J deck without a specified profile.

| Profile | Design and style | Template |
| --- | --- | --- |
| `excalidraw-slides` / Why.J Theater | [DESIGN.md](design-md/excalidraw-slides-design.md) · [style](references/SLIDES-STYLE.md) | [WHYJ-SLIDES.html](references/WHYJ-SLIDES.html) |
| `serif-slides` / Serif editorial | [DESIGN.md](design-md/serif-slides-design.md) · [style](references/SLIDES-STYLE-SERIF.md) | [Quant Agent reference deck](references/serif/quant-agent-slides.html) |

Keep one profile per deck. Apply project figure rules before generating assets.

## Build and verify

1. **Shape the deck.** Outline the message and supporting material for each slide. When Synapse is installed, use [Forge](../synapse/forge/WORKFLOW.md) for substantial source extraction and the [DSL specification](../synapse/forge/FORGE.DSL.md) for a structured deck. For technical Why.J decks, use cover, factual context, agenda questions, one mechanism per slide, matching answers, and verified references. Tie each agenda question to the context and answer it in the takeaway.
2. **Finish the visuals.** Start with the project’s figure specification and align equivalent panels horizontally, vertically, or symmetrically where the comparison warrants it. Use an editable diagram for figures the audience needs to reuse. If Synapse is installed, its [Excalidraw workflow](../synapse/excalidraw/WORKFLOW.md) provides this path. For new raster illustrations use Codex `$imagegen` in built-in `image_gen` mode. If that path fails, report it before any provider change. Unless the project profile overrides them, Why.J Theater uses white paper, rough black ink, sparse labels, and one `#D97757` accent. Store final assets and figure specs in `figures/`, reference them as `./figures/…`, and replace pending `::visual` directives with resolved `::image` entries.
3. **Render from the selected template.** Preserve the selected format’s typography and navigation. For HTML, retain the template’s Reveal.js setup and slide interactions. Map `::math` to KaTeX, `::code` to the code block, `::pulse` to the conclusion layer, and `==text==` to highlighting. Keep the normal reading view free of prompts and placeholders. Keep the template’s metadata, watermark, and reference styles.
4. **Check typography and navigation.** In Why.J Theater retain the `data-pretext-src="slide"` integration on animated pages, excluding the cover. Read [Pretext](PRETEXT.md) for text measurement or reflow. Open or render the result and check slide order, figure legibility, links, and clipping. For HTML, verify keyboard navigation. For native decks, verify the exported slides and any speaker notes. For examples in the Synapse checkout also run `node scripts/validate-slide-visuals.js`.

For a matching article, keep claims, figures, and source identifiers consistent across outputs. Article writing and rendering belong to [Tech Blog](../synapse-tech-blog/SKILL.md).
