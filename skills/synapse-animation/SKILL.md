---
name: synapse-animation
description: Create animated technical diagrams and code-driven animations. Three modes — Excalidraw animation, direct GIF primitives (PIL/imageio), Remotion rendering. Use when users request diagram animation, GIF creation, Slack/Discord emoji, technical explainer videos, or Remotion rendering.
---

# Synapse Animation

Three-mode skill for motion in Synapse outputs:

1. **Excalidraw Mode** — `.excalidraw` → excalidraw-animate → SVG → GIF
2. **GIF Mode** — composable animation primitives (PIL/imageio), optimized for Slack/Discord
3. **Remotion Mode** — code-driven technical animations and video (React), for explainers and architecture reveals

## When to Use

**Excalidraw Mode:**
- User confirms an Excalidraw diagram and wants animation
- Converting animated SVG/WebM to GIF for Slack/Discord

**GIF Mode:**
- Reaction GIFs for Slack messages or custom emoji
- Animated emoji for Slack/Discord
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

## Mode 1: Excalidraw Animation

Receive `.excalidraw` files from `synapse-excalidraw`, animate via excalidraw-animate, export.

### Pipeline

**规则：每个细节必须征得用户同意后才能开始画 Excalidraw。**

```
1. 讨论 — 确定动画叙事阶段、视觉隐喻、关键对比
2. 画   — 生成 .excalidraw（创建顺序 = 动画顺序）
3. 动画 — excalidraw-animate → SVG
4. 调速 — svg-speed.js 控制速度/循环
5. 转换 — svg-to-gif.js 转 GIF（可选）
```

未经用户确认前，不得进入第 2 步。

### Complete Pipeline Scripts

| Script | Purpose |
|--------|---------|
| `scripts/animate-pipeline.js` | 全管线：`.excalidraw` → 上传 → 动画 → SVG |
| `scripts/svg-speed.js` | SMIL 动画速度控制 |
| `scripts/svg-to-gif.js` | SVG → GIF 转换 |

### excalidraw-animate

Visit: **https://dai-shi.github.io/excalidraw-animate**

Three load methods:

1. **Load File** — `.excalidraw` or `.json` file
2. **Load Library** — `.excalidrawlib` (each item animated separately)
3. **Paste link + Animate!** — Excalidraw shareable URL from `excalidraw-cli export`

Automation: Playwright headless 填入 shareable link → 点击 Animate! → 从 DOM 提取 SVG（Export 按钮在 headless 下不触发下载，需直接提取 `svg.outerHTML`）。

### Animation Defaults

| Setting | Default |
|---------|---------|
| Individual element duration | 500ms |
| Grouped element duration | 5s total, divided among members |
| Elements without explicit Order | Order=0, animate in creation order |
| Animation type | `d` (stroke drawing) + `opacity` (fade-in) |

### Animation Design Patterns

excalidraw-animate 按创建顺序逐元素绘制。动画叙事完全依赖**创建顺序 + 布局方向**。

**垂直流式（推荐）：** 适合叙事型动画（如 Prefill → Decode 流程）
- 元素从上到下创建，观众从上到下看绘制过程
- 模型块可重复出现（Prefill 一次、Decode 一次），动画中分别绘制
- 关键对比用箭头数量传达（5 条汇聚 = 并行，1 条 = 逐步）

**左右对比：** 适合模式对比（如 Full Attention vs SWA）
- 两个注意力矩阵并排
- 左侧全活跃（dense），右侧带状（banded）
- 中间 "vs" 分隔

### Speed Control

```bash
# 2x faster
node scripts/svg-speed.js input.svg output.svg --speed 2

# With loop
node scripts/svg-speed.js input.svg output.svg --speed 3 --loop

# Add 500ms initial delay
node scripts/svg-speed.js input.svg output.svg --speed 1 --delay 500
```

| Flag | Default | Description |
|------|---------|-------------|
| `--speed N` | 1 | Speed multiplier. 2 = 2x faster, 0.5 = half speed |
| `--delay N` | 0ms | Offset added to all begin times |
| `--loop` | off | Inject JS to replay animation after completion |

**Loop caveat:** Excalidraw-animated SVGs are build-up animations (elements appear progressively and stay via `fill="freeze"`). SMIL `repeatCount` or `fill="remove"` causes flashing because elements vanish between cycles. The `--loop` flag injects a `<script>` that clones and replaces the SVG after total animation time, restarting all SMIL animations cleanly. Only works in HTML/embed context (not standalone SVG file).

### Pipeline Automation

```bash
# Full pipeline: upload → animate → extract
NODE_PATH="$(npm root -g)" node scripts/animate-pipeline.js \
  --input diagram.excalidraw \
  --output animated.svg \
  --speed 2

# Debug mode (visible browser)
node scripts/animate-pipeline.js --input diagram.excalidraw --keep-browser
```

| Flag | Description |
|------|-------------|
| `--input` | `.excalidraw` file (required) |
| `--output` | Output SVG path (default: `<name>-animated.svg`) |
| `--speed N` | Apply speed multiplier to extracted SVG |
| `--loop` | Add JS-based infinite loop |
| `--keep-browser` | Run browser in headed mode for debugging |

### SVG → GIF Conversion

```bash
# Basic conversion (preserves original aspect ratio)
NODE_PATH="$(npm root -g)" node scripts/svg-to-gif.js input.svg output.gif

# Custom FPS and width
NODE_PATH="$(npm root -g)" node scripts/svg-to-gif.js input.svg output.gif --fps 15 --width 480

# With speed multiplier (uses svg.setCurrentTime, no need to pre-run svg-speed.js)
NODE_PATH="$(npm root -g)" node scripts/svg-to-gif.js input.svg output.gif --speed 3
```

