# Pretext example figures

The example articles use eight editable 16:9 SVGs. Run the generator from the repository root:

```bash
node skills/synapse-tech-blog/examples/generate-figures.js
```

| Figure | Used by | What it shows |
| --- | --- | --- |
| `figure-01-cost-curve.svg` | DeepSeek-V4 examples | Single-token FLOPs and KV cache size at 1M context on two equal percentage scales |
| `figure-02-hybrid-attention.svg` | DeepSeek-V4 examples | Aligned CSA and HCA layers with their own local KV paths |
| `opd-01-performance-compute.svg` | `dsv4-blog-opd-en.html` | Schematic post-training curves and the teacher reference |
| `opd-02-rl-gradient-cancellation.svg` | `dsv4-blog-opd-en.html` | Noisy token gradients and the averaged update |
| `opd-03-sft-gradient-bias.svg` | `dsv4-blog-opd-en.html` | Aligned token gradients on the same layout |
| `opd-04-pivot-token.svg` | `dsv4-blog-opd-en.html` | Illustrative KL concentration on a labeled logarithmic axis |
| `opd-05-three-dials.svg` | `dsv4-blog-opd-en.html` | Three controls in aligned method columns |
| `opd-06-pareto-frontier.svg` | `dsv4-blog-opd-en.html` | Schematic reward–KL frontier and concentration caveat |

The cost comparison uses estimates reported in the DeepSeek-V4 technical report. The hybrid attention drawing summarizes its CSA and HCA layer structures. Each OPD figure illustrates a concept, and the captions describe the assumptions and toy values. [DeepSeek-V4 Technical Report](https://arxiv.org/html/2606.19348v1)

The figures follow the [Warm Minimal diagram guide](../../references/image.md). They use a warm ivory surround, quiet gray panels, open arrowheads, and one muted accent where it identifies the point of the figure. The articles carry the figure titles, explanatory captions, and sources.
