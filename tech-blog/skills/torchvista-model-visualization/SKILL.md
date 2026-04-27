---
name: torchvista-model-visualization
description: Visualize PyTorch model structure with torchvista and explain how to use it from the upstream README workflow or from a local CLI wrapper when one exists. Use when the user wants to inspect a model graph, trace a PyTorch module, turn a model file into a clickable structure diagram, or generate DeepSeek-style architecture views from modeling code. This skill is especially relevant when the user mentions torchvista, PyTorch graph visualization, model tracing, notebook-based graph rendering, or asks to draw model structure from a local file or Hugging Face modeling implementation.
---

# Torchvista Model Visualization

Use this skill to turn PyTorch modules into structural diagrams.

Prefer this skill when the user wants model topology, module nesting, or a graph view of forward-path composition.

Do not use it for training, benchmarking, CUDA kernel debugging, or full numerical parity with upstream models.

## Read

Read only what is needed:

1. `references/cli-manual.md`
2. `scripts/torchvista_cli.py` when a repo-local CLI contract matters
3. `assets/examples/torchvista_deepseek_v4_mhc_example.py` when the task is about DeepSeek-V4 mHC block structure
4. `assets/examples/torchvista_deepseek_v4_attention_example.py` when the task is about DeepSeek-V4 hybrid attention structure

## Default posture

Start with the upstream torchvista usage model:

- install `torchvista`
- call `trace_model(...)`
- export `html`, `svg`, or `png`
- explain what the graph means

Only switch to repo-local CLI instructions when:

- the user explicitly wants a reusable CLI tool
- the repo already contains a wrapper script
- deterministic repo-local commands are more useful than notebook snippets

## Environment

When the task needs a concrete local stack for this repo, use this validated CPU-only setup:

- Python `3.11`
- `torch==2.5.1+cpu`
- `torchvista==0.2.11`

The bundled examples are CPU-only structure sketches. They do not require CUDA or Triton.

## Workflow

### 1. Verify scope

Confirm the task is about structure visualization, not model training or exact reproduction.

### 2. Pick the input source

Use one of these:

- a local model file that defines `build_model()` and `build_inputs()`
- a bundled example under `assets/examples/`
- a notebook or script that already follows the upstream `trace_model(...)` pattern

### 3. Choose the operating mode

Prefer this order:

1. explain the upstream torchvista usage in README terms
2. adapt that usage to the user's model
3. use `scripts/torchvista_cli.py` only when repo-local CLI execution is the better interface

Prefer `html` first because it preserves interactivity and is easier to inspect.

### 4. Summarize the graph

After exporting, explain the major structural blocks:

- normalization
- projections
- attention path
- expert path
- compressor/indexer path
- residual or hyper-connection composition

## Rules

- Keep examples clearly labeled as structural sketches when they are not exact upstream implementations.
- Prefer CPU-only tracing unless the user explicitly needs GPU-specific behavior.
- Do not claim architectural equivalence with upstream models unless the code actually matches.
- Do not overfit the explanation to this repo's file layout when the user really needs general torchvista usage guidance.
- When there is an upstream README or notebook-oriented workflow, summarize it first and then mention repo-specific helpers second.