| Flag | Default | Description |
|------|---------|-------------|
| `--fps N` | 15 | Frames per second |
| `--width N` | original | Output width in px, height auto-scaled by viewBox ratio |
| `--speed N` | 1 | Speed multiplier (uses `svg.setCurrentTime`) |
| `--loop N` | 0 | Loop count: 0 = infinite, 1 = play once |

How it works:
1. Parse SVG `viewBox` for aspect ratio
2. Playwright loads SVG, uses `svg.setCurrentTime()` to seek to each frame
3. Capture screenshots at each frame time
4. FFmpeg compiles frames to GIF with optimized palette (`palettegen` + `paletteuse`)

### Dependencies

```bash
npm install -g playwright
npx playwright install chromium
npm install -g @excalidraw/excalidraw-cli
# Optional for GIF: ffmpeg
```

### Output Format Selection

默认输出 SVG（矢量、高质量、支持浏览器直接播放）。

| Format | Use Case | Size | Notes |
|--------|----------|------|-------|
| SVG | Web 嵌入、博客、演示 | 200KB-2MB | 矢量，完美质量 |
| GIF | Slack/Discord、即时通讯 | 50-200KB | 位图，兼容性好 |
| SVG + GIF | 两者都需要 | — | 先输出 SVG，再转 GIF |

### Examples

| Example | Elements | Animate | Description |
|---------|----------|---------|-------------|
| Prefill-Decode | 61 | 442 | 垂直流式叙事：输入 → Prefill 并行 → Decode 逐步 → 输出 |
| SWA Attention | 170 | 2365 | 左右对比：Full Attention (dense) vs Sliding Window (banded) |

Reference: `references/exlidraw-gif-toolkit.md`

---

## Mode 2: GIF Primitives

Composable building blocks for direct GIF creation. All primitives can be combined freely. No Excalidraw dependency — pure Python/PIL/imageio.

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

### Animation Primitives

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

### Dependencies

```bash
pip install pillow imageio numpy
```

Reference: `references/slack-gif-toolkit.md`

---

## Mode 3: Remotion (Advanced)

For technical explainers with staged reveals, path tracing, or multi-scene sequencing.

Delegate implementation to `remotion-best-practices` plugin skill for:
- React component structure
- `<Composition>` and `<Sequence>` usage
- Rendering workflows (Lambda, Cloud Run, local)
- `<Player>` for web embedding

This skill owns:
- explanatory structure and motion semantics
- the sequence of reveals and what each phase teaches
- whether animation adds value over static

### Remotion SVG/GIF Support

| Input | Supported? | Approach |
|-------|-----------|----------|
| Static SVG | Yes | `<Img>` + `staticFile()` |
| SMIL-animated SVG | No | Must re-implement with `useCurrentFrame()` + `@remotion/paths` |
| GIF | Yes | `@remotion/gif` (`<Gif>`) or `<AnimatedImage>` (v4.0.246+) |
| Animated PNG/WebP | Yes | `<AnimatedImage>` (Chrome/Firefox only) |

### When to Use Which Mode

| Scenario | Use |
|----------|-----|
| Excalidraw diagram animation | Mode 1 (Excalidraw) |
| Quick reaction or emoji loop | Mode 2 (GIF Primitives) |
| Slack/Discord animated emoji | Mode 2 (GIF Primitives) |
| Staged architecture reveal | Mode 3 (Remotion) |
| Path tracing through pipeline | Mode 3 (Remotion) |
| Before/after optimization overlay | Mode 3 (Remotion) |
| Benchmark chart progressive reveal | Mode 1 or Mode 2 |
| Trade-off table | Usually static — skip |

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

---

## Integration with Synapse

### From synapse-excalidraw

1. `synapse-excalidraw` generates `.excalidraw` file, validates, uploads, user confirms
2. Confirmed `.excalidraw` → excalidraw-animate (Mode 1)
3. Exported SVG → speed control → GIF conversion (optional)

### From synapse-figure

1. `synapse-figure` defines what to communicate (intent, type, layout, colors)
2. This skill decides: static is clearer? → stop. Simple loop? → Mode 2. Technical reveal? → Mode 3.

### From synapse-design (blog)

When a blog needs an embedded animated explainer:
1. `synapse-design` defines editorial purpose
2. This skill scopes animation to what teaches
3. Output: `<Player>` embed, rendered video, or animated GIF

---

## Rules

- Do not add motion until the static figure logic is already coherent
- 每个细节必须征得用户同意后才能开始画 Excalidraw
- For GIF Mode: validate file size early, especially for emoji GIFs (64KB strict)
- For Remotion Mode: delegate implementation to `remotion-best-practices` plugin
- Keep animation semantic, not decorative
- Always validate before delivering

## Reference

- excalidraw-animate: https://github.com/dai-shi/excalidraw-animate
- excalidraw-animate web tool: https://dai-shi.github.io/excalidraw-animate
- Remotion Docs: https://www.remotion.dev/docs
- @remotion/paths: https://www.remotion.dev/docs/paths
- @remotion/gif: https://www.remotion.dev/docs/gif
- GIF toolkit: `references/slack-gif-toolkit.md`
- Excalidraw-animate toolkit: `references/exlidraw-gif-toolkit.md`
