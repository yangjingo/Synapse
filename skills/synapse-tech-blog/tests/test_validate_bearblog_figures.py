from pathlib import Path
import subprocess
import sys
import tempfile
import unittest


SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "validate-bearblog-figures.py"
IMAGE = "![Figure 1: The loop compares changes against a fixed evaluator.](https://example.org/figure.png)"
CAPTION = (
    '<span class="notion-figure-desc">**Figure 1** — '
    "The loop compares changes against a fixed evaluator. "
    "[Source](https://example.org/paper)</span>"
)


class BearblogFigureValidationTests(unittest.TestCase):
    def validate(self, body: str) -> subprocess.CompletedProcess[str]:
        with tempfile.TemporaryDirectory() as directory:
            post = Path(directory) / "post.md"
            post.write_text("title: Test\n___\n\n" + body, encoding="utf-8")
            return subprocess.run(
                [sys.executable, str(SCRIPT), str(post)],
                capture_output=True,
                text=True,
            )

    def test_descriptive_caption_and_source_link_pass(self) -> None:
        result = self.validate(IMAGE + "\n" + CAPTION + "\n")
        self.assertEqual(0, result.returncode, result.stderr)
        self.assertIn("Validated 1 figures", result.stdout)

    def test_figure_number_without_description_fails(self) -> None:
        result = self.validate(
            "![Figure 1](https://example.org/figure.png)\n"
            '<span class="notion-figure-desc">**Figure 1**</span>\n'
        )
        self.assertNotEqual(0, result.returncode)
        self.assertIn("needs Figure N plus a description", result.stderr)

    def test_source_credit_is_not_description(self) -> None:
        for credit in ("Source: Paper", "Sources / original figures: Paper"):
            with self.subTest(credit=credit):
                result = self.validate(
                    f"![Figure 1: {credit}](https://example.org/figure.png)\n"
                    '<span class="notion-figure-desc">**Figure 1** — '
                    f"{credit}</span>\n"
                )
                self.assertNotEqual(0, result.returncode)
                self.assertIn("description", result.stderr)

    def test_caption_must_be_adjacent_and_numbered_consistently(self) -> None:
        separated = self.validate(IMAGE + "\n\n" + CAPTION + "\n")
        self.assertNotEqual(0, separated.returncode)
        self.assertIn("next line", separated.stderr)
        mismatched = self.validate(
            IMAGE + "\n" + CAPTION.replace("**Figure 1**", "**Figure 2**") + "\n"
        )
        self.assertNotEqual(0, mismatched.returncode)
        self.assertIn("does not match", mismatched.stderr)

    def test_code_example_does_not_count_as_figure(self) -> None:
        result = self.validate(
            "```md\n"
            "![Figure 1](https://example.org/figure.png)\n"
            '<span class="notion-figure-desc">**Figure 1**</span>\n'
            "```\n"
        )
        self.assertEqual(0, result.returncode, result.stderr)

    def test_html_image_is_not_accepted_as_a_figure(self) -> None:
        result = self.validate('<img src="https://example.org/figure.png" alt="diagram">\n')
        self.assertNotEqual(0, result.returncode)
        self.assertIn("Markdown image syntax", result.stderr)


if __name__ == "__main__":
    unittest.main()
