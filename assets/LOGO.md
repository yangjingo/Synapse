# AI Tech Blog Logo

## Logo Design

### Description

The logo combines several elements representing AI research and technical writing:

- **Code Brackets** - Represent programming and technical content
- **Circuit Pattern** - Represents AI/neural network architecture
- **Document Icon** - Represents blog writing and documentation
- **Gradient Colors** - Purple-to-pink gradient (modern tech aesthetic)

### Colors

| Element | Color | Hex |
|---------|-------|-----|
| Primary Gradient | Purple | `#6366f1` → `#8b5cf6` |
| Secondary Gradient | Pink-Orange | `#ec4899` → `#f59e0b` |
| Background | Dark Navy | `#1a1a2e` |
| Text | Light Gray | `#e2e8f0` |

### Usage

#### SVG Logo (Vector)
```html
<img src="assets/logo.svg" alt="AI Tech Blog" width="200">
```

#### PNG Logo (Raster)
Convert the SVG to PNG for use in README files and social media:

```bash
# Using ImageMagick
convert -background none -resize 200x200 assets/logo.svg assets/logo.png

# Using rsvg-convert
rsvg-convert -w 200 -h 200 assets/logo.svg -o assets/logo.png
```

### Logo Variations

#### Light Mode
For light backgrounds, use the inverted version (create by changing `#1a1a2e` to `#ffffff` and text to `#1a1a2e`)

#### Dark Mode
Use the default logo as-is

#### Favicon
For favicons, simplify to just the center circuit pattern:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="4" fill="#ec4899"/>
  <line x1="28" y1="27" x2="22" y2="22" stroke="#6366f1" stroke-width="2"/>
  <line x1="36" y1="27" x2="42" y2="22" stroke="#6366f1" stroke-width="2"/>
  <line x1="28" y1="37" x2="22" y2="42" stroke="#6366f1" stroke-width="2"/>
  <line x1="36" y1="37" x2="42" y2="42" stroke="#6366f1" stroke-width="2"/>
</svg>
```

### Design Tools

To modify the logo:
1. Open `assets/logo.svg` in any text editor (SVG is XML)
2. Or use Figma/Illustrator for visual editing
3. For PNG conversion, use online tools like:
   - [SVG to PNG](https://cloudconvert.com/svg-to-png)
   - [Photopea](https://www.photopea.com/) (free Photoshop alternative)

### Attribution

The logo design is released under the same MIT license as the project.
