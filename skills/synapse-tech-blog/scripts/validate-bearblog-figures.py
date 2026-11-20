#!/usr/bin/env python3
"""Reject Bearblog Markdown figures without a descriptive caption."""

from __future__ import annotations

import argparse
from pathlib import Path
import re
import sys


IMAGE = re.compile(r"^!\[(?P<alt>[^\]]*)\]\((?P<url>.+)\)$")
ALT = re.compile(r"^Figure (?P<number>\d+):\s*(?P<description>.+)$")
CAPTION = re.compile(
    r'^<span class="notion-figure-desc">\*\*Figure (?P<number>\d+)\*\*\s*—\s*(?P<description>.*?)</span>$'
)
SOURCE_ONLY = re.compile(
    r"^(?:sources?(?:\s*/\s*original figures?)?|image source|references?)\s*[:：]",
    re.IGNORECASE,
)
PLACEHOLDER = re.compile(
    r"^(?:todo|tbd|caption\s+(?:needed|missing)|description\s+(?:needed|missing)|\[\s*description)",
    re.IGNORECASE,
)
FENCE = re.compile(r"^\s*(?P<marker>`{3,}|~{3,})")


def validate(path: Path) -> tuple[int, list[str]]:
    lines = path.read_text(encoding="utf-8-sig").splitlines()
    errors: list[str] = []
    caption_lines: set[int] = set()
    code_lines: set[int] = set()
    figure_numbers: list[int] = []
    fence_marker: str | None = None

    for index, line in enumerate(lines):
        fence = FENCE.match(line)
        if fence:
            code_lines.add(index)
            marker = fence.group("marker")
            if fence_marker is None:
                fence_marker = marker
            elif marker[0] == fence_marker[0] and len(marker) >= len(fence_marker):
                fence_marker = None
            continue
        if fence_marker is not None:
            code_lines.add(index)
            continue
        if re.search(r"<img\b", line, re.IGNORECASE):
            errors.append(f"{path}:{index + 1}: figures must use Markdown image syntax")
        if "![" not in line:
            continue

        number = index + 1
        image = IMAGE.fullmatch(line)
        if image is None:
            errors.append(f"{path}:{number}: image must occupy one Markdown line")
            continue
        alt = ALT.fullmatch(image.group("alt"))
        if (
            alt is None
            or not alt.group("description").strip()
            or SOURCE_ONLY.match(alt.group("description").strip())
            or PLACEHOLDER.match(alt.group("description").strip())
        ):
            errors.append(f"{path}:{number}: image alt needs Figure N plus a description")
            continue
        if not image.group("url").startswith("https://"):
            errors.append(f"{path}:{number}: figure needs an HTTPS image URL")

        figure_number = int(alt.group("number"))
        figure_numbers.append(figure_number)
        caption_index = index + 1
        caption = CAPTION.fullmatch(lines[caption_index]) if caption_index < len(lines) else None
        if caption is None:
            errors.append(f"{path}:{number}: Figure {figure_number} needs a caption on the next line")
            continue
        caption_lines.add(caption_index)
        if int(caption.group("number")) != figure_number:
            errors.append(f"{path}:{caption_index + 1}: caption number does not match Figure {figure_number}")
        description = caption.group("description").strip()
        if not description or SOURCE_ONLY.match(description) or PLACEHOLDER.match(description):
            errors.append(f"{path}:{caption_index + 1}: Figure {figure_number} needs a substantive description")

    for index, line in enumerate(lines):
        if index not in code_lines and 'class="notion-figure-desc"' in line and index not in caption_lines:
            errors.append(f"{path}:{index + 1}: orphan or malformed figure caption")
    expected = list(range(1, len(figure_numbers) + 1))
    if figure_numbers != expected:
        errors.append(f"{path}: figure numbers must be consecutive from 1; found {figure_numbers}")
    return len(figure_numbers), errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("post", type=Path, help="Bearblog Markdown post to validate")
    args = parser.parse_args()
    count, errors = validate(args.post)
    if errors:
        print("\n".join(errors), file=sys.stderr)
        return 1
    print(f"Validated {count} figures in {args.post}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
