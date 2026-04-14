# [Engineering Deep-Dive]: 用 Claude Code 逆向复刻 Nano-Claude

---

- **System**: Nano-Claude (Python-based ACI)
- **Identity**: Why.J Engineering Theater
- **Identity**: whyj-style — 我的项目之路

---

# 00 / Cover

## Nano-Claude: 从源码解构到工程复刻的碎碎念

- **Version**: 0.2
- **Author**: Why.J
- **Date**: 2026/04/14

::image [assets/logo.png] [scale=0.8] ::

::pulse [「 拆解是最好的学习。 」] ::

---

# 01 / Context

## 现状：被屏蔽在黑盒之外的 Agentic 逻辑

- **困境**: 长期使用 Claude Code 但对其底层 **Agent Loop** 缺乏结构性认知。
- **痛点**: 50万行 TypeScript 源码导致“陷细节”与“读不动”的认知过载。
- **方案**: 实施 ==Nano 化复刻== —— 通过极简代码实现核心闭环。

::image [examples/figures/fig1.png] [scale=0.9] ::

::pulse [「 复刻一个 nano 跑一跑，胜过读万卷源码。 」] ::

---

# 02 / Outline

## 极致减法：解构复刻协议

- **Q1**: 如何进行项目的极致“减法复刻”？
- **Q2**: Vibe 时代的代码阅读流如何演进？
- **Q3**: Nano-Claude 的具体设计与开发路径？
- **Q4**: 如何更加高效地进行 Vibe Coding？

::pulse [「 优雅的本质是删除到无可再删。 」] ::

---

# 03 / Philosophy

## 减法原则：从完整项目进化到 Nano 麻雀

- **逻辑 Nano 化**: 剥离所有边缘依赖，仅保留核心 **Bash 工具调用**。
- **效率 Nano 化**: 优先保证逻辑闭环，运行效率后置。
- **心态**: 为学习而拆解，关注 ==核心逻辑骨架== 胜过所有边界管理。

::math [Logic_{\text{nano}} = \text{CoreLoop} - \sum \text{EdgeCases}] ::

::pulse [「 每一层删除都是一次深度的理解。 」] ::

---

# 04 / Mechanism

## 阅读流重塑：架构理念学习优于实现细节

- **核心认知**: 与 Agent 交互重于具体代码实现，专注写好 ==Spec-Driven== 规范。
- **执行策略**: 喂给 Claude Code 全量源码，输出架构和工程细节的 Markdown 文档。
- **核心点**: 专注为 Agent 划定行动边界，而非死磕单点代码实现。

::image [examples/figures/fig4.png] [scale=1.1] ::

::pulse [「 Spec 即代码，文档即指令。 」] ::

---

# 05 / Engineering

## 开发起点：从一个 REPL 循环开始

- **Minimalist Loop**: 建立 AsyncAnthropic 流式对话的最小 REPL。
- **ACI 接入**: 建立第一个 **Bash Tool**，实现 Agent 与系统硬反馈的闭环。
- **确定性**: 追求每一次交互的原子化与幂等性。

::code [python] [
from anthropic import AsyncAnthropic
async with client.messages.stream(
    model="claude-3-7-sonnet",
    messages=[{"role": "user", "content": "ls"}]
) as stream:
    # Agentic Loop starts here
] ::

::pulse [「 一切从一个能对话的循环开始。 」] ::

---

# 06 / Tooling

## 逆向工具链：快速获取源码的逻辑骨架

- **zread-cli**: 实现极速索引与全目录提取。
- **Deepwiki**: 自动化构建工程知识图谱，消除依赖盲点。
- **Claude /init**: 利用原生初始化功能获取上下文快照。

::image [examples/figures/fig5.png] [scale=1.0] ::

::pulse [「 逆向源码的文档，而非搬运源码的细节。 」] ::

---

# 07 / Testing

## Test-Driven: 让 OpenClaw 负责最终验证

- **隔离验证**: 部署独立的 OpenClaw 实例操作 terminal 进行黑盒测试。
- **自动化闭环**: Agent 实例扮演用户，验证文档与代码的一致性。
- **硬核指标**: 成功率 (Pass@1) 是衡量逻辑完整性的唯一标准。

::image [examples/figures/fig8.png] [scale=0.95] ::

::pulse [「 最好的测试员是另一个 Agent。 」] ::

---

# 08 / Lessons

## 方案选型：为什么是 Python + 文档驱动

- **选型**: 放弃原版 TS，选择 Python 是为了 ==极致降低认知载荷==。
- **策略**: 文档先行。先把理解写下来，再通过 Agent 辅助实现代码。
- **教训**: 不要追求完整，追求的是对核心逻辑的“手感”。

::pulse [「 目标是理解，不是搬运。 」] ::

---

# 09 / Improvement

## 下一次改进：Agentic 编程的最佳实践

- **CLAUDE.md 优先**: 这是给 Agent 的地图，必须首先固化。
- **git 管理一切**: 每一次提交都是一次逻辑理解的快照。
- **Vibe Coding**: 在确保逻辑正确的前提下，释放 Agent 的生产力。

::pulse [「 觉得好玩、觉得有趣就可以开始。 」] ::

---

# 10 / Takeaways

## 行动指南：立即启动你的 Nano 项目

- **Action 1**: 选定一个 50w+ 行的项目，启动 Nano 级复刻。
- **Action 2**: 固化 Spec-Driven 编程工作流，文档即真理。
- **Action 3**: 建立 Agent 测试闭环，告别手动 Debug。

::pulse [「 停止对话，开始推理。 」] ::

---

# 11 / Reference

## Reference

- **Refactoring 2nd Edition** - Martin Fowler - https://book-refactoring2.ifmicro.com/
- **The Way of Code** - Rick Rubin - https://www.thewayofcode.com
- **Claude Code Wiki** - https://openedclaude.github.io/claude-reviews-claude
- **Nano-Claude Artifacts** - https://github.com/yangjingo/nano-claude

::reference [SWE-bench: Evaluating Engineering Agents] [https://www.swebench.com/] ::
