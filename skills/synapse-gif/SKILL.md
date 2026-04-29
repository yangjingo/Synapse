---
name: synapse-gif
description: Create animated GIFs and code-driven technical animations for Synapse outputs. Combines GIF toolkit (Slack/Discord optimized) with Remotion for programmatic video. Use when users request animated GIFs, emoji animations, technical architecture explainers, pipeline sequencing, SVG path animations, or Remotion-based rendering.
---

# Synapse GIF

Two-mode skill for motion in Synapse outputs:

1. **GIF Mode** — composable animation primitives for animated GIFs (PIL/imageio), optimized for Slack/Discord constraints
2. **Remotion Mode** — code-driven technical animations and video (React), for explainers and architecture reveals

## When to Use

**GIF Mode:**
- Reaction GIFs for Slack messages or emoji
- Animated emoji for Slack/Discord custom emoji
- Quick visual feedback loops (pulse, shake, bounce)
- Any animated content under Slack's size constraints

**Remotion Mode:**
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

---

## Part 1: GIF Mode — Animation Primitives

Composable building blocks for GIF creation. All primitives can be combined freely.

### Slack Constraints

**Message GIFs:**
- Max size: ~2MB
- Optimal dimensions: 480x480
- Typical FPS: 15-20
- Color limit: 128-256
- Duration: 2-5s

**Emoji GIFs (strict):**
- Max size: 64KB
- Optimal dimensions: 128x128
- Typical FPS: 10-12
- Color limit: 32-48
- Duration: 1-2s

### Validators

```python
from core.validators import check_slack_size, validate_dimensions, validate_gif, is_slack_ready

# Quick check
if is_slack_ready('emoji.gif', is_emoji=True):
    print("Ready to upload!")

# Full validation
all_pass, results = validate_gif('emoji.gif', is_emoji=True)
```

### GIF Builder

```python
from core.gif_builder import GIFBuilder

builder = GIFBuilder(width=480, height=480, fps=20)
for frame in my_frames:
    builder.add_frame(frame)

info = builder.save('output.gif', num_colors=128, optimize_for_emoji=False)
# info contains: size_kb, size_mb, frame_count, duration_seconds
```

### Animation Primitives Reference

Each primitive returns a list of frames. Combine them by interleaving frame lists or drawing into shared frames.

| Primitive | Module | Key Parameters |
|---|---|---|
| Shake | `templates.shake` | `object_type`, `shake_intensity`, `direction` |
| Bounce | `templates.bounce` | `object_type`, `bounce_height` |
| Spin/Rotate | `templates.spin` | `rotation_type` (clockwise/wobble), `full_rotations` |
| Pulse/Heartbeat | `templates.pulse` | `pulse_type` (smooth/heartbeat), `scale_range` |
| Fade | `templates.fade` | `fade_type` (in/out), crossfade between objects |
| Zoom | `templates.zoom` | `zoom_type` (in/out), `scale_range`, motion_blur |
| Explode/Shatter | `templates.explode` | `explode_type` (burst/shatter/dissolve), `num_pieces` |
| Wiggle/Jiggle | `templates.wiggle` | `wiggle_type` (jello/wave), `intensity`, `cycles` |
| Slide | `templates.slide` | `direction`, `slide_type` (in/across), `overshoot` |
| Flip | `templates.flip` | `flip_axis` (horizontal/vertical) |
| Morph/Transform | `templates.morph` | `morph_type` (crossfade/scale/spin_morph) |
| Move | `templates.move` | `motion_type` (linear/arc/circle/wave), easing |
| Kaleidoscope | `templates.kaleidoscope` | `segments`, `rotation_speed`, mirror modes |

### Easing Functions

```python
from core.easing import interpolate

y = interpolate(start=0, end=400, t=progress, easing='ease_out')
# Available: linear, ease_in, ease_out, ease_in_out, bounce_out, elastic_out, back_out
```

### Helper Utilities

```python
from core.typography import draw_text_with_outline, TYPOGRAPHY_SCALE
from core.color_palettes import get_palette
from core.visual_effects import ParticleSystem, create_impact_flash, create_shockwave_rings
from core.frame_composer import create_gradient_background, draw_emoji_enhanced
```

### Composition Pattern

```python
builder = GIFBuilder(480, 480, 20)

for i in range(num_frames):
    frame = create_gradient_background(480, 480, top_color, bottom_color)
    t = i / (num_frames - 1)

    # Layer primitives freely
    y = interpolate(start_y, ground_y, t, 'bounce_out')
    if y >= ground_y - 5:
        shake_x = math.sin(i * 2) * 10

    draw_emoji_enhanced(frame, '⚽', position=(x, int(y)), size=80)
    builder.add_frame(frame)

builder.save('output.gif', num_colors=128)
```

### Optimization Strategy

**Message GIFs (>2MB):** reduce frames → reduce colors (128→64) → reduce dimensions (480→320)

**Emoji GIFs (>64KB):** limit 10-12 frames → 32-40 colors → avoid gradients → simplify design → `optimize_for_emoji=True`

### Dependencies

```bash
pip install pillow imageio numpy
```

---

## Part 2: Remotion Mode — Technical Animation

### Install

```bash
npx create-video@latest
```

### Skill Delegation

For Remotion rendering, delegate implementation to the `remotion-best-practices` plugin skill:
- React component structure for video compositions
- `<Composition>` and `<Sequence>` usage
- Rendering workflows (Lambda, Cloud Run, local)
- `<Player>` for web embedding
- Audio and caption integration

This skill owns:
- the explanatory structure and motion semantics
- the sequence of reveals and what each phase teaches
- the decision whether animation adds value over static

`remotion-best-practices` (plugin) owns:
- the implementation details
- the rendering pipeline
- the React/Remotion API usage

