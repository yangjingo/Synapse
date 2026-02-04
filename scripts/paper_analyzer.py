#!/usr/bin/env python3
"""
Paper Analyzer for AI Tech Blog

Extracts key insights from research papers for blog writing.
Supports PDF files and arXiv URLs.
"""

import re
import sys
from pathlib import Path
from typing import Dict, List, Optional

try:
    import PyPDF2
except ImportError:
    print("PyPDF2 not installed. Install with: pip install PyPDF2")
    sys.exit(1)


class PaperAnalyzer:
    """Analyzes research papers to extract blog-relevant content."""

    def __init__(self, source: str):
        """
        Initialize with paper source (file path or arXiv URL).

        Args:
            source: Path to PDF file or arXiv URL
        """
        self.source = source
        self.text = ""
        self.metadata = {}

    def extract_text(self) -> str:
        """Extract text from PDF file."""
        if self.source.startswith("http"):
            raise NotImplementedError(
                "URL extraction not yet implemented. "
                "Download the PDF and provide the file path."
            )

        pdf_path = Path(self.source)
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {self.source}")

        with open(pdf_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            self.text = ""
            for page in reader.pages:
                self.text += page.extract_text() + "\n"

        return self.text

    def extract_title(self) -> str:
        """Extract paper title from first page."""
        lines = self.text.split("\n")[:20]
        # Title is usually in first few lines, often all caps or title case
        for line in lines[:5]:
            line = line.strip()
            if 10 < len(line) < 150 and not line.startswith("Abstract"):
                return line
        return "Unknown Title"

    def extract_abstract(self) -> str:
        """Extract the abstract section."""
        abstract_match = re.search(
            r"Abstract\s*\n(.*?)(?=\n\s*(Introduction|Keywords|1\.|\I\.))",
            self.text,
            re.DOTALL | re.IGNORECASE
        )
        if abstract_match:
            return abstract_match.group(1).strip()
        return ""

    def extract_introduction(self) -> str:
        """Extract introduction section."""
        intro_match = re.search(
            r"Introduction\s*\n(.*?)(?=\n\s*(2\.|Related Work|Method|II\.))",
            self.text,
            re.DOTALL | re.IGNORECASE
        )
        if intro_match:
            return intro_match.group(1).strip()[:2000]  # First 2000 chars
        return ""

    def extract_contributions(self) -> List[str]:
        """Extract key contributions from intro/conclusion."""
        contributions = []

        # Look for contribution statements
        patterns = [
            r"Our (?:main )?(?:contributions?:?|contributions?:?) (?:are:|include)",
            r"We (?:propose|present|introduce|make? the following contributions?)",
            r"The (?:main )?contributions?:? (?:of this paper are|include)",
        ]

        for pattern in patterns:
            matches = re.finditer(pattern, self.text, re.IGNORECASE)
            for match in matches:
                # Get text after match, up to next section or 500 chars
                start = match.end()
                following_text = self.text[start:start + 1000]
                # Extract bullet points or numbered list
                items = re.findall(
                    r"(?:[\-\*]|\d+[\.\)]|\([a-z]\))\s*([^.\n]{20,150})",
                    following_text
                )
                if items:
                    contributions.extend([item.strip() for item in items[:5]])
                    break

        return contributions[:5]  # Max 5 contributions

    def extract_method_summary(self) -> str:
        """Extract brief method summary."""
        # Look for method section
        method_match = re.search(
            r"(?:Method|Methodology|Approach|Model|3\.|III\.)\s*\n(.*?)(?=\n\s*(4\.|Experiments|Results|Discussion|IV\.))",
            self.text,
            re.DOTALL | re.IGNORECASE
        )
        if method_match:
            return method_match.group(1).strip()[:1500]
        return ""

    def extract_results(self) -> str:
        """Extract key results."""
        results_match = re.search(
            r"(?:Results|Experiments|Evaluation|4\.|IV\.)\s*\n(.*?)(?=\n\s*(5\.|Discussion|Conclusion|Related Work|V\.))",
            self.text,
            re.DOTALL | re.IGNORECASE
        )
        if results_match:
            # First 1000 chars usually contain main results
            return results_match.group(1).strip()[:1000]
        return ""

    def extract_metrics(self) -> Dict[str, str]:
        """Extract performance metrics."""
        metrics = {}

        # Common patterns
        patterns = [
            (r"accuracy\s+(?:of\s+)?(?:[\d\.]+%?|(\d+\.?\d*)\%)", "accuracy"),
            (r"F1[ -]?score\s*(?::)?\s*([\d\.]+)", "f1_score"),
            (r"BLEU\s*(?::)?\s*([\d\.]+)", "bleu"),
            (r"perplexity\s*(?::)?\s*([\d\.]+)", "perplexity"),
        ]

        text_lower = self.text.lower()
        for pattern, metric_name in patterns:
            matches = re.findall(pattern, text_lower)
            if matches:
                metrics[metric_name] = matches[0]

        return metrics

    def extract_limitations(self) -> List[str]:
        """Extract limitations or future work."""
        limitations = []

        # Look for limitations/future work sections
        sections = re.findall(
            r"(?:Limitations?|Future Work|Discussion)\s*\n(.*?)(?=\n\s*(?:\d+\.|References|Acknowledgements|Conclusion))",
            self.text,
            re.DOTALL | re.IGNORECASE
        )

        for section in sections:
            # Extract sentences with limitation keywords
            sentences = re.split(r"[.\n]", section)
            for sent in sentences:
                if any(word in sent.lower() for word in
                       ["limit", "constraint", "cannot", "does not", "fails", "future"]):
                    if 30 < len(sent.strip()) < 300:
                        limitations.append(sent.strip())

        return limitations[:3]  # Max 3 limitations

    def format_for_blog(self) -> str:
        """Format extracted content for blog writing."""
        self.extract_text()

        title = self.extract_title()
        abstract = self.extract_abstract()
        intro = self.extract_introduction()
        contributions = self.extract_contributions()
        method = self.extract_method_summary()
        results = self.extract_results()
        metrics = self.extract_metrics()
        limitations = self.extract_limitations()

        output = f"""# Paper Analysis: {title}

## Problem Statement
{abstract if abstract else intro[:500]}

## Key Contributions
"""
        if contributions:
            for i, contrib in enumerate(contributions, 1):
                output += f"{i}. {contrib}\n"
        else:
            output += "[Contributions not automatically detected - extract from intro]\n"

        output += f"""
## Technical Approach
{method[:500] if method else "[Method summary - extract from Method section]"}

## Key Results
{results[:500] if results else "[Results summary - extract from Results section]"}

"""

        if metrics:
            output += "## Metrics\n"
            for metric, value in metrics.items():
                output += f"- {metric}: {value}\n"
            output += "\n"

        if limitations:
            output += "## Limitations\n"
            for limitation in limitations:
                output += f"- {limitation}\n"

        return output


def main():
    """CLI interface."""
    if len(sys.argv) < 2:
        print("Usage: python paper_analyzer.py <pdf_file_path>")
        print("\nExtracts key insights from research papers for blog writing.")
        sys.exit(1)

    source = sys.argv[1]
    analyzer = PaperAnalyzer(source)

    try:
        result = analyzer.format_for_blog()
        print(result)
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
