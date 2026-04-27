import argparse
import os
import re
from dataclasses import dataclass
from typing import Iterable, Optional

STRUCTURE_ALIASES = {
    "cover": "cover",
    "conver": "cover",
    "outline": "outline",
    "agenda": "outline",
    "takeaway": "takeaway",
    "takeaways": "takeaway",
    "summary": "takeaway",
    "reference": "reference",
    "references": "reference",
}

STRUCTURE_PATTERNS = [
    re.compile(r'ui-label[^>]*>\s*(\d{2})\s*/\s*([A-Za-z][A-Za-z-]*)\s*<', re.IGNORECASE),
    re.compile(r'^#{1,3}\s*(\d{2})\s*/\s*([A-Za-z][A-Za-z-]*)\s*$', re.IGNORECASE | re.MULTILINE),
    re.compile(r'<!--\s*(\d{2})\s+([A-Za-z][A-Za-z-]*)\s*-->', re.IGNORECASE),
]

HTML_SECTION_PATTERN = re.compile(r'<section\b[^>]*>(.*?)</section>', re.IGNORECASE | re.DOTALL)
MARKDOWN_SECTION_SPLIT_PATTERN = re.compile(r'^\s*---\s*$', re.MULTILINE)
HTML_LIST_ITEM_PATTERN = re.compile(r'<li\b[^>]*>(.*?)</li>', re.IGNORECASE | re.DOTALL)
MARKDOWN_LIST_ITEM_PATTERN = re.compile(r'^\s*[-*+]\s+(.*)$', re.MULTILINE)
HTML_TAG_PATTERN = re.compile(r'<[^>]+>')
REFERENCE_BOOK_PATTERN = re.compile(r'^(.+?)\s*-\s*(.+?)\s*-\s*(https?://\S+)\s*$', re.IGNORECASE)
REFERENCE_PROJECT_PATTERN = re.compile(r'^(.+?)\s*-\s*(https?://\S+)\s*$', re.IGNORECASE)
VISUAL_PATTERNS = [
    re.compile(r'::image\b', re.IGNORECASE),
    re.compile(r'::code\b', re.IGNORECASE),
    re.compile(r'::math\b', re.IGNORECASE),
    re.compile(r'<img\b', re.IGNORECASE),
    re.compile(r'class=["\'][^"\']*\bvisual-box\b[^"\']*["\']', re.IGNORECASE),
]
PULSE_PATTERNS = [
    re.compile(r'::pulse\b', re.IGNORECASE),
    re.compile(r'class=["\'][^"\']*\bpulse-layer\b[^"\']*["\']', re.IGNORECASE),
]
REFERENCE_TAG_PATTERNS = [
    re.compile(r'::reference\b', re.IGNORECASE),
    re.compile(r'class=["\'][^"\']*\breference-tag\b[^"\']*["\']', re.IGNORECASE),
]
VISUAL_REQUIRED_LABELS = {
    "cover",
    "context",
    "philosophy",
    "mechanism",
    "engineering",
    "tooling",
    "testing",
}


@dataclass(frozen=True)
class SlideSection:
    order: int
    raw_label: str
    canonical_label: Optional[str]
    content: str


def strip_html_tags(text: str) -> str:
    return re.sub(HTML_TAG_PATTERN, " ", text)


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", strip_html_tags(text)).strip()


def count_matches(patterns: list[re.Pattern], content: str) -> int:
    return sum(len(pattern.findall(content)) for pattern in patterns)


def has_any_pattern(content: str, patterns: list[re.Pattern]) -> bool:
    return any(pattern.search(content) for pattern in patterns)


def extract_section_markers(content: str) -> list[SlideSection]:
    markers = []
    seen_positions = set()

    for pattern in STRUCTURE_PATTERNS:
        for match in pattern.finditer(content):
            position = match.start()
            if position in seen_positions:
                continue
            seen_positions.add(position)

            raw_label = match.group(2).strip()
            markers.append(
                SlideSection(
                    order=int(match.group(1)),
                    raw_label=raw_label,
                    canonical_label=STRUCTURE_ALIASES.get(raw_label.lower()),
                    content=content,
                )
            )

    markers.sort(key=lambda marker: marker.order)
    return markers


