# Heterogeneous Inference Visual Design + Generation Rules

## 1) 图片生成优先级

1. **优先使用 Codex imagen2 / 内置 imagen 工具生成**（图形化插图）。
2. 仅当 Codex imagen2 工具不可用时，才允许退回其他生成方式（并记录退回原因）。
3. 所有提示词需先压缩信息，再进入图形化渲染；每张图优先承载一个核心结论。
4. 每张图仅描述一个核心论点；禁止在一张图内叠加多个无关主线。

## 2) 风格控制（统一注入 Prompt）

所有图 Prompt 默认追加：

- white paper background（白底）
- rough hand-drawn black ink（粗细适中手绘黑线）
- sparse labels（稀疏标签）
- single accent #D97757（单一高亮色）
- no gradients / no shadows / no 3D / no decorative clutter / no emoji
- engineering/architecture diagram intent（工程化关系图语义）

### Figure prompt suffix

`hand-drawn, black ink, white background, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative clutter, no emoji`

## 3) 文件落地

- 所有插图统一放在：`./figures/` 目录。
- 博客/幻灯片/DSL 的 `Image`/`image` 引用都应使用 `./figures/figure-XX-*.png`。
- 生成后务必移动到 `examples/heterogeneous-inference-progress/figures`，不要留在 `examples/heterogeneous-inference-progress/` 根目录。

## 4) 图框交互

- 图框默认只显示图片。
- Prompt 仅在点击放大（zoom）时显示。

## 5) 可追溯性

每张图对应 `figures/index.md` 记录用途与生成规则。
