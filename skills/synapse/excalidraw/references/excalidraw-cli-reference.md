# excalidraw-cli Reference

Complete reference for creating `.excalidraw` files from the command line.

Source: https://github.com/ahmadawais/excalidraw-cli

## Install

```bash
npm install -g excalidraw-cli
# or run directly
npx excalidraw-cli create --json '[...]' -o output.excalidraw
```

## Commands

### `create` — Create a diagram

```bash
# From inline JSON
excalidraw create --json '[...]' -o diagram.excalidraw

# From a JSON file
excalidraw create elements.json -o diagram.excalidraw

# From stdin
cat elements.json | excalidraw create -o output.excalidraw

# From existing .excalidraw (re-process)
excalidraw create existing.excalidraw -o new.excalidraw

# Skip checkpoint
excalidraw create elements.json --no-checkpoint
```

### `export` — Upload to excalidraw.com

```bash
excalidraw export diagram.excalidraw
# → https://excalidraw.com/#json=abc123,key
```

### `reference` (alias: `ref`) — Element format cheat sheet

```bash
excalidraw reference       # Colorized output
excalidraw ref --raw       # Raw markdown
```

### `checkpoint` (alias: `cp`) — Manage diagram state

```bash
excalidraw checkpoint list
excalidraw checkpoint save mydiagram file.excalidraw
excalidraw checkpoint load mydiagram -o out.excalidraw
excalidraw checkpoint remove mydiagram
```

## Built-in Defaults

The CLI auto-applies hand-drawn styling:

| Property | Default | Applies To |
|----------|---------|------------|
| `roughness` | `2` (sloppy/hand-drawn) | Shapes, arrows |
| `roundness` | `{ "type": 3 }` (rounded corners) | Shapes |
| `fontFamily` | `1` (Excalifont/Virgil handwritten) | Text |

All overridable by setting them explicitly.

## Element Types

### Camera (viewport)

Must be 4:3 ratio. Presets:

| Size | Width | Height |
|------|-------|--------|
| S | 400 | 300 |
| M | 600 | 450 |
| L | 800 | 600 |
| XL | 1200 | 900 |
| XXL | 1600 | 1200 |

```json
{ "type": "cameraUpdate", "width": 1200, "height": 900, "x": 0, "y": 100 }
```

### Rectangle

```json
{
  "type": "rectangle",
  "id": "b1",
  "x": 100, "y": 100,
  "width": 220, "height": 90,
  "backgroundColor": "#1e3a5f",
  "fillStyle": "solid",
  "strokeColor": "#4a9eed",
  "label": { "text": "My Box", "strokeColor": "#e5e5e5" },
  "boundElements": [{ "id": "a1", "type": "arrow" }]
}
```

### Ellipse

```json
{
  "type": "ellipse",
  "id": "e1",
  "x": 80, "y": 230,
  "width": 160, "height": 120,
  "backgroundColor": "#1a4d4d",
  "fillStyle": "solid",
  "strokeColor": "#06b6d4",
  "label": { "text": "Cache\n(Redis)", "fontSize": 18 }
}
```

### Diamond (decision)

```json
{
  "type": "diamond",
  "id": "d1",
  "x": 400, "y": 260,
  "width": 260, "height": 180,
  "backgroundColor": "#5c3d1a",
  "fillStyle": "solid",
  "strokeColor": "#f59e0b",
  "label": { "text": "Valid?\nCredentials?" }
}
```

### Arrow (connection)

```json
{
  "type": "arrow",
  "id": "a1",
  "x": 280, "y": 395,
  "width": 200, "height": 0,
  "points": [[0,0],[200,0]],
  "endArrowhead": "arrow",
  "strokeColor": "#4a9eed",
  "startBinding": { "elementId": "b1", "fixedPoint": [1, 0.5] },
  "endBinding": { "elementId": "b2", "fixedPoint": [0, 0.5] },
  "label": { "text": "process", "strokeColor": "#a0a0a0" }
}
```