def extract_sections(file_path: str) -> list[SlideSection]:
    try:
        with open(file_path, "r", encoding="utf-8") as handle:
            content = handle.read()
    except Exception as exc:
        print(f"Error reading {file_path}: {exc}")
        return []

    sections = []
    blocks = HTML_SECTION_PATTERN.findall(content) if "<section" in content.lower() else MARKDOWN_SECTION_SPLIT_PATTERN.split(content)
    for block in blocks:
        markers = extract_section_markers(block)
        if not markers:
            continue
        first = markers[0]
        sections.append(
            SlideSection(
                order=first.order,
                raw_label=first.raw_label,
                canonical_label=first.canonical_label,
                content=block,
            )
        )

    sections.sort(key=lambda section: section.order)
    return sections


def extract_list_items(content: str) -> list[str]:
    html_items = [normalize_text(match) for match in HTML_LIST_ITEM_PATTERN.findall(content)]
    if html_items:
        return html_items
    return [normalize_text(match) for match in MARKDOWN_LIST_ITEM_PATTERN.findall(content)]


def validate_cover(content: str) -> list[str]:
    issues = []
    plain_text = normalize_text(content)

    if not re.search(r"<h1\b", content, re.IGNORECASE) and not re.search(r"^#\s+", content, re.MULTILINE):
        issues.append("Cover needs a main title (`h1` or `#`).")
    if not re.search(r"<h2\b", content, re.IGNORECASE) and not re.search(r"^##\s+", content, re.MULTILINE):
        issues.append("Cover needs a subtitle or thesis line (`h2` or `##`).")
    if not has_any_pattern(plain_text, [re.compile(r"Version", re.IGNORECASE), re.compile(r"版本")]):
        issues.append("Cover needs version metadata.")
    if not has_any_pattern(plain_text, [re.compile(r"Author", re.IGNORECASE), re.compile(r"作者")]):
        issues.append("Cover needs author metadata.")
    if not has_any_pattern(plain_text, [re.compile(r"Date", re.IGNORECASE), re.compile(r"日期")]):
        issues.append("Cover needs date metadata.")
    if count_matches(VISUAL_PATTERNS, content) < 1:
        issues.append("Cover needs one visual element (`::image` or image box).")
    if count_matches(PULSE_PATTERNS, content) < 1:
        issues.append("Cover needs one pulse conclusion (`::pulse`).")

    return issues


def validate_outline(content: str) -> list[str]:
    issues = []
    items = extract_list_items(content)

    if len(items) != 4:
        issues.append(f"Outline needs exactly 4 question items; found {len(items)}.")

    for index, item in enumerate(items, start=1):
        if not re.search(r"\bQ\d+\b", item, re.IGNORECASE) and "?" not in item and "问题" not in item:
            issues.append(f"Outline item {index} should be question-led.")

    if not re.search(r"<h2\b", content, re.IGNORECASE) and not re.search(r"^##\s+", content, re.MULTILINE):
        issues.append("Outline needs a title line (`h2` or `##`).")
    if count_matches(PULSE_PATTERNS, content) < 1:
        issues.append("Outline needs one pulse conclusion (`::pulse`).")

    return issues


def validate_body(section: SlideSection) -> list[str]:
    issues = []
    content = section.content
    items = extract_list_items(content)
    raw_label = section.raw_label.lower()

    if not re.search(r"<h2\b", content, re.IGNORECASE) and not re.search(r"^##\s+", content, re.MULTILINE):
        issues.append("Body section needs a title line (`h2` or `##`).")
    if len(items) < 3:
        issues.append(f"Body section needs at least 3 bullet items; found {len(items)}.")
    if raw_label in VISUAL_REQUIRED_LABELS and count_matches(VISUAL_PATTERNS, content) < 1:
        issues.append("Body section needs one visual element (`::image`, `::code`, or `::math`).")
    if count_matches(PULSE_PATTERNS, content) < 1:
        issues.append("Body section needs one pulse conclusion (`::pulse`).")

    return issues


