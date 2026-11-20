# excalidraw-animate API Reference

Reference for animating Excalidraw drawings and the mermaid-to-excalidraw conversion pipeline.

## excalidraw-animate

Source: https://github.com/dai-shi/excalidraw-animate
NPM: https://www.npmjs.com/package/excalidraw-animate

### Install

```bash
npm install excalidraw-animate
```

### Web Tool

Interactive animation tool: https://dai-shi.github.io/excalidraw-animate

Three ways to load content:
1. **Load File** — `.excalidraw` or `.json` file
2. **Load Library** — `.excalidrawlib` file (each item animated separately)
3. **Enter link + Animate!** — Excalidraw shareable link or direct library URL

Supported link formats:
- `https://excalidraw.com/#json=xxxxx,yyyyy`
- Direct link to `.excalidrawlib` file

### Animation Order

Elements without explicit animation order are treated as Order=0 and animate in creation order.

**Grouped elements:**
- Default: 5 seconds total, divided among group members
- Individual elements: 500ms default duration each
- Override by setting custom Duration per element

**Mixed groups:**
- When grouped elements have different Order/Duration values, input shows empty with "Mixed" placeholder
- Leave empty → original values preserved
- Enter new value → applies to all selected elements

### Export Formats

| Format | Quality | Notes |
|--------|---------|-------|
| SVG | Vector, perfect | Recommended. Can be loaded back into Animate mode |
| WebM | Video | Known issues — use screen capture as fallback |

### Edit vs Animate Mode

- **Edit mode and Animate mode maintain separate data**
- To preserve editability: export from Edit mode with "Embed scene" enabled
- Files loaded in Animate mode only available in Animate mode
- SVG exported from Animate mode cannot be edited in Edit mode

---

## @excalidraw/mermaid-to-excalidraw

NPM: https://www.npmjs.com/package/@excalidraw/mermaid-to-excalidraw
Docs: https://docs.excalidraw.com/docs/@excalidraw/mermaid-to-excalidraw/api

### Install

```bash
npm install @excalidraw/mermaid-to-excalidraw
```

### API

Two-step conversion process:

```javascript
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";

const mermaidSyntax = `
flowchart TD
    A[Request] -->|process| B(Server)
    B --> C{Decision}
    C -->|Yes| D[Laptop]
    C -->|No| E[iPhone]
`;

// Step 1: Parse mermaid to skeleton elements
const { elements, files } = await parseMermaidToExcalidraw(mermaidSyntax, {
  fontSize: 20,
});

// Step 2: Convert to fully qualified excalidraw elements
const excalidrawElements = convertToExcalidrawElements(elements);
```

### Supported Diagram Types

**Flowcharts (full native support):**

| Mermaid Shape | Syntax | Excalidraw Shape |
|---------------|--------|-----------------|
| Rectangle | `A[Text]` | Rectangle |
| Rounded rect | `A(Text)` | Rectangle |
| Circle | `A((Text))` | Ellipse |
| Diamond | `A{Text}` | Diamond |
| Arrow | `A --> B` | Arrow |

**Subgraphs:** Fully supported — grouped in Excalidraw.

**Fallback to Rectangle (unsupported shapes):**

| Mermaid Shape | Syntax |
|---------------|--------|
| Subroutine | `A[[Text]]` |
| Cylindrical | `A[(Text)]` |
| Asymmetric | `A>Text]` |
| Hexagon | `A{{Text}}` |
| Parallelogram | `A[/Text/]` |
| Trapezoid | `A[/Text\]` |

**Not supported as native Excalidraw shapes:**
- Markdown strings → fallback to regular text
- FontAwesome icons → not rendered
- Cross arrowheads → fallback to bar arrowhead

**All other diagram types** (sequence, class, ER, Gantt, git, etc.) are rendered as a static image, not native Excalidraw elements.

### Flowchart Syntax Reference

```
flowchart TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]
```

```
flowchart LR
    id1((Hello from Circle))
```

Subgraph example:
```
flowchart TB
    c1-->a2
    subgraph one
        a1-->a2
    end
    subgraph two
        b1-->b2
    end
    subgraph three
        c1-->c2
    end
```

---

## Screenshot → Excalidraw Conversion

When input is a screenshot/image of a diagram, use AI vision to extract structure and reconstruct as Excalidraw JSON.

### Extraction Prompt

When analyzing a diagram screenshot, extract:

1. **Shapes** — type (rect/diamond/ellipse), position (approximate x,y), size, text content
2. **Connections** — source shape, target shape, direction, label text
3. **Layout** — overall direction (TD/LR), spacing, grouping

### Mapping to Excalidraw Elements

```
Screenshot observation → Excalidraw element:

Rectangle/box     → { "type": "rectangle", ... }
Rounded box       → { "type": "rectangle", "roundness": { "type": 3 } }
Circle/oval       → { "type": "ellipse", ... }
Diamond/decision  → { "type": "diamond", ... }
Arrow/connector   → { "type": "arrow", "startBinding": {...}, "endBinding": {...} }
Text label        → { "type": "text", ... } or "label" shorthand on shape
```

### Positioning Strategy

1. Identify the top-left-most element as anchor point
2. Estimate relative positions based on screenshot layout
3. Apply consistent spacing (200-300px horizontal, 150-200px vertical)
4. Add camera viewport to frame the diagram
5. Validate: all arrow bindings reference valid element IDs

### Validation Checklist

- [ ] All shapes have unique `id` values
- [ ] All arrow `startBinding`/`endBinding` reference existing element IDs
- [ ] Camera aspect ratio is 4:3
- [ ] Text content matches original screenshot
- [ ] Layout direction (TD/LR) matches original
- [ ] Dark mode background added for Synapse outputs
