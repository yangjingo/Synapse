# Synapse Project

## Excalidraw Diagram Workflow

### Codex Review Gate (Mandatory)

Before presenting any generated or optimized Excalidraw diagram to the user for final approval, you MUST:

1. Run `/codex` in consult mode to review the generated SVG against the reference image
2. Present Codex's review findings to the user
3. Only then ask the user for confirmation

This applies to:
- New diagram generation
- Diagram optimization / redesign
- Layout fixes and adjustments

**Never show a diagram as "done" without Codex review first.**
