#!/usr/bin/env python3
"""CLI wrapper around torchvista.trace_model for local model visualization.

Recommended dependency set for this repo on Windows:

- Python 3.11
- torch==2.5.1+cpu
- torchvista==0.2.11

Rationale:

- The local DeepSeek-V4 structure examples are CPU-only visualization stubs.
- No CUDA kernels are required for graph tracing or HTML export.
- The Python 3.11 + CPU torch route is the stable path verified in this repo.

Expected user model file interface:

- build_model() -> torch.nn.Module
- build_inputs(model) -> Any

Optional:

- build_inputs() -> Any

This script keeps the contract intentionally small so it can wrap arbitrary
local PyTorch experiments without turning the repo into a framework.
"""

from __future__ import annotations

import argparse
import importlib.util
import sys
from pathlib import Path
from typing import Any


def _load_module(module_path: Path):
    spec = importlib.util.spec_from_file_location(module_path.stem, module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load module from {module_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _maybe_import_torch():
    try:
        import torch  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "PyTorch is not installed. Install a CPU-only build first, for example "
            "`uv pip install --python <python311> --torch-backend cpu 'torch<2.6' torchvista`."
        ) from exc
    return torch


def _maybe_import_torchvista():
    try:
        from torchvista import trace_model  # type: ignore
    except ImportError as exc:
        raise RuntimeError(
            "torchvista is not installed. Run `pip install torchvista` or "
            "`conda install -c conda-forge torchvista` first."
        ) from exc
    return trace_model


def _resolve_callable(module: Any, name: str):
    fn = getattr(module, name, None)
    if fn is None or not callable(fn):
        raise RuntimeError(
            f"Expected callable `{name}` in {module.__file__}, but it was not found."
        )
    return fn


def _build_inputs(module: Any, model: Any, inputs_fn_name: str):
    build_inputs = _resolve_callable(module, inputs_fn_name)
    try:
        return build_inputs(model)
    except TypeError:
        return build_inputs()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Visualize a local PyTorch model with torchvista and export HTML/SVG/PNG."
    )
    parser.add_argument(
        "--model-file",
        required=True,
        help="Path to a Python file that defines build_model() and build_inputs().",
    )
    parser.add_argument(
        "--model-fn",
        default="build_model",
        help="Callable name that returns the model. Default: build_model",
    )
    parser.add_argument(
        "--inputs-fn",
        default="build_inputs",
        help="Callable name that returns the model inputs. Default: build_inputs",
    )
    parser.add_argument(
        "--export-format",
        choices=["html", "svg", "png"],
        default="html",
        help="Export format for the visualization. Default: html",
    )
    parser.add_argument(
        "--export-path",
        default=None,
        help="Output file path. For html this is passed through directly.",
    )
    parser.add_argument(
        "--collapse-modules-after-depth",
        type=int,
        default=1,
        help="Initial expansion depth. Default: 1",
    )
    parser.add_argument(
        "--forced-module-tracing-depth",
        type=int,
        default=None,
        help="Maximum depth of forced tracing into modules. Default: None",
    )
    parser.add_argument(
        "--height",
        type=int,
        default=800,
        help="Canvas height in pixels. Default: 800",
    )
    parser.add_argument(
        "--width",
        default=None,
        help="Canvas width, e.g. 1200 or 100%%. Default: auto",
    )
    parser.add_argument(
        "--hide-non-gradient-nodes",
        action="store_true",
        help="Hide constants and values outside the gradient graph.",
    )
    parser.add_argument(
        "--show-module-attr-names",
        action="store_true",
        help="Show attribute names instead of only class names when possible.",
    )
    parser.add_argument(
        "--show-compressed-view",
        action="store_true",
        help="Enable experimental compressed view for repeated nodes.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    model_path = Path(args.model_file).resolve()
    if not model_path.is_file():
        raise RuntimeError(f"Model file not found: {model_path}")

    # Import lazily so the CLI can still show actionable errors on machines that
    # do not have the CPU-only PyTorch stack installed yet.
    torch = _maybe_import_torch()
    trace_model = _maybe_import_torchvista()
    module = _load_module(model_path)

    build_model = _resolve_callable(module, args.model_fn)
    model = build_model()
    if not isinstance(model, torch.nn.Module):
        raise RuntimeError(
            f"`{args.model_fn}` must return a torch.nn.Module, got {type(model)!r}."
        )

    # The user model file owns input construction so arbitrary local experiments
    # can define tuple inputs, dict inputs, or positional-only tensors.
    inputs = _build_inputs(module, model, args.inputs_fn)

    trace_model(
        model,
        inputs,
        show_non_gradient_nodes=not args.hide_non_gradient_nodes,
        collapse_modules_after_depth=args.collapse_modules_after_depth,
        forced_module_tracing_depth=args.forced_module_tracing_depth,
        height=args.height,
        width=args.width,
        export_format=args.export_format,
        show_module_attr_names=args.show_module_attr_names,
        export_path=args.export_path,
        show_compressed_view=args.show_compressed_view,
    )

    target = args.export_path or "<default torchvista output behavior>"
    print(f"torchvista export completed: format={args.export_format}, output={target}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:  # noqa: BLE001
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(1)
