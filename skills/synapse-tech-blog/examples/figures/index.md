# Pretext Example Figures

The files in this directory make both HTML examples self-contained. Refresh them from the repository root with:

```bash
node skills/synapse-tech-blog/examples/generate-figures.js
```

| Figure | Used by | Purpose |
| --- | --- | --- |
| `figure-01-cost-curve.svg` | `dsv4-blog-layout.html` | DeepSeek-V4 cost comparison |
| `figure-02-hybrid-attention.svg` | `dsv4-blog-layout.html` | Hybrid attention architecture |
| `opd-01-performance-compute.svg` | `dsv4-blog-opd-en.html` | Performance versus compute |
| `opd-02-rl-gradient-cancellation.svg` | `dsv4-blog-opd-en.html` | RL gradient cancellation |
| `opd-03-sft-gradient-bias.svg` | `dsv4-blog-opd-en.html` | SFT constructive interference |
| `opd-04-pivot-token.svg` | `dsv4-blog-opd-en.html` | Pivot-token KL concentration |
| `opd-05-three-dials.svg` | `dsv4-blog-opd-en.html` | Unified post-training controls |
| `opd-06-pareto-frontier.svg` | `dsv4-blog-opd-en.html` | Compute–reward Pareto frontier |

All outputs use `#FAFAF7` paper, `#4A4338` ink, warm Morandi fills, and `#C45A20` as the only strong accent. `generated_by: synapse-tech-blog/examples/generate-figures.js`.
