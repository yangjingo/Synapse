# Slack GIF Toolkit — Full API Reference

Source: [ComposioHQ/awesome-claude-skills/slack-gif-creator](https://github.com/ComposioHQ/awesome-claude-skills/blob/master/slack-gif-creator/SKILL.md)

A toolkit for creating animated GIFs optimized for Slack. Provides validators, composable animation primitives, and optional helper utilities.

## Core Validators

```python
from core.gif_builder import GIFBuilder

builder = GIFBuilder(width=128, height=128, fps=10)
info = builder.save('emoji.gif', num_colors=48, optimize_for_emoji=True)
```

```python
from core.validators import check_slack_size, validate_dimensions, validate_gif, is_slack_ready

passes, info = check_slack_size('emoji.gif', is_emoji=True)
passes, info = validate_dimensions(128, 128, is_emoji=True)
all_pass, results = validate_gif('emoji.gif', is_emoji=True)
is_slack_ready('emoji.gif', is_emoji=True)
```

## Animation Primitives

### Shake
```python
from templates.shake import create_shake_animation
frames = create_shake_animation(
    object_type='emoji',
    object_data={'emoji': '😱', 'size': 80},
    num_frames=20,
    shake_intensity=15,
    direction='both'  # 'horizontal', 'vertical'
)
```

### Bounce
```python
from templates.bounce import create_bounce_animation
frames = create_bounce_animation(
    object_type='circle',
    object_data={'radius': 40, 'color': (255, 100, 100)},
    num_frames=30,
    bounce_height=150
)
```

### Spin / Rotate
```python
from templates.spin import create_spin_animation, create_loading_spinner
frames = create_spin_animation(
    object_type='emoji',
    object_data={'emoji': '🔄', 'size': 100},
    rotation_type='clockwise',
    full_rotations=2
)
frames = create_spin_animation(rotation_type='wobble', full_rotations=3)
frames = create_loading_spinner(spinner_type='dots')
```

### Pulse / Heartbeat
```python
from templates.pulse import create_pulse_animation, create_attention_pulse
frames = create_pulse_animation(
    object_data={'emoji': '❤️', 'size': 100},
    pulse_type='smooth',
    scale_range=(0.8, 1.2)
)
frames = create_pulse_animation(pulse_type='heartbeat')
frames = create_attention_pulse(emoji='⚠️', num_frames=20)
```

### Fade
```python
from templates.fade import create_fade_animation, create_crossfade
frames = create_fade_animation(fade_type='in')
frames = create_fade_animation(fade_type='out')
frames = create_crossfade(
    object1_data={'emoji': '😊', 'size': 100},
    object2_data={'emoji': '😂', 'size': 100}
)
```

### Zoom
```python
from templates.zoom import create_zoom_animation, create_explosion_zoom
frames = create_zoom_animation(zoom_type='in', scale_range=(0.1, 2.0), add_motion_blur=True)
frames = create_zoom_animation(zoom_type='out')
frames = create_explosion_zoom(emoji='💥')
```

### Explode / Shatter
```python
from templates.explode import create_explode_animation, create_particle_burst
frames = create_explode_animation(explode_type='burst', num_pieces=25)
frames = create_explode_animation(explode_type='shatter')
frames = create_explode_animation(explode_type='dissolve')
frames = create_particle_burst(particle_count=30)
```

### Wiggle / Jiggle
```python
from templates.wiggle import create_wiggle_animation, create_excited_wiggle
frames = create_wiggle_animation(wiggle_type='jello', intensity=1.0, cycles=2)
frames = create_wiggle_animation(wiggle_type='wave')
frames = create_excited_wiggle(emoji='🎉')
```

### Slide
```python
from templates.slide import create_slide_animation, create_multi_slide
frames = create_slide_animation(direction='left', slide_type='in', overshoot=True)
frames = create_slide_animation(direction='left', slide_type='across')
objects = [
    {'data': {'emoji': '🎯', 'size': 60}, 'direction': 'left', 'final_pos': (120, 240)},
    {'data': {'emoji': '🎪', 'size': 60}, 'direction': 'right', 'final_pos': (240, 240)}
]
frames = create_multi_slide(objects, stagger_delay=5)
```

### Flip
```python
from templates.flip import create_flip_animation, create_quick_flip
frames = create_flip_animation(
    object1_data={'emoji': '😊', 'size': 120},
    object2_data={'emoji': '😂', 'size': 120},
    flip_axis='horizontal'
)
frames = create_quick_flip('👍', '👎')
```

### Morph / Transform
```python
from templates.morph import create_morph_animation, create_reaction_morph
frames = create_morph_animation(
    object1_data={'emoji': '😊', 'size': 100},
    object2_data={'emoji': '😂', 'size': 100},
    morph_type='crossfade'
)
frames = create_morph_animation(morph_type='scale')
frames = create_morph_animation(morph_type='spin_morph')
```

### Move
```python
from templates.move import create_move_animation
frames = create_move_animation(
    object_type='emoji',
    object_data={'emoji': '🚀', 'size': 60},
    start_pos=(50, 240), end_pos=(430, 240),
    motion_type='linear', easing='ease_out'
)
frames = create_move_animation(
    object_type='emoji',
    object_data={'emoji': '⚽', 'size': 60},
    start_pos=(50, 350), end_pos=(430, 350),
    motion_type='arc',
    motion_params={'arc_height': 150}
)
frames = create_move_animation(
    object_type='emoji',
    object_data={'emoji': '🌍', 'size': 50},
    motion_type='circle',
    motion_params={'center': (240, 240), 'radius': 120, 'angle_range': 360}
)
```

### Kaleidoscope
```python
from templates.kaleidoscope import apply_kaleidoscope, create_kaleidoscope_animation, apply_simple_mirror
kaleido_frame = apply_kaleidoscope(frame, segments=8)
frames = create_kaleidoscope_animation(base_frame=my_frame, num_frames=30, segments=8, rotation_speed=1.0)
mirrored = apply_simple_mirror(frame, mode='quad')  # 'horizontal', 'vertical', 'quad', 'radial'
```

## Helper Utilities

### Text Rendering
```python
from core.typography import draw_text_with_outline, TYPOGRAPHY_SCALE
draw_text_with_outline(frame, "BONK!", position=(240, 100),
    font_size=TYPOGRAPHY_SCALE['h1'], text_color=(255, 68, 68),
    outline_color=(0, 0, 0), outline_width=4, centered=True)
```

### Color Palettes
```python
from core.color_palettes import get_palette
palette = get_palette('vibrant')  # 'pastel', 'dark', 'neon', 'professional'
```

### Visual Effects
```python
from core.visual_effects import ParticleSystem, create_impact_flash, create_shockwave_rings
particles = ParticleSystem()
particles.emit_sparkles(x=240, y=200, count=15)
particles.emit_confetti(x=240, y=200, count=20)
particles.update()
particles.render(frame)
frame = create_impact_flash(frame, position=(240, 200), radius=100)
frame = create_shockwave_rings(frame, position=(240, 200), radii=[30, 60, 90])
```

### Easing
```python
from core.easing import interpolate, calculate_arc_motion
y = interpolate(start=0, end=400, t=progress, easing='ease_in')
y = interpolate(start=0, end=400, t=progress, easing='bounce_out')
# Available: linear, ease_in, ease_out, ease_in_out, bounce_out, elastic_out, back_out
```

### Frame Composition
```python
from core.frame_composer import create_gradient_background, draw_emoji_enhanced, draw_circle_with_shadow, draw_star
frame = create_gradient_background(480, 480, top_color, bottom_color)
draw_emoji_enhanced(frame, '🎉', position=(200, 200), size=80, shadow=True)
```

## Example: Simple Reaction
```python
builder = GIFBuilder(128, 128, 10)
for i in range(12):
    frame = Image.new('RGB', (128, 128), (240, 248, 255))
    scale = 1.0 + math.sin(i * 0.5) * 0.15
    size = int(60 * scale)
    draw_emoji_enhanced(frame, '😱', position=(64-size//2, 64-size//2), size=size, shadow=False)
    builder.add_frame(frame)
builder.save('reaction.gif', num_colors=40, optimize_for_emoji=True)
```

## Example: Bounce + Flash
```python
builder = GIFBuilder(480, 480, 20)
for i in range(15):
    frame = create_gradient_background(480, 480, (240, 248, 255), (200, 230, 255))
    t = i / 14
    y = interpolate(0, 350, t, 'ease_in')
    draw_emoji_enhanced(frame, '⚽', position=(220, int(y)), size=80)
    builder.add_frame(frame)
for i in range(8):
    frame = create_gradient_background(480, 480, (240, 248, 255), (200, 230, 255))
    if i < 3:
        frame = create_impact_flash(frame, (240, 350), radius=120, intensity=0.6)
    draw_emoji_enhanced(frame, '⚽', position=(220, 350), size=80)
    if i > 2:
        draw_text_with_outline(frame, "GOAL!", position=(240, 150),
            font_size=60, text_color=(255, 68, 68),
            outline_color=(0, 0, 0), outline_width=4, centered=True)
    builder.add_frame(frame)
builder.save('goal.gif', num_colors=128)
```

## Dependencies
```bash
pip install pillow imageio numpy
```