**fixedPoint positions:**
- Right: `[1, 0.5]`
- Left: `[0, 0.5]`
- Top: `[0.5, 0]`
- Bottom: `[0.5, 1]`

### Text (standalone)

```json
{
  "type": "text",
  "id": "title",
  "x": 280, "y": -20,
  "text": "Kitchen Sink: All Features",
  "fontSize": 28,
  "strokeColor": "#e5e5e5"
}
```

### Dark Mode Background

```json
{
  "type": "rectangle",
  "id": "darkbg",
  "x": -4000, "y": -3000,
  "width": 10000, "height": 7500,
  "backgroundColor": "#1e1e2e",
  "fillStyle": "solid",
  "strokeColor": "transparent",
  "strokeWidth": 0
}
```

### Zone (background area with opacity)

```json
{
  "type": "rectangle",
  "id": "zone1",
  "x": -30, "y": 30,
  "width": 550, "height": 380,
  "backgroundColor": "#1e3a5f",
  "fillStyle": "solid",
  "opacity": 30,
  "strokeColor": "transparent"
}
```

## Label Shorthand

Use `label` on shapes and arrows — CLI auto-expands to bound text elements:

```json
{ "type": "rectangle", "id": "b1", "x": 100, "y": 100, "width": 200, "height": 80,
  "backgroundColor": "#a5d8ff", "fillStyle": "solid",
  "label": { "text": "My Label", "fontSize": 20, "strokeColor": "#333" } }
```

Optional label properties: `fontSize` (default 20), `fontFamily`, `strokeColor`.

Works on: `rectangle`, `ellipse`, `diamond`, `arrow`.

## Color Palette (Dark Mode)

| Role | Color | Usage |
|------|-------|-------|
| Background | `#1e1e2e` | Dark mode canvas |
| Primary | `#4a9eed` | Primary stroke/accents |
| Primary fill | `#1e3a5f` | Primary shape fill |
| Warning | `#f59e0b` | Decision/warning strokes |
| Warning fill | `#5c3d1a` | Decision shape fill |
| Success | `#22c55e` | Success/positive strokes |
| Success fill | `#1a4d2e` | Success shape fill |
| Danger | `#ef4444` | Error/negative strokes |
| Danger fill | `#5c1a1a` | Error shape fill |
| Info | `#06b6d4` | Info strokes |
| Info fill | `#1a4d4d` | Info shape fill |
| Purple | `#8b5cf6` | Secondary accent strokes |
| Purple fill | `#2d1b69` | Secondary accent fill |
| Text light | `#e5e5e5` | Primary text on dark |
| Text muted | `#a0a0a0` | Labels, secondary text |

## Programmatic API

```javascript
import {
  createDiagram,
  parseElements,
  buildExcalidrawFile,
  filterDrawElements,
  resolveElements,
  generateCheckpointId,
  checkCameraAspectRatio,
} from "excalidraw";

import { FileCheckpointStore, MemoryCheckpointStore } from "excalidraw";
import { exportToUrl } from "excalidraw";
import { REFERENCE } from "excalidraw";
```

### Create a diagram

```javascript
const store = new MemoryCheckpointStore();
const result = await createDiagram(
  JSON.stringify([
    { type: "rectangle", id: "r1", x: 100, y: 100, width: 200, height: 100 },
  ]),
  store,
);
// result.file — complete .excalidraw file object
// result.checkpointId — unique ID for this diagram state
// result.warnings — validation warnings
```

### Export to URL

```javascript
const url = await exportToUrl(JSON.stringify(excalidrawFileData));
// → https://excalidraw.com/#json=...
```

### Checkpoint management

```javascript
const store = new FileCheckpointStore(); // ~/.excalidraw/checkpoints/
await store.save("my-diagram", { elements: [...] });
const data = await store.load("my-diagram");
const ids = await store.list();
await store.remove("my-diagram");
```
