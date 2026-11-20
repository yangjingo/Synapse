---
name: synapse-tech-blog
description: >-
  写作、重构或审阅面向同行的技术博客、论文解读与技术复盘，
  支持独立技术插图、离线 HTML 和 Notion/Bearblog 交付。
  帮助读者形成可核验、可复用的工程判断。个人感触、理解变化和成长记录使用 synapse-notes。
---

# 技术博客

**以读者的判断变化建立技术影响力。** 先让读者看懂问题。 交代实际场景、约束、失效的旧假设和判断标准，再给出当前结论。篇幅有限时优先保留这些内容。实现细节用于解释机制、支撑主张或帮助复现。

## 选择场景

| 用户要的内容 | 打开 |
| --- | --- |
| 系统、模型或工程机制的完整技术解释 | [references/blog.md](references/blog.md) |
| 单篇论文、多论文合成、YJ Paper 连续研究页 | [references/paper.md](references/paper.md) |
| 作者、团队或项目在反馈中改变判断的复盘 | [references/techreview.md](references/techreview.md) |
| 软件架构图、证据图、研究草图或可编辑技术图 | [references/image.md](references/image.md) |
| 已审定文章的 Notion 复制页、Bearblog 或中英文发布稿 | [references/publishing.md](references/publishing.md) |

按当前任务选择一份主 reference。需要独立图示或发布格式时，再读对应的附加 reference。已审定稿的格式转换保留原文章主张和结构。用户指定公众号版式时，使用 `synapse-notes` 的交付 reference 进行排版。

## 共用原则

- 围绕一个能改变读者判断的母问题组织文章。定义以当前问题需要为准。每段承担一个具体判断、机制步骤或证据增量。
- 给主要主张就近附可访问的一手来源。把观察、来源主张、跨来源推导、方案与实测分开表达。对性能数据交代负载、环境、指标、基线和限制。
- 用作者真实材料支撑个人经验。作者语气、第一人称和直接引用应有可追溯的归属。
- 正式文章开头给可见的简短结论摘要，正文再交代原因与条件。收尾回到母问题，给出读者能够复用的判断。
- 输出遵循用户指定的格式。复杂材料可用 `synapse-forge` 做来源抽取和 DSL，复杂 HTML 布局可用 `synapse-pretext`。两者按需调用。