def validate_takeaway(content: str) -> list[str]:
    issues = []
    items = extract_list_items(content)

    if not re.search(r"<h2\b", content, re.IGNORECASE) and not re.search(r"^##\s+", content, re.MULTILINE):
        issues.append("Takeaway needs a title line (`h2` or `##`).")
    if len(items) != 3:
        issues.append(f"Takeaway needs exactly 3 action items; found {len(items)}.")
    if count_matches(PULSE_PATTERNS, content) < 1:
        issues.append("Takeaway needs one pulse conclusion (`::pulse`).")

    return issues


def validate_reference(content: str) -> list[str]:
    issues = []
    items = extract_list_items(content)
    plain_text = normalize_text(content)

    if not re.search(r"<h2\b", content, re.IGNORECASE) and not re.search(r"^##\s+", content, re.MULTILINE):
        issues.append("Reference needs a title line (`h2` or `##`).")
    if not re.search(r'class=["\'][^"\']*\bref-list\b[^"\']*["\']', content, re.IGNORECASE) and len(items) < 4:
        issues.append("Reference needs a `ref-list` container or at least 4 list items.")

    saw_book_style = False
    saw_project_style = False
    for index, item in enumerate(items, start=1):
        normalized = normalize_text(item)
        if REFERENCE_BOOK_PATTERN.match(normalized):
            saw_book_style = True
            continue
        if REFERENCE_PROJECT_PATTERN.match(normalized):
            saw_project_style = True
            continue

        issues.append(
            f"Reference item {index} should use `Title - Source - URL` or `Title - URL`."
        )

    if not saw_book_style:
        issues.append("Reference needs at least one book-style item (`Title - Source - URL`).")
    if not saw_project_style:
        issues.append("Reference needs at least one project-style item (`Title - URL`).")
    if not re.search(r'https?://', plain_text, re.IGNORECASE):
        issues.append("Reference needs at least one URL.")
    if count_matches(REFERENCE_TAG_PATTERNS, content) < 1:
        issues.append("Reference needs one reference tag (`::reference` or `reference-tag`).")

    return issues


def validate_content(section: SlideSection) -> list[str]:
    if section.canonical_label == "cover":
        return validate_cover(section.content)
    if section.canonical_label == "outline":
        return validate_outline(section.content)
    if section.canonical_label == "takeaway":
        return validate_takeaway(section.content)
    if section.canonical_label == "reference":
        return validate_reference(section.content)
    return validate_body(section)


def collect_target_files(target_path: str):
    absolute_path = os.path.abspath(target_path)
    if os.path.isfile(absolute_path):
        return [absolute_path]
    if not os.path.isdir(absolute_path):
        return []

    files = []
    for root, _, filenames in os.walk(absolute_path):
        if ".git" in root or "node_modules" in root:
            continue

        for file in filenames:
            if file.endswith((".html", ".md")):
                files.append(os.path.join(root, file))

    return files


def validate_project_content(directory: str = "."):
    checked_files = 0
    failed_files = 0

    print(f"--- Scanning directory: {os.path.abspath(directory)} ---")
    for file_path in collect_target_files(directory):
        sections = extract_sections(file_path)
        if not sections:
            continue

        checked_files += 1
        file_issues = []
        for section in sections:
            file_issues.extend(validate_content(section))

        if not file_issues:
            print(f"[  OK  ] {file_path}")
            print("        Content rules OK for cover, body, outline, takeaway, and reference.")
        else:
            failed_files += 1
            print(f"[ FAIL ] {file_path}")
            for issue in file_issues:
                print(f"        {issue}")

    if checked_files == 0:
        print("No slide sections found.")
        return

    print(f"\n--- Content Validation Complete: {checked_files} checked, {failed_files} failed. ---")


def main(argv: Iterable[str] | None = None):
    parser = argparse.ArgumentParser(description="Validate slide content only.")
    parser.add_argument(
        "directory",
        nargs="?",
        default=".",
        help="Directory or file to scan (default: current directory).",
    )
    args = parser.parse_args(list(argv) if argv is not None else None)
    validate_project_content(args.directory)


if __name__ == "__main__":
    main()
