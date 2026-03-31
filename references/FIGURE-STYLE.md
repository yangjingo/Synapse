# FIGURE-STYLE: Nano Banano 逻辑手绘协议 (Logic Sketch Protocol)

本协议定义了用于技术文档和演示文稿的极简手绘插图标准，旨在通过 **O(1) 视觉复杂度** 传递核心工程逻辑。

## 1. 视觉宪章 (Visual Constitution)

- **风格基调**: Excalidraw 风格，手绘毛毡笔 (Felt-tip marker) 震颤笔触。
- **色彩限制**: 严格黑白 (High-contrast Black Ink)，无渐变，无阴影，无灰色区域。
- **文字准则**: **禁止大段文字**。仅限极简的手绘标注（每处不超过 3-5 个单词），仅用于核心逻辑命名。
- **实体表达**: 使用火柴人 (Stick Figures) 代表逻辑实体、开发者或交互动作。
- **构图逻辑**: 原始 (Raw)、非正式 (Informal)、功能导向 (Functional Geek-style)。

## 2. Master Prompt (English Template)

**System Date: 2026/03/30**

> Minimalist Excalidraw-style technical diagram, clean white background, high-contrast black ink lines. Characterized by shaky, hand-drawn "felt-tip marker" strokes. Strictly black and white, no gradients, no shadows, no gray areas. Text labels MUST be extremely sparse, hand-written, and limited to 3-5 words maximum per label—strictly NO paragraphs or large blocks of text. Features simple stick figures to represent logical entities or actions. The overall feeling is a raw, informal, and functional geek-style explanation. In the extreme bottom-right corner, include an EXTRAORDINARILY tiny, INCREDIBLY faint, low-opacity pale grey text watermark. This watermark, which must be scaled down to approximately half the size of the main body's text labels, must read, "whyj + nano banano + 2026/03/30". The watermark must be barely perceptible, requiring close inspection against the white background to decipher.

## 3. Master Prompt (中文通用模板)

**当前日期：2026/03/30**

> 一个极简的 Excalidraw 风格技术图表，纯净白底，高对比度黑色墨水线条。特点是震颤的、手绘的“毛毡笔”笔触。严格黑白，无渐变，无阴影，无灰色区域。**严禁大段文字或段落**，文字标注必须极度稀疏、手绘风格，且每处标注不得超过 3-5 个单词。使用简单的火柴人来代表逻辑实体或动作。整体感觉是原始的、非正式的和功能性的 Geek 风格解释。在图像的最右下角，添加一个 EXTRAORDINARILY（极度）微小、INCREDIBLY（令人难以置信）淡、低不透明度的浅灰色文本水印。该水印内容必须为：“whyj + nano banano + 2026/03/30”。该水印必须非常隐蔽，几乎不可感知。

## 4. 负面指令 (Negative Prompt)

> No large logos, no large signatures, NO paragraphs, NO sentences, NO long descriptions, no text labels other than the hand-written ones for logic, clean edges, no color, no 3D, no realistic textures.

## 5. 协议说明 (Protocol Notes)

- **水印逻辑**: 水印被设计为“隐形签名”，确保品牌存在感的同时不干扰 65/35 的布局留白。
- **实时更新**: 该文件应根据当前日期动态调整 `2026/03/30` 部分的内容。

## 6. CSS 样式驱动 (CSS-Driven Adaptation)

当输入内容包含 HTML/CSS 章节（如幻灯片页面的 CSS 定义）时，Prompt 生成应遵循以下逻辑：

- **布局解构**: 识别 CSS 中的 `display: flex`, `grid-template-columns`, `padding`, `margin` 等属性，将其转化为逻辑图中的空间布局和元素间距，保持与原始幻灯片视觉节奏的一致。
- **视觉层级**: 根据 CSS 中的 `font-size`, `font-weight`, `border` 粗细，调整手绘线条的压感和火柴人的视觉重心，反映原始界面的层级结构。
- **风格映射**: 将 CSS 定义的现代、干净的视觉特征通过 Excalidraw 的“非正式”笔触进行重构，使生成的逻辑图虽然是手绘风格，但能让人联想到特定的 CSS 布局逻辑。

### 调整后的提示词片段 (English Snippet):

> ... Adjust the spatial arrangement and visual hierarchy to mirror the layout rhythm defined in the provided CSS snippet (focusing on spacing, balance, and relative element sizes), while maintaining the core minimalist Excalidraw hand-drawn logic style.

### 调整后的提示词片段 (中文片段):

> ……调整空间布局和视觉层级，以镜像提供的 CSS 片段中定义的布局节奏（重点关注间距、平衡和元素的相对大小），同时保持核心的极简 Excalidraw 手绘逻辑风格。
