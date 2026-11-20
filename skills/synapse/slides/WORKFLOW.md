# Synapse Slides

Build the deck from Slides DSL. Use the slide profile to choose a verified template, then use its native typography, navigation, and Pretext integration.

## Choose a profile

Honor the user’s choice and the project’s `DESIGN.md`. When neither selects a profile, start with the Why.J Theater profile.

| Profile | Design and style | Template |
| --- | --- | --- |
| `excalidraw-slides` / Why.J Theater | [DESIGN.md](design-md/excalidraw-slides-design.md) · [style](references/SLIDES-STYLE.md) | [WHYJ-SLIDES.html](references/WHYJ-SLIDES.html) |
| `serif-slides` / Serif editorial | [DESIGN.md](design-md/serif-slides-design.md) · [style](references/SLIDES-STYLE-SERIF.md) | [Quant Agent reference deck](references/serif/quant-agent-slides.html) |

Keep one profile per deck. Apply project figure rules before generating assets.

## Build and verify

1. **Shape the deck.** Use [Forge](../forge/WORKFLOW.md) for new material and the [DSL specification](../forge/FORGE.DSL.md) for structure. Sequence the slides as cover, factual context, agenda questions, one mechanism per slide, matching answers, and verified references. Cover includes title, thesis, author, and date. Keep each agenda question traceable to the context and answer it in the takeaway.
2. **Finish the visuals.** Start with the project’s figure specification and align equivalent panels horizontally, vertically, or symmetrically where the comparison warrants it. Use [Excalidraw](../excalidraw/WORKFLOW.md) when the figure needs editable nodes. For new raster illustrations use Codex `$imagegen` in built-in `image_gen` mode. If that path fails, report it before any provider change. Unless the project profile overrides them, Why.J Theater uses white paper, rough black ink, sparse labels, and one `#D97757` accent. Store final assets and figure specs in `figures/`, reference them as `./figures/…`, and replace pending `::visual` directives with resolved `::image` entries.
3. **Render from the selected template.** Preserve the template’s Reveal.js setup, typography, and slide interactions. Map `::math` to KaTeX, `::code` to the code block, `::pulse` to the conclusion layer, and `==text==` to highlighting. Keep the normal reading view free of prompts and placeholders. Keep the template’s metadata, watermark, and reference styles.
4. **Check typography and navigation.** In Why.J Theater retain the `data-pretext-src="slide"` integration on animated pages, excluding the cover. Read [Pretext](PRETEXT.md) for text measurement or reflow. Open the result and check slide navigation, figures, links, and clipping. For examples in the Synapse checkout also run `node scripts/validate-slide-visuals.js`.

For a matching article, keep claims, figures, and source identifiers consistent across outputs. Article writing and rendering belong to [Tech Blog](../../synapse-tech-blog/SKILL.md).
