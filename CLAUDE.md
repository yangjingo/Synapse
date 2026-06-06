# Synapse Project

## gstack

Use skills from `~/.claude/skills/gstack/` for review, planning, browsing, and shipping workflows.

**Web browsing:** Always use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

**Available skills:**

- `/office-hours` — design doc and problem framing
- `/plan-ceo-review` — CEO/founder-mode plan review
- `/plan-eng-review` — engineering plan review
- `/plan-design-review` — design plan review
- `/plan-devex-review` — developer experience plan review
- `/design-consultation` — design consultation
- `/design-shotgun` — rapid design exploration
- `/design-html` — HTML design output
- `/review` — pre-landing PR/code review
- `/ship` — ship workflow
- `/land-and-deploy` — land and deploy
- `/canary` — canary deployment
- `/benchmark` — benchmarking
- `/browse` — web browsing (mandatory for all web access)
- `/connect-chrome` — connect Chrome for browse
- `/qa` — QA workflow
- `/qa-only` — QA-only mode
- `/design-review` — design review
- `/setup-browser-cookies` — browser cookie setup
- `/setup-deploy` — deploy setup
- `/setup-gbrain` — gbrain setup
- `/retro` — retrospective
- `/investigate` — investigation
- `/document-release` — release documentation
- `/document-generate` — document generation
- `/codex` — Codex consult
- `/cso` — chief strategy officer mode
- `/autoplan` — auto planning
- `/devex-review` — developer experience review
- `/careful` — careful mode
- `/freeze` — freeze changes
- `/guard` — guard workflow
- `/unfreeze` — unfreeze changes
- `/gstack-upgrade` — upgrade gstack
- `/learn` — learning mode

When requirements are unclear, run the appropriate plan review skill before implementing.

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
