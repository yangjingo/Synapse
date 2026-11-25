from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

from bs4 import BeautifulSoup


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "build-notion-html.py"


class NotionCopyPageTests(unittest.TestCase):
    def build(self, source_name: str, source_text: str) -> BeautifulSoup:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / source_name
            output = root / "notion-test.html"
            source.write_text(source_text, encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(SCRIPT), "--input", str(source), "--output", str(output)],
                capture_output=True,
                text=True,
                check=True,
            )
            self.assertIn("Built", result.stdout)
            return BeautifulSoup(output.read_text(encoding="utf-8"), "html.parser")

    def test_markdown_rich_copy_and_bottom_caption(self) -> None:
        page = self.build(
            "article.md",
            "title: Demo\n___\n\n**Bold** [Paper](https://example.org/paper)\n\n"
            "![Chart](https://example.org/chart.png)\n"
            '<span class="notion-figure-desc">**Figure 1** — [Source](https://example.org/source)</span>\n',
        )
        body = page.select_one("#notion-content")
        self.assertIsNotNone(page.select_one("#copy-button"))
        self.assertEqual("Demo", page.h1.get_text(strip=True))
        self.assertEqual(1, len(body.select("img")))
        self.assertEqual(1, len(body.select("p:has(> img) + p")))
        self.assertEqual(2, len(body.select("a[href^='https://']")))
        self.assertEqual("Bold", body.strong.get_text(strip=True))

    def test_local_image_is_flagged(self) -> None:
        page = self.build("article.md", "# Demo\n\n![Local](figures/local.png)\n")
        self.assertIn("本地或非 HTTPS 图片", page.select_one(".warning").get_text())
        self.assertTrue(page.select_one("#notion-content img")["src"].startswith("file:"))

    def test_html_source_removes_scripts_and_handlers(self) -> None:
        page = self.build(
            "article.html",
            '<html><head><title>Demo</title></head><body><article>'
            '<h1>Demo</h1><p onclick="alert(1)">Hello</p><script>alert(1)</script>'
            '</article></body></html>',
        )
        body = page.select_one("#notion-content")
        self.assertEqual("Hello", body.get_text(" ", strip=True))
        self.assertIsNone(body.select_one("script"))
        self.assertIsNone(body.select_one("[onclick]"))


if __name__ == "__main__":
    unittest.main()
