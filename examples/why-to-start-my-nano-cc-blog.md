# [Engineering Deep-Dive]: 拆解是最好的学习：用 Claude Code 复刻 Nano-Claude

> **System**: Nano-Claude (Python-native Agentic Loop)  
> **Identity**: whyj-style — 我的项目之路  
> **Key Logic**: `Logic_nano = CoreLoop - ∑ Complexity_edge`

---

## 0. 遇到的问题：陷入“使用幻觉”的认知熵增

2026 年初，Claude Code 已经成为我日常开发的核心工具。但越用越觉得——**我只是在消费工具，并不理解其底层品味。**

我知道 `/help` 能列出命令，知道它能调 Bash、读文件、写代码，但对其底层的 **ACI (Agent-Computer Interface)** 仍存在大量盲区：
- **Loop 闭环**: 消息发出去后，Agent Loop 到底怎么转的？
- **结果回填**: Tool Calling 的结果怎么精准喂回给模型？
- **上下文管理**: `/memory` 写入的内容，下次会话如何按需加载？
- **自我压缩**: 为什么它能自主决定进行上下文摘要？

**范式转移**: 以前学习项目是搭环境跑 demo，现在最硬核的路径是 **==复刻一个 Nano 跑一跑==**。

::pulse [「 端到端跑通最小的功能闭环，理解全部的逻辑更重要。 」] ::

---

## 1. 为什么要复刻而不是阅读源码？

### 阅读代码的困境：依赖熵增
Claude Code 是基于 TypeScript 构建的复杂系统，源码量达 **50 万+ 行**。直接阅读会遭遇“认知过载”：
- **依赖纠缠**: 一个 `QueryEngine` 的初始化可能牵扯出数十个模块。
- **设计过度**: 密集的模式设计在缺乏上下文时极其晦涩。
- **静态局限**: 缺乏运行环境的静态阅读无法感知 ACI 的动态反馈。

### 复刻的“减法哲学”：蒸馏逻辑
复刻不是抄袭，而是**极致的架构蒸馏**：
- **工具脱水**: 20+ 个工具降级为 1 个（Bash），验证核心闭环。
- **权限剥离**: 移除复杂的权限系统与协议适配层。
- **考问本质**: 每一次删除都是一次深度考问——删掉这个模块，系统还能跑吗？

::math [P(	ext{Learning}) \propto \frac{	ext{Logic Density}}{	ext{Dependency Entropy}}] ::

### Agentic 开发：以工具造工具
> “现在这个时间点，没有什么比学习 Agent 的深度使用更重要。”

用 Claude Code 开发 Nano-Claude 本身就是最高级的学习：让 Agent 处理实现细节，你专注理解**架构边界与约束**。

---

## 2. 从零开始的 Nano 复刻路径

### 第一步：建立 Atomic REPL 循环
一切 ACI 工程的起点都应是一个能对话的流式循环。跳过架构，直击 **Atomic Loop**:

::code [python] [
from anthropic import AsyncAnthropic
client = AsyncAnthropic()
async with client.messages.stream(
    model="claude-3-7-sonnet",
    messages=[{"role": "user", "content": "Hello"}]
) as stream:
    async for text in stream.text_stream:
        print(text, end="", flush=True)
] ::

### 第二步：从功能入口逆向解构
以用户视角倒推核心模块，从每天都在用的功能开始切入：

| 入口 | 对应模块 | 工程价值 |
|------|---------|---------|
| `/buddy` | 宠物系统 | 数据模型与随机信号注入 |
| `/tools` | 工具注册表 | ToolDef/ToolResult 协议设计 |
| `/dream` | 记忆巩固 | 信号提取与跨会话整合 |
| `/memory` | 记忆系统 | YAML frontmatter 与文件 I/O 抽象 |

### 第三步：Spec-Driven：文档即真理
不是补文档，而是**“文档先行”**。先写 `CLAUDE.md` 规定 Agent 的行动空间，再由 Agent 进行逻辑填充。

- **逆向工具链**: 借助 `deepwiki`、`zread`、`openedclaude` 抽取原版设计文档。
- **头脑风暴插件**: 利用插件辅助发散思路，强化工程约束。
- **Git 管理一切**: 每一次 Commit 都是对逻辑理解的一次原子快照。

### 让 OpenClaw 负责最终验证
> “最好的测试员是另一个 Agent。”

隔离开发环境，让独立的 **OpenClaw** 实例扮演用户，按照文档进行自动化测试，发现文档与代码的不一致性。

---

## 3. 方案决策：为什么选择 Python + 减法复刻？

| 方案 | 优点 | 缺点 | 决策逻辑 |
|------|------|------|---------|
| **TS (1:1 搬运)** | 完全对照 | 依赖太重，认知负荷极高 | 弃选 |
| **Python (Nano 蒸馏)** | 生态轻量、SDK 成熟、代码优雅 | 与原版语言不一致 | **✓ 首选：专注逻辑理解** |

**核心理由**: 目标是获取“手感”与理解架构，而非搬运代码。Python 是我最熟悉的工具，能最大程度降低非核心细节的干扰。

---

## 4. 下一次改进的认知刷新

1. **CLAUDE.md 优先**: 这是给 Agent 的地图，必须首先固化工程约束。
2. **Atomic Start**: 从一个最小的 REPL 开始，不要在架构层面过度设计。
3. **输出即理解**: 每完成一个模块，写一篇 **Why.J Style** 博客，强迫自己将代码脱水。
4. **Agent-Led Testing**: 尽早引入第三方 Agent 进行闭环验证。
5. **极致减法**: 删到无可再删，才是优雅的本质。

---

## 5. 关键资产分享

### 相关界面
抽象的buddy

能用的tool

糟糕的血月

### 源码与文档
- **项目地址**: [yangjingo/nano-claude](https://github.com/yangjingo/nano-claude)
- **文档地址**: [Architecture & Blog](https://github.com/yangjingo/nano-claude/tree/main/docs)
- **项目分享**: [Blog Posts](https://github.com/yangjingo/nano-claude/tree/main/docs/blog)

| 核心文件路径 | 实现方式 | 逻辑描述 |
|------|---------|---------|
| `src/agent/agent.py` | AsyncAnthropic | 流式 ACI 闭环起点 |
| `src/cli/repl.py` | REPL Loop | 用户交互的原子入口 |
| `src/tools/bash.py` | Subprocess | 跨平台第一个 ACI 工具 |
| `src/memory/dreamer.py` | Memory Consolidation | 血月记忆整合引擎 |
| `docs/CLAUDE.md` | Spec-Driven | Agent 的行动地图 |
| `docs/posts/TODO.md` | Roadmap | 开发驱动力 |

---

## 6. 延伸阅读

### 书籍推荐 
- **《重构 改善既有代码的设计第二版》** - Martin Fowler - [在线阅读](https://book-refactoring2.ifmicro.com/)
- **The Way of Code** - Rick Rubin - [Official Site](https://www.thewayofcode.com)

### 项目相关参考
- **Claude Code 逆向文档 (Claude 分析源码)** - [OpenedClaude](https://openedclaude.github.io/claude-reviews-claude)
- **Claude Code 逆向文档 (Zread 分析源码)** - [Zread Analysis](http://leow3lab.service.huawei.com:9681/)
- **Claude Code 源码 Prompt 集合** - [System Prompts](https://github.com/Piebald-AI/claude-code-system-prompts)
- **Nano Claude Toy 实现示例** - [GitHub Docs](https://github.com/yangjingo/nanoclaude/tree/main/docs)

::reference [Engineering Presentation Manifesto] [https://whyj.io/manifesto] ::
