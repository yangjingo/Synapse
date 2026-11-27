---
name: synapse-tech-blog
description: >-
  写作、重构或审阅面向同行的技术博客、论文解读和工程复盘。
  交付有来源、有技术判断的 Markdown 或 Why.J 离线 HTML，按需制作技术插图。
---

# Tech Blog · 技术博客

## 写给谁

写给正在理解系统或做工程选择的同行。技术影响力来自读者能验证你的判断，并知道什么时候能用到自己的项目里。

## 怎么写

1. **交代问题。** 写清读者面对的场景、目标、约束和预期落空的地方。篇幅有限时优先保住问题与背景，实现细节按论证所需取舍。
2. **用标题给出判断。** 章节标题陈述本节的观点。首段从具体场景和卡点引出问题，随后给出回答。后续段落沿同一个问题解释机制、证据与适用条件。用同一个具体例子贯穿前后，读者每次回到它能回答一个新问题。
3. **给出验证。** 写清关键动作由谁完成、依赖什么、怎样知道成功。主张尽量就近连到一手来源。性能结果交代负载、环境、指标和基线。结尾回到开篇的决定，让读者知道怎样在自己的系统中验证。
4. **写完整句。** 摘要、正文和图注中的每个叙述句都要交代主语与谓语。动作涉及对象时，把宾语写全。

## 按场景打开参考

| 任务 | 参考 |
| --- | --- |
| 系统、模型与工程机制 | [技术文章](references/blog.md) |
| 观点标题、QCSA、完整句与引用 | [文字结构](references/text.md) |
| 单篇论文、多论文合成或 YJ Paper | [论文解读](references/paper.md) |
| 团队、项目与工程决策 | [技术复盘](references/techreview.md) |
| 架构、流程、对照或实验结果图 | [技术插图](references/image.md) |
| 博客总目录、Pretext 正文版式 | [HTML 排版](references/html-layout.md) |
| 多来源资料提取和结构化中间稿 | [资料提取](workflows/forge/WORKFLOW.md) · [DSL 格式](workflows/forge/FORGE.DSL.md) |
| 独立可编辑的 Excalidraw 图 | [绘图流程](workflows/excalidraw/WORKFLOW.md) · [CLI](workflows/excalidraw/references/excalidraw-cli-reference.md) |

从本入口按任务选读规则。每份参考只说明自己的主题。交付 HTML 时复制 [Why.J Theater 博客模板](templates/whyj-theater-blog.html)。与 [Talk Slides](../synapse-talk-slides/SKILL.md) 同题交付时，两份作品沿用同一组主张、数字和来源。

只有编辑 Excalidraw JSON 或需要专门的动画导出时，才查 [字段结构](workflows/excalidraw/references/copilot-ref/excalidraw-schema.md)、[元素类型](workflows/excalidraw/references/copilot-ref/element-types.md)或[动画 API](workflows/excalidraw/references/excalidraw-animate-api.md)。

## 交付前核对

- 逐节核对标题表达的观点、首段提出的问题和正文给出的回答。逐句核对主体、动作、对象与归因。
- 作者经历和引语可追溯。不同语言和格式共用审定稿，核对术语、数字、图序和来源。
- 同一次线上故障，问「哪条机制推高了尾延迟，同行怎样复现」用本入口。要记录当时为何误判或自己学到了什么时，用 `synapse-life-note`。
