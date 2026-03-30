import re
import sys

class TasteJudger:
    """
    Why.J Engineering Theater - Taste Judger
    Validates technical presentations against the "O(1) Cognitive Load" protocol.
    """

    COLORS = {
        "accent": "#d97757",
        "main": "#1E1E1E",
        "marker_bg": "rgba(217, 119, 87, 0.12)"
    }

    LAYOUT_RULES = {
        "logic_split": 0.65,
        "visual_split": 0.35,
        "rotation": -1.5,
        "shadow": "12px 12px 0px #1E1E1E"
    }

    def __init__(self, content):
        self.content = content
        self.scores = {"Style": 0, "Color": 0, "Layout": 0}
        self.findings = []

    def judge_style(self):
        """[Style] O(1) Cognitive Load & DSL Usage."""
        # Check for @pulse conclusion
        pulses = re.findall(r"@pulse:", self.content)
        if pulses:
            self.scores["Style"] += 40
        else:
            self.findings.append("Missing @pulse: Every slide needs a heavy conclusion.")

        # Check for Atomization (O(1) logic) - items per slide
        slides = self.content.split("---")
        for i, slide in enumerate(slides):
            items = len(re.findall(r"^\s*-\s+", slide, re.MULTILINE))
            if items > 5:
                self.findings.append(f"Slide {i}: Too many points ({items}). Break O(1) rule.")
            elif items > 0:
                self.scores["Style"] += 5

        # Check for Marker Effect
        if "==" in self.content:
            self.scores["Style"] += 10
        else:
            self.findings.append("Missing ==marker==: No visual emphasis for core logic.")

    def judge_color(self):
        """[Color] Claude Aesthetics & Brand Trust."""
        # In DSL, we check for intent. In HTML/CSS context, we'd check HEX.
        if "#d97757" in self.content or "accent" in self.content.lower():
            self.scores["Color"] += 60
        else:
            self.findings.append("Wrong Palette: Use #d97757 (Claude Red/Orange) for trust.")

        if "shadow" in self.content.lower() or "12px" in self.content:
            self.scores["Color"] += 40
        else:
            self.findings.append("Missing Hard Shadows: Logic needs weight.")

    def judge_layout(self):
        """[Layout] 65/35 Asymmetry & Push-Left."""
        # Check for Visual blocks mapping to 35% side
        visual_blocks = re.findall(r"::visual|::code|::math", self.content)
        if visual_blocks:
            self.scores["Layout"] += 50
        else:
            self.findings.append("Symmetry detected: Use ::visual blocks for 65/35 asymmetry.")

        # Check for Push-Left intent (absence of center tags/styles in DSL)
        if "center" not in self.content.lower():
            self.scores["Layout"] += 50
        else:
            self.findings.append("Avoid 'center' alignment: Push-Left is the only layout truth.")

    def run(self):
        self.judge_style()
        self.judge_color()
        self.judge_layout()
        
        total_score = sum(self.scores.values()) / 3
        print(f"--- Why.J Taste Report ---")
        print(f"Overall Taste: {total_score:.1f}/100")
        for cat, score in self.scores.items():
            print(f"  - {cat}: {score}/100")
        
        if self.findings:
            print("\nCritical Improvements:")
            for f in self.findings:
                print(f"  [!] {f}")
        
        if total_score > 80:
            print("\nVerdict: SEAMLESS ENGINEERING THEATER. (Ship it!)")
        else:
            print("\nVerdict: REFACTOR REQUIRED. (Too much noise.)")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        path = sys.argv[1]
        with open(path, "r", encoding="utf-8") as f:
            judger = TasteJudger(f.read(), path)
            judger.run()
    else:
        print("Usage: python taste_judger.py <markdown_file>")
ys.argv) > 1:
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            judger = TasteJudger(f.read())
            judger.run()
    else:
        print("Usage: python taste_judger.py <markdown_file>")
