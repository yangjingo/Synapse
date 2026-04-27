# Torchvista Usage Guide

This document merges the upstream torchvista README-style usage with this repo's optional CLI wrapper.

Original project:

- GitHub: `https://github.com/sachinhosmani/torchvista`
- Purpose: interactive PyTorch forward-pass visualization
- Original usage model: notebook-first

## 0. How To Tell The Model To Use It

If the goal is to guide an agent or model, the right instruction is not "use this repo locally first".

The right instruction is closer to:

- install `torchvista`
- trace the model with `trace_model(...)`
- export `html`, `svg`, or `png`
- explain the major modules in the graph

This is the same spirit as `DESIGN.md` usage from the Awesome DESIGN.md README:

- give the model the design or tool spec
- tell it to use that spec
- only add repo-local wrappers when they materially simplify execution

For torchvista, the equivalent is:

- give the model the torchvista usage pattern
- give it the model code to trace
- ask for a readable structural graph

In this repo, the local CLI is optional, not the primary concept.

When a repo-local command is useful, the CLI entrypoint is:

- [scripts/torchvista_cli.py](C:/Users/yangjing/Project/tech-blog/skills/torchvista-model-visualization/scripts/torchvista_cli.py)

## 1. What This Tool Is For

`torchvista` is good at visualizing:

- forward graph structure
- nested module hierarchy
- repeated blocks
- tensor flow for debugging architecture wiring

It is especially useful when you want to inspect:

- a custom Transformer block
- MoE routing block boundaries
- an `mHC`-style preprocessing or postprocessing wrapper
- a reduced DeepSeek-V3/V4 style attention experiment

It is not a whole-model compiler IR viewer. It is a forward-pass visualization tool.

## 2. Why A CLI Wrapper Exists

The upstream project is notebook-centric. That is fine for exploration, but it is awkward when you want:

- repeatable local usage
- a stable repo tool entrypoint
- exported `html`, `svg`, or `png`
- a small contract for model experiments without rewriting notebook cells

This repo therefore wraps `torchvista.trace_model(...)` behind a small CLI, but the wrapper is only a convenience layer over the upstream usage pattern.

## 3. Upstream Mental Model First

The model should understand torchvista like this:

1. import your PyTorch module
2. build example inputs
3. call `trace_model(model, inputs, ...)`
4. inspect the interactive graph
5. export when needed

That is the primary usage model. Everything else in this document is a packaging layer around that.

## 4. Install

You need:

1. PyTorch
2. torchvista

Install `torchvista`:

```bash
pip install torchvista
```

Or:

```bash
conda install -c conda-forge torchvista
```

The upstream repository describes `torchvista` as a notebook tool that can export `png`, `svg`, and `html`, and exposes visualization through `trace_model(...)`.

## 5. Required Contract For A Repo-Local Model File

Create a Python file that exports two callables:

```python
def build_model():
    ...

def build_inputs(model):
    ...
```

Rules:

- `build_model()` must return a `torch.nn.Module`
- `build_inputs(model)` should return the example input or input tuple
- if you do not need the model argument, `build_inputs()` without parameters also works

## 6. Minimal Example

Example file pattern: `assets/examples/*.py`

```python
import torch
import torch.nn as nn


class LinearModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear = nn.Linear(10, 5)

    def forward(self, x):
        return self.linear(x)


def build_model():
    return LinearModel()


def build_inputs(model):
    return torch.randn(2, 10)
```

## 7. CLI Usage

Basic HTML export:

```bash
python skills/torchvista-model-visualization/scripts/torchvista_cli.py ^
  --model-file skills/torchvista-model-visualization/assets/examples/torchvista_deepseek_v4_mhc_example.py ^
  --export-format html ^
  --export-path output/torchvista/linear.html
```

SVG export:

```bash
python skills/torchvista-model-visualization/scripts/torchvista_cli.py ^
  --model-file skills/torchvista-model-visualization/assets/examples/torchvista_deepseek_v4_mhc_example.py ^
  --export-format svg
```

PNG export:

```bash
python skills/torchvista-model-visualization/scripts/torchvista_cli.py ^
  --model-file skills/torchvista-model-visualization/assets/examples/torchvista_deepseek_v4_mhc_example.py ^
  --export-format png
```

More detailed tracing:

```bash
python skills/torchvista-model-visualization/scripts/torchvista_cli.py ^
  --model-file skills/torchvista-model-visualization/assets/examples/torchvista_deepseek_v4_attention_example.py ^
  --export-format html ^
  --export-path output/torchvista/linear-deep.html ^
  --collapse-modules-after-depth 2 ^
  --forced-module-tracing-depth 3 ^
  --show-module-attr-names ^
  --show-compressed-view
```

## 8. CLI Flags

Required:

- `--model-file`

Optional:

- `--model-fn`
  - default: `build_model`
- `--inputs-fn`
  - default: `build_inputs`
- `--export-format`
  - `html`, `svg`, or `png`
  - default: `html`
- `--export-path`
  - explicit output path
- `--collapse-modules-after-depth`
  - default: `1`
- `--forced-module-tracing-depth`
  - default: `None`
- `--height`
  - default: `800`
- `--width`
  - default: auto
