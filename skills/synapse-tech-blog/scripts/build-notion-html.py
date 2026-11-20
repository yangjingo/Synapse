#!/usr/bin/env python3
"""Build a local, one-click rich-HTML copy page from an approved article."""

from __future__ import annotations

import argparse
from html import escape
from pathlib import Path
import re

try:
    from bs4 import BeautifulSoup
    from markdown_it import MarkdownIt
except ImportError as exc:
    raise SystemExit("Install markdown-it-py and beautifulsoup4 to build the Notion copy page.") from exc


TEMPLATE = """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{TITLE}} · Notion 复制页</title>
  <style>
    :root { color-scheme: light; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
    body { max-width: 900px; margin: 0 auto; padding: 28px 20px 80px; color: #242424; line-height: 1.7; }
    .toolbar { position: sticky; top: 0; z-index: 2; padding: 14px 0; background: #fff; border-bottom: 1px solid #ddd; }
    button { border: 0; border-radius: 8px; padding: 10px 16px; background: #2f6f5e; color: white; font: inherit; cursor: pointer; }
    button:hover { background: #255748; }
    .hint, #status { font-size: .9rem; color: #555; }
    .warning { padding: 10px 14px; border-left: 3px solid #a66b21; background: #fff8ec; }
    #notion-content { padding-top: 20px; }
    #notion-content img { display: block; max-width: 100%; height: auto; }
    #notion-content table { border-collapse: collapse; max-width: 100%; }
    #notion-content th, #notion-content td { border: 1px solid #ccc; padding: 6px 9px; }
    #notion-content pre { overflow-x: auto; padding: 12px; background: #f5f5f5; }
  </style>
</head>
<body>
  <div class="toolbar">
    <button type="button" id="copy-button">复制到 Notion</button>
    <span id="status" role="status" aria-live="polite"></span>
  </div>
  <h1>{{TITLE}}</h1>
  <p class="hint">按钮只复制下方正文。请在 Notion 中先设置页面标题，再粘贴并检查图片、表格、代码块和链接。</p>
  {{WARNING}}
  <main id="notion-content">{{BODY}}</main>
  <script>
    document.getElementById('copy-button').addEventListener('click', async () => {
      const content = document.getElementById('notion-content');
      const status = document.getElementById('status');
      const html = content.innerHTML;
      const plain = content.innerText;
      try {
        if (!navigator.clipboard || !window.ClipboardItem) throw new Error('Clipboard API unavailable');
        await navigator.clipboard.write([new ClipboardItem({
          'text/html': new Blob([html], {type: 'text/html'}),
          'text/plain': new Blob([plain], {type: 'text/plain'})
        })]);
        status.textContent = '已复制；请粘贴到 Notion 并检查结果。';
      } catch (_) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(content);
        selection.removeAllRanges();
        selection.addRange(range);
        const copied = document.execCommand('copy');
        selection.removeAllRanges();
        status.textContent = copied
          ? '已复制；请粘贴到 Notion 并检查结果。'
          : '自动复制失败；请手动选中下方正文复制。';
      }
    });
  </script>
</body>
</html>
"""


def parse_source(path: Path) -> tuple[str, BeautifulSoup]:
    text = path.read_text(encoding="utf-8-sig")
    title = path.stem
    if path.suffix.lower() == ".md":
        lines = text.splitlines()
        if lines and lines[0].startswith("title: "):
            title = lines[0][7:].strip()
            separator = next((i for i, line in enumerate(lines[:30]) if line.strip() == "___"), None)
            if separator is not None:
                text = "\n".join(lines[separator + 1 :])
        parser = MarkdownIt("commonmark", {"html": True}).enable("table").enable("strikethrough")
        soup = BeautifulSoup(parser.render(text), "html.parser")
    elif path.suffix.lower() in {".html", ".htm"}:
        page = BeautifulSoup(text, "html.parser")
        if page.title and page.title.get_text(strip=True):
            title = page.title.get_text(" ", strip=True)
        source = page.find("article") or page.find("main") or page.body
        if source is None:
            raise ValueError("The HTML source has no article, main, or body element.")
        soup = BeautifulSoup(source.decode_contents(), "html.parser")
    else:
        raise ValueError("Input must be a .md or .html file.")

    first = soup.find(re.compile(r"^h1$"))
    if first and title == path.stem:
        title = first.get_text(" ", strip=True)
    if first and first.get_text(" ", strip=True) == title:
        first.decompose()
    return title, soup


def clean_for_notion(soup: BeautifulSoup, source_path: Path) -> list[str]:
    warnings: list[str] = []
    for tag in list(soup.find_all(["script", "style", "button", "nav", "form", "iframe", "object", "embed"])):
        tag.decompose()

    # Markdown image + caption uses one paragraph; make the caption a distinct Notion block.
    for span in list(soup.select("span.notion-figure-desc")):
        parent = span.parent
        if parent and parent.name == "p" and parent.find("img", recursive=False):
            caption = soup.new_tag("p")
            for child in list(span.contents):
                caption.append(child.extract())
            parent.insert_after(caption)
            span.decompose()

    if soup.find("svg"):
        warnings.append("含内嵌 SVG：Notion 粘贴后可能需要另行上传图片。")
    for tag in soup.find_all(True):
        for attr in list(tag.attrs):
            if attr.lower().startswith("on") or attr.lower() in {"style", "class", "id"}:
                del tag.attrs[attr]
        for attr in ("href", "src"):
            value = tag.get(attr)
            if not value:
                continue
            if value.lower().startswith("javascript:"):
                del tag.attrs[attr]
            elif attr == "src" and tag.name == "img" and not value.startswith("https://"):
                if not re.match(r"^[a-z][a-z0-9+.-]*:", value, re.I):
                    tag[attr] = (source_path.parent / value).resolve().as_uri()
                warnings.append(f"本地或非 HTTPS 图片：{value}；粘贴后请在 Notion 中重新上传或换成公开 HTTPS 图片。")
    return warnings


def build(input_path: Path, output_path: Path) -> tuple[str, list[str]]:
    if not input_path.is_file():
        raise FileNotFoundError(input_path)
    title, soup = parse_source(input_path)
    warnings = clean_for_notion(soup, input_path)
    warning_html = "".join(f'<p class="warning">{escape(message)}</p>' for message in warnings)
    page = TEMPLATE.replace("{{TITLE}}", escape(title)).replace("{{WARNING}}", warning_html).replace("{{BODY}}", str(soup))
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(page, encoding="utf-8")
    return title, warnings


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, required=True, help="Reviewed .md or .html article")
    parser.add_argument("--output", type=Path, help="Target notion-<slug>.html")
    args = parser.parse_args()
    slug = re.sub(r"^(?:bearlog|notion)-", "", args.input.stem, flags=re.I)
    output = args.output or args.input.with_name(f"notion-{slug}.html")
    title, warnings = build(args.input.resolve(), output.resolve())
    print(f"Built {output.resolve()} for {title!r}; warnings: {len(warnings)}")


if __name__ == "__main__":
    main()