### Remotion Animation Rules

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

---

## Synapse Context

### With synapse-figure (primary pipeline)

`synapse-figure` defines what to communicate; `synapse-gif` decides how to animate it.

**Figure → GIF pipeline:**

1. `synapse-figure` produces the figure spec: intent, type, layout, labels, color posture
2. `synapse-gif` reads the figure spec and decides:
   - **Static is clearer?** → stop, return the static figure
   - **Simple reaction or loop?** → GIF Mode with animation primitives
   - **Technical explainer with reveals?** → Remotion Mode, delegate to `remotion-best-practices`
3. Map figure types to animation patterns:

| Figure Type | Recommended Animation | Mode |
|---|---|---|
| Architecture map | Staged reveals of subsystems | Remotion |
| Execution pipeline | Path tracing, lane-by-lane sequencing | Remotion |
| Swimlane/timeline | Temporal slide-in, barrier emphasis | Remotion |
| Memory/comm flow | Directional path animation with flow particles | Remotion |
| Kernel/operator breakdown | Sequential highlighting, fusion overlay | GIF or Remotion |
| Benchmark chart | Progressive bar/line reveal | GIF |
| Trade-off table | Usually static — animate only for video context | — |

4. Apply `synapse-figure` color palette via `emit-color-tokens.mjs` → CSS custom properties → Remotion/GIF
5. Use `synapse-figure` SVG scaffold as base frames when the figure already has an SVG representation
6. Validate output against constraints (GIF: Slack limits; Remotion: rendering pipeline)

**Color handoff:**
```bash
# From synapse-figure/scripts — convert figure palette to CSS tokens
node synapse-figure/scripts/emit-color-tokens.mjs palette.json
# Use output tokens in Remotion components or GIF frame rendering
```

**SVG-to-GIF handoff:**
```bash
# From synapse-figure/scripts — generate SVG scaffold
node synapse-figure/scripts/make-svg-scaffold.mjs spec.json
# Convert SVG frames to PIL images for GIF Mode
```

### With synapse-design (blog)

When a blog needs an embedded animated explainer:

1. `synapse-design` defines the editorial purpose
2. `synapse-gif` scopes the animation to what teaches
3. Output is a `<Player>` embed, rendered video, or animated GIF

### With Synapse root (slides)

When slides need animated transitions or reveals:

1. Root SKILL.md defines the slide sequence (Why.J Theater)
2. `synapse-gif` adds motion only where it improves explanation
3. Prefer Reveal.js transitions for slide decks; reserve Remotion for complex technical animations

---

## Rules

- Do not add motion until the static figure logic is already coherent.
- For GIF Mode: validate file size early, especially for emoji GIFs (64KB strict).
- For Remotion Mode: delegate implementation to `remotion-best-practices` (plugin).
- Keep animation semantic, not decorative.

## Alternative Toolchain (MiniMax Plugin Skills)

When the built-in primitives or Remotion don't fit the task, delegate to these plugin skills:

| Plugin Skill | Use When | Mode | What It Adds |
|---|---|---|---|
| `gif-sticker-maker` | AI-generated character stickers from photos (people, pets, logos) | GIF | Photo → Funko Pop 3D figurine → animated GIF pipeline via MiniMax Image+Video API |
| `vision-analysis` | Need to understand/analyze source images before animating | Pre-processing | Image description, OCR, chart data extraction, object detection via MiniMax |
| `minimax-multimodal-toolkit` | Need audio (TTS/music), video generation, or FFmpeg media processing | Both | TTS/voice cloning, music generation, text-to-video, image-to-video, format conversion |
| `shader-dev` | Need GPU-rendered visual effects or procedural frame generation | Both | GLSL shaders: bloom, glitch, fluid sim, fractals, ray marching, particles |

### Decision Guide

```
Need animated GIF from a photo of a person/pet/object?
  → Use `gif-sticker-maker`

Need to analyze a source image before animating it?
  → Use `vision-analysis` first, then proceed with GIF/Remotion

Need audio track (TTS narration or background music) for Remotion?
  → Use `minimax-multimodal-toolkit` for TTS/music, then compose in Remotion

Need GPU-rendered visual effects (bloom, glitch, particles, fluid sim)?
  → Use `shader-dev` for WebGL2 shader effects, render frames, feed into GIF Mode

Need long-form multi-scene video with crossfade transitions?
  → Use `minimax-multimodal-toolkit` video pipeline, or Remotion `<Sequence>` staging
```

### Integration Patterns

**gif-sticker-maker → synapse-gif:**
1. Generate sticker images via `gif-sticker-maker`
2. Feed resulting frames into `GIFBuilder` for Slack-optimized output
3. Validate with `check_slack_size()`

**vision-analysis → synapse-gif:**
1. Analyze source screenshot/diagram with `vision-analysis`
2. Extract subjects, text, chart data
3. Use extracted info to plan animation sequence in synapse-gif

**minimax-multimodal-toolkit → synapse-gif (Remotion Mode):**
1. Generate TTS narration or background music via multimodal toolkit
2. Compose audio alongside Remotion `<Composition>`
3. Render final video with synchronized audio

**shader-dev → synapse-gif:**
1. Write GLSL shader for visual effect (bloom, glitch, particles)
2. Render shader frames via WebGL2 canvas
3. Capture frames and feed into `GIFBuilder` for GIF output
4. Or embed shader as `<Canvas>` layer in Remotion composition

## Reference

- Remotion Docs: https://www.remotion.dev/docs
- Remotion Skills: https://www.remotion.dev/docs/ai/skills
- Remotion Repo: https://github.com/remotion-dev/remotion
- Install Remotion skills: `npx skills add remotion-dev/skills`
- MiniMax Skills: https://github.com/MiniMax-AI/skills