- `--hide-non-gradient-nodes`
- `--show-module-attr-names`
- `--show-compressed-view`

## 9. Recommended Output Policy

Use:

- `html` for exploration
- `svg` for blog figures or documentation embedding
- `png` for quick sharing when vector is not needed

Recommended local output folder:

- `output/torchvista/`

## 10. DeepSeek-Style Usage

For your current repo, the most realistic usage is not trying to visualize the full DeepSeek-V4 production graph directly. Instead, use `torchvista` for reduced experimental modules:

- a toy `CSA` block
- a toy `HCA` block
- an `mHC` wrapper
- a simplified DeepSeek-style transformer layer
- a local MoE block prototype

That gives you something interpretable.

Trying to dump a massive production model end-to-end will usually produce a graph that is too large to be editorially useful.

## 11. Good Use Cases

Good:

- inspect custom PyTorch research modules
- debug tensor shape flow
- verify nested module structure
- export architecture visuals for notes and internal docs

Bad:

- full trillion-parameter production graph introspection
- framework-level performance profiling
- kernel scheduling analysis
- exact compiler or autograd internals reconstruction

## 12. Relationship To The Upstream API

The wrapper is a thin layer over upstream `trace_model(...)`.

Upstream parameters documented in the repository include:

- `show_non_gradient_nodes`
- `collapse_modules_after_depth`
- `forced_module_tracing_depth`
- `height`
- `width`
- `export_format`
- `show_module_attr_names`
- `export_path`
- `show_compressed_view`

This CLI exposes the same controls in a repo-friendly form.

## 13. Practical Advice

If you want useful diagrams:

1. start with a reduced module
2. export to `html` first
3. only then produce `svg` or `png`
4. keep tracing depth shallow unless you really need internals
5. use compressed view only when repeated blocks dominate the graph

## 14. Troubleshooting

### `torchvista is not installed`

Install it first:

```bash
pip install torchvista
```

### `PyTorch is not installed`

Install PyTorch for your environment before running the wrapper.

### `build_model not found`

Your model file must export the callable named by `--model-fn`.

### `build_inputs not found`

Your model file must export the callable named by `--inputs-fn`.

### Export path behaves differently for non-HTML formats

The upstream docs explicitly document custom `export_path` support most clearly for HTML. If `png` or `svg` path handling is inconsistent, export to the default behavior first, then move the artifact.

## 15. Suggested Next Step For This Repo

If you want, the next practical addition is:

- a `assets/examples/torchvista_deepseek_block_example.py`

That file can model a simplified DeepSeek-style block with:

- attention path
- MoE or FFN path
- `mHC`-like pre/post wrapper

Then this CLI becomes immediately useful for your DeepSeek article and technical notes.

## 16. DeepSeek-V4 Modeling Views Prepared In This Repo

For the Hugging Face inference modeling in:

- `https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/tree/main/inference`

this repo now includes two torchvista-ready structural examples:

- [torchvista_deepseek_v4_mhc_example.py](C:/Users/yangjing/Project/tech-blog/skills/torchvista-model-visualization/assets/examples/torchvista_deepseek_v4_mhc_example.py)
- [torchvista_deepseek_v4_attention_example.py](C:/Users/yangjing/Project/tech-blog/skills/torchvista-model-visualization/assets/examples/torchvista_deepseek_v4_attention_example.py)

They do not attempt to reproduce the full production model numerically. They are reduced structural visualizations derived from `inference/model.py` so that the graph remains readable.

### View A: `mHC` block

This example focuses on:

- `hc_pre`
- attention branch
- `hc_post`
- second `hc_pre`
- MoE/FFN branch
- final `hc_post`

Run:

```bash
python skills/torchvista-model-visualization/scripts/torchvista_cli.py ^
  --model-file skills/torchvista-model-visualization/assets/examples/torchvista_deepseek_v4_mhc_example.py ^
  --export-format html ^
  --export-path output/torchvista/deepseek-v4-mhc.html ^
  --collapse-modules-after-depth 2 ^
  --show-module-attr-names
```

### View B: hybrid attention block

This example focuses on:

- q / kv normalization
- sliding-window attention branch
- compressor branch
- sparse index selection
- gathered compressed path
- output merge

Run:

```bash
python skills/torchvista-model-visualization/scripts/torchvista_cli.py ^
  --model-file skills/torchvista-model-visualization/assets/examples/torchvista_deepseek_v4_attention_example.py ^
  --export-format html ^
  --export-path output/torchvista/deepseek-v4-hybrid-attention.html ^
  --collapse-modules-after-depth 2 ^
  --show-module-attr-names
```

### Why only two views

This is deliberate.

The full `Transformer` in the Hugging Face inference file contains:

- quantization-specific linear layers
- compressor and indexer subgraphs
- sparse attention
- MoE routing
- Hyper-Connections
- MTP extensions

Trying to visualize all of that at once is technically possible but editorially weak. These two views isolate the two most distinctive modeling ideas:

- `mHC`
- hybrid long-context attention

## 17. Repo-Validated Environment

Validated local stack for this repo:

- Python `3.11`
- `torch==2.5.1+cpu`
- `torchvista==0.2.11`

This CPU-only route was verified locally for HTML export on Windows.
