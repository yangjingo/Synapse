# SLIDES-STYLE: Why.J Engineering Theater Full Protocol

## 1. Visual Constitution (TASET)

- **Palette**: Main #1E1E1E | Accent #d97757 | Marker rgba(217, 119, 87, 0.12).
- **Layout**: Push-Left (5% margin), 40% right-side whitespace.
- **Typography**: Gochi Hand (Handwriting) | JetBrains Mono (Code) | KaTeX (Math).

## 2. Mandatory Structural Layering

Every Why.J presentation MUST follow this 10-page logic to maintain Agentic Taste:

- **00 / Cover**: Identity (Why.J) & Title.
- **01 / Context**: The "Why Now?" logic & Global Handshake.
- **02 / Agenda**: 4 Questions-based logic tree (No-bullet, Push-left).
- **03-08 / Mechanism**: Deep engineering sub-logics (Flexible based on content). All points MUST be expanded.
- **09 / Takeaways**: Final action-oriented summary.
- **10 / Reference**: Source verification page.

## 3. The Rendering Engine (HTML Source)

```html
<!DOCTYPE html>
<html lang="zh">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>Why.J Engineering Theater</title>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reset.min.css"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.min.css"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.7/katex.min.css"
    />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.7/katex.min.js"></script>
    <link
      href="https://fonts.googleapis.com/css2?family=Gochi+Hand&family=JetBrains+Mono&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --bg-color: #ffffff;
        --grid-line: #fafafa;
        --main-color: #1e1e1e;
        --accent-claude: #d97757;
        --item-bg: rgba(217, 119, 87, 0.05);
        --strong-bg: rgba(217, 119, 87, 0.12);
        --font-hand: "Gochi Hand", cursive;
        --font-mono: "JetBrains Mono", monospace;
        --shadow: 12px 12px 0px #1e1e1e;
      }
      body {
        background-color: var(--bg-color);
        background-image:
          linear-gradient(var(--grid-line) 1px, transparent 1px),
          linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
        background-size: 40px 40px;
      }
      .reveal {
        font-family: var(--font-hand);
        color: var(--main-color);
      }
      .reveal .slides {
        text-align: left;
      }
      a {
        color: var(--accent-claude) !important;
        text-decoration: none !important;
      }
      .header-layer {
        border-bottom: 8px solid var(--main-color);
        margin-bottom: 60px;
        padding-bottom: 25px;
      }
      .header-layer h2 {
        font-family: var(--font-hand) !important;
        font-weight: 800;
        font-size: clamp(2.5rem, 6vw, 5rem) !important;
        margin: 0 !important;
        color: var(--main-color) !important;
      }
      .canvas-layer {
        display: grid;
        grid-template-columns: 65% 35%;
        gap: 60px;
        align-items: start;
        min-height: 500px;
      }
      .canvas-layer.push-left {
        display: flex !important;
        justify-content: flex-start !important;
        align-items: center !important;
        width: 100%;
        min-height: 400px;
        padding-left: 5%;
      }
      .canvas-text {
        font-size: clamp(1.2rem, 2.8vw, 2.5rem);
        line-height: 1.4;
      }
      .canvas-text ul {
        list-style: none;
        padding: 0;
        margin: 0;
        display: inline-block;
        text-align: left;
      }
      .canvas-text li {
        margin-bottom: 30px;
        position: relative;
        padding: 15px 15px 15px 55px;
        border-radius: 8px;
        transition: background 0.2s ease;
      }
      .canvas-text li:hover {
        background: var(--item-bg);
      }
      .canvas-text li::before {
        content: "→";
        position: absolute;
        left: 15px;
        font-weight: 800;
        color: var(--accent-claude);
      }
      .no-bullet .canvas-text li {
        padding-left: 20px;
      }
      .no-bullet .canvas-text li::before {
        content: "";
      }
      strong {
        background: var(--strong-bg);
        padding: 2px 8px;
        border-radius: 4px;
        display: inline-block;
        transform: rotate(-0.5deg);
        font-weight: 800;
      }
      .visual-box {
        border: 6px solid var(--main-color);
        background: #fff;
        height: 400px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        padding: 40px;
        box-shadow: var(--shadow);
        position: relative;
        transform: scale(var(--visual-scale, 1)) translateY(var(--visual-y, 0));
        transform-origin: center;
      }
      .code-container {
        border: 4px solid var(--main-color);
        background: #1e1e1e;
        padding: 20px;
        box-shadow: var(--shadow);
        border-radius: 8px;
        width: 100%;
      }
      pre {
        margin: 0 !important;
        background: transparent !important;
      }
      code {
        font-family: var(--font-mono) !important;
        font-size: 0.85rem !important;
        color: #d4d4d4 !important;
      }
      .pulse-layer {
        position: absolute;
        bottom: 20px;
        left: 55px;
        background: #fff;
        border: 6px solid var(--main-color);
        padding: 25px 50px;
        transform: rotate(var(--pulse-rotate, -1.5deg))
          translateY(var(--pulse-y, 0)) scale(var(--pulse-scale, 1));
        transform-origin: center;
        box-shadow: var(--shadow);
        font-weight: 800;
        font-size: clamp(1rem, 2.5vw, 2rem);
        z-index: 10;
      }
      .ui-label {
        position: absolute;
        top: 10px;
        right: 15px;
        font-family: var(--font-hand);
        font-size: 1.2rem;
        opacity: 0.4;
        letter-spacing: 2px;
        text-transform: uppercase;
      }
      .footer-watermark {
        position: absolute;
        bottom: 30px;
        right: 30px;
        font-family: var(--font-hand);
        font-size: 0.8rem;
        opacity: 0.15;
        color: #999;
      }
    </style>
  </head>
  <body>
    <div class="reveal">
      <div class="slides">
        <!-- 00 Cover -->
        <section data-transition="none">
          <div
            class="header-layer"
            style="border-bottom: none; padding-left: 5%; margin-top: 10%;"
          >
            <div class="ui-label">00 / Cover</div>
            <h1
              style="font-size: clamp(3.5rem, 8vw, 6rem); font-weight: 800; margin: 0;"
            >
              Why.J Theater
            </h1>
            <div class="footer-watermark">whyj + nano banano + 2026/03/30</div>
          </div>
        </section>
      </div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/reveal.js/4.3.1/reveal.js"></script>
    <script>
      Reveal.initialize({
        hash: true,
        center: true,
        transition: "none",
        width: 1400,
        height: 900,
        margin: 0.05,
      });
    </script>
  </body>
</html>
```
