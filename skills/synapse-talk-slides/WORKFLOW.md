# Synapse Slides

Start from the audience, purpose, and delivery format in [the Slides entry point](SKILL.md). Use a page plan for straightforward decks. Use Slides DSL when it helps keep a complex deck or a paired article traceable.

## Choose a format and profile

Honor the user’s format, template, and project `DESIGN.md`. When the user asks for PowerPoint, use the available presentation tools to create and inspect a native `.pptx` file. For HTML, use the appropriate bundled profile below. Why.J Theater is the default for a Why.J deck without a specified profile.

| Profile | Design and style | Template |
| --- | --- | --- |
| `excalidraw-slides` / Why.J Theater | [DESIGN.md](design-md/excalidraw-slides-design.md) · [style](references/SLIDES-STYLE.md) | [WHYJ-SLIDES.html](references/WHYJ-SLIDES.html) |
| `serif-slides` / Serif editorial | [DESIGN.md](design-md/serif-slides-design.md) · [style](references/SLIDES-STYLE-SERIF.md) | [Quant Agent reference deck](references/serif/quant-agent-slides.html) |

Why.J Theater uses Poppins for English headings, body, and labels. Noto Sans SC supplies Chinese glyphs, with Microsoft YaHei as a fallback. Use JetBrains Mono for code. Set figure styling from the project and the [Theater reference](references/SLIDES-STYLE.md).

## Content layouts

Use `data-layout="text-led"` for an argument driven by text. Allocate about 58% to text and 42% to the supporting figure on a wide canvas. Use `data-layout="image-led"` when the figure carries the explanation. Both use Why.J Theater. The [template](references/WHYJ-SLIDES.html) contains examples of both. Keep the figure at its native aspect ratio and place the takeaway under the explanation in the right column on image-led pages.

## Canvas aspect ratios

Set the logical canvas first. For HTML with a ratio control, offer 16:9, 16:10, and 4:3. Preserve any original template size as a separate option. A narrower canvas should reflow the grid and protect the figure and takeaway space before the full canvas is scaled to the viewing window. Fit figures without changing their own aspect ratio. Check every slide in the requested ratios and move overflow into a new slide or the speaker notes when the layout cannot fit legibly.

## Build and verify

1. **Shape the deck.** Outline the message and supporting material for each slide. If the Tech Blog package is installed, use its [source extraction workflow](../synapse-tech-blog/workflows/forge/WORKFLOW.md) and [DSL specification](../synapse-tech-blog/workflows/forge/FORGE.DSL.md) when the source material needs more structure. For technical Why.J decks, use cover, factual context, agenda questions, one mechanism per slide, matching answers, and verified references. Tie each agenda question to the context and answer it in the takeaway.
2. **Finish the visuals.** Start with the project’s figure specification and align equivalent panels horizontally, vertically, or symmetrically where the comparison warrants it. Build technical figures as editable HTML diagrams when the delivery format is HTML. If the Tech Blog package is installed, its [Excalidraw workflow](../synapse-tech-blog/workflows/excalidraw/WORKFLOW.md) provides this path. For new raster illustrations use Codex `$imagegen` in built-in `image_gen` mode. If that path fails, report it before any provider change. Why.J Theater diagrams use warm paper, short labels, thin connectors and one restrained terracotta accent. Keep editable markup in the HTML. Store any external figure assets and their specs in `figures/`, and resolve each pending `::visual` before delivery.
3. **Render from the selected template.** Preserve the selected format’s typography and navigation. For HTML, retain the template’s Reveal.js setup and slide interactions. Map `::math` to KaTeX, `::code` to the code block, `::pulse` to the conclusion layer, and `==text==` to highlighting. Keep the normal reading view free of prompts and placeholders. Keep the template’s metadata, watermark, and reference styles.
4. **Check typography and navigation.** In Why.J Theater retain the `data-pretext-src="slide"` integration on animated pages, excluding the cover. Read [Pretext](PRETEXT.md) for text measurement or reflow. Open or render the result and check slide order, figure legibility, links, and clipping. For HTML, verify keyboard navigation. For native decks, verify the exported slides and any speaker notes. For examples in the Synapse checkout also run `node scripts/validate-slide-visuals.js`.

For a matching article, keep claims, figures, and source identifiers consistent across outputs. Article writing and rendering belong to [Tech Blog](../synapse-tech-blog/SKILL.md).
