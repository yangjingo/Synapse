---
profile: excalidraw-slides
kind: slides
label: Why.J Theater
template: templates/whyj-slides.html
---

# Why.J Theater

使用静态白色网格画布。复制 [HTML 模板](../templates/whyj-slides.html)开始排版。

| 用途 | 字体 |
| --- | --- |
| 英文标题、正文和标签 | Poppins |
| 中文 | Noto Sans SC，回退到 Microsoft YaHei |
| 代码 | JetBrains Mono |

## 字号层级

同一页的字号按「顶部标题 > 页底观点 > 正文」排列。观点字号从标题和正文字号之间取值，切换画布比例或布局时继续满足这个顺序。观点较长时先调整措辞或允许换行。观点与正文文字起点对齐，方括号可用陶土色。图主导页将观点接在右侧解读下方，文字主导页将观点留在文字列底部，让两者之间保有间距。

## 布局

| 布局 | 适用内容 | 位置 |
| --- | --- | --- |
| `data-layout="text-led"` | 观点、步骤或短论证 | 左侧文字约 58%，右侧配图约 42%。 |
| `data-layout="image-led"` | 架构图、流程图、截图或对照图 | 左侧主图约 65%。右侧放简短解读，观点文字紧跟在解读下方。 |

图框使用 1px 暖灰线与浅底，普通视图、悬停和放大预览都保持无阴影。页底观点用 `[一句完整的判断]` 标记，文字逆时针倾斜约 1.5°，直接置于画布上。模板会把每条页底观点加入 Reveal 的逐步播放，进入页面时先隐藏，轮到该观点时，Pretext 根据字宽和行数控制短暂的从左到右揭示。多行时依照阅读顺序逐行出现，每次播放在 720 毫秒内收住。系统开启「减少动态效果」时，观点仍按步直接出现。标题线用墨色，陶土色突出当前步骤。正文的 `mark` 与 `strong` 共用模板的强调样式。

## 幻灯片动效

点击普通画布时，落点显示陶土色双环，随后在 560 毫秒内扩散淡出。链接、播放控件和图面保留各自的交互。系统开启「减少动态效果」时跳过点击波纹。

演示页需要文字波纹时，在该页的 `section` 上加 `data-pretext="PREFILL / DECODE / KV CACHE"`，用与本页有关的短术语生成底层文字。波纹只在当前页运行，鼠标移过时会带动底层文字。默认使用静态画布，系统开启「减少动态效果」时隐藏文字波纹。

## 逐页安排

| 页面 | 内容与排版 |
| --- | --- |
| 封面 | 标题、点出主题判断的副标题及作者、日期等必要信息。封面只保留文字。 |
| 背景 | 用少量可核对的事实交代现状。需要说明组件关系时，配一张可编辑图，再用方括号观点点出问题。 |
| 提纲 | 问题从背景事实中引出。用 `canvas-layer push-left` 和 `no-bullet` 左对齐，按需用 `fragment` 逐条出现。 |
| 机制 | 每页讲清一个机制，选合适的正文布局并配一张完成的图。用一行方括号观点告诉听众该记住什么。 |
| 回答 | 按提纲顺序逐一回答，使用左对齐布局和逐条出现。重点结论可用 `pulse-layer`。 |
| 来源 | 用 `canvas-footer` 和 `ref-list` 排版。标题链接到原文，必要时显示完整 URL。 |

页脚水印使用 `whyj + {project_id} + YYYY/MM/DD`。HTML 文档标题使用项目名和版本。

## 技术图

- HTML 图优先使用可编辑的 `.native-diagram`。用暖纸底 `#FAF9F5`、短标签、细连线和少量陶土色。相同角色共享位置、比例和颜色。分别标清控制消息、数据传输和状态边界的方向。
- 图像沿用源比例。图注与来源放进 `.visual-caption`。点击图面或按 Enter、空格放大，按 Esc 关闭。
- 可参照 Anthropic 对稀疏流程、等宽面板和对齐对照的处理。[Building effective AI agents](https://www.anthropic.com/research/building-effective-agents) · [Effective context engineering](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents) · [Introducing advanced tool use](https://www.anthropic.com/research/advanced-tool-use)
