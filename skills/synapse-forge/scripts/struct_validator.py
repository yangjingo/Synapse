import argparse
import os
import re
from dataclasses import dataclass
from typing import Iterable

# Canonical slide slots.
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
REQUIRED_SLOTS = ["cover", "outline", "takeaway", "reference"]
MIN_BODY_PAGES = 5

# Recognize the slot label from HTML slides or markdown DSL.
STRUCTURE_PATTERNS = [
    re.compile(r'ui-label[^>]*>\s*(\d{2})\s*/\s*([A-Za-z][A-Za-z-]*)\s*<', re.IGNORECASE),
    re.compile(r'^#{1,3}\s*(\d{2})\s*/\s*([A-Za-z][A-Za-z-]*)\s*$', re.IGNORECASE | re.MULTILINE),
    re.compile(r'<!--\s*(\d{2})\s+([A-Za-z][A-Za-z-]*)\s*-->', re.IGNORECASE),
]

HTML_SECTION_PATTERN = re.compile(r'<section\b[^>]*>(.*?)</section>', re.IGNORECASE | re.DOTALL)
MARKDOWN_SECTION_SPLIT_PATTERN = re.compile(r'^\s*---\s*$', re.MULTILINE)


@dataclass(frozen=True)
class SlideSection:
    order: int
    raw_label: str
    canonical_label: str | None


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
                )
            )

    markers.sort(key=lambda marker: marker.order)
    return markers


def extract_structure_markers(file_path: str) -> list[SlideSection]:
    try:
        with open(file_path, "r", encoding="utf-8") as handle:
            content = handle.read()
    except Exception as exc:
        print(f"Error reading {file_path}: {exc}")
        return []

    markers = []
    if "<section" in content.lower():
        sections = HTML_SECTION_PATTERN.findall(content)
    else:
        sections = MARKDOWN_SECTION_SPLIT_PATTERN.split(content)

    for section_content in sections:
        section_markers = extract_section_markers(section_content)
        if not section_markers:
            continue
        markers.append(section_markers[0])

    markers.sort(key=lambda marker: marker.order)
    return markers


def validate_structure(file_path: str) -> tuple[bool, list[str]]:
    markers = extract_structure_markers(file_path)
    if not markers:
        return False, []

    first_seen: dict[str, SlideSection] = {}
    for marker in markers:
        if marker.canonical_label is None:
            continue
        first_seen.setdefault(marker.canonical_label, marker)

    missing = [slot for slot in REQUIRED_SLOTS if slot not in first_seen]
    if missing:
        return False, [f"Missing required slide sections: {', '.join(missing)}"]

    sequence = [first_seen[slot].order for slot in REQUIRED_SLOTS]
    if sequence != sorted(sequence):
        details = " -> ".join(
            f"{slot}({first_seen[slot].order:02d}/{first_seen[slot].raw_label})"
            for slot in REQUIRED_SLOTS
        )
        return False, [f"Required slide sections are out of order: {details}"]

    body_pages = [
        marker
        for marker in markers
        if first_seen["outline"].order < marker.order < first_seen["takeaway"].order
    ]
    if len(body_pages) < MIN_BODY_PAGES:
        return False, [
            f"Need at least {MIN_BODY_PAGES} body pages between outline and takeaway; found {len(body_pages)}."
        ]

    return True, [
        "Structure OK: "
        + ", ".join(
            f"{slot}={first_seen[slot].order:02d}/{first_seen[slot].raw_label}"
            for slot in REQUIRED_SLOTS
        )
        + f", body_pages={len(body_pages)}",
    ]


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


def validate_project_structure(directory: str = "."):
    checked_files = 0
    failed_files = 0

    print(f"--- Scanning directory: {os.path.abspath(directory)} ---")
    for file_path in collect_target_files(directory):
        markers = extract_structure_markers(file_path)
        if not markers:
            continue

        checked_files += 1
        ok, messages = validate_structure(file_path)
        if ok:
            print(f"[  OK  ] {file_path}")
            for message in messages:
                print(f"        {message}")
        else:
            failed_files += 1
            print(f"[ FAIL ] {file_path}")
            for message in messages:
                print(f"        {message}")

    if checked_files == 0:
        print("No slide structure markers found.")
        return

    print(f"\n--- Structure Validation Complete: {checked_files} checked, {failed_files} failed. ---")


def main(argv: Iterable[str] | None = None):
    parser = argparse.ArgumentParser(description="Validate slide structure only.")
    parser.add_argument(
        "directory",
        nargs="?",
        default=".",
        help="Directory or file to scan (default: current directory).",
    )
    args = parser.parse_args(list(argv) if argv is not None else None)
    validate_project_structure(args.directory)


if __name__ == "__main__":
    main()
