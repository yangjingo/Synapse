# Metadata
Category: engineering
Date/Author: 2026/05/02 · yangjing
Page title: Nano Claude — 用 500 行 Python 复刻 Claude Code 的核心 Agent Loop

# TITLE
Nano Claude — 用 500 行 Python 复刻 Claude Code 的核心 Agent Loop

## LEAD
复刻一个 nano 跑一跑，胜过读万卷源码。Claude Code 是当前最强的 Agentic 编程工具，但它的 Agent Loop 对绝大多数人是黑盒。50 万行 TypeScript 看一眼就头皮发麻，可核心逻辑只有 3 个文件。用 Python 500 行复刻完整 Agent Loop，比读源码更能建立对 Agentic 系统的直觉。这篇文章不教你"看懂 Claude Code"——教你亲手造一个能跑的。

## SECTIONS

### Section 1: 问题
Type: text
Body: 我每天都在用 Claude Code，但说句实话，我只是在用，并不理解它。

工具越强大，越容易产生一种幻觉——你觉得你理解了，其实你只是在消费。Claude Code 的 Agent Loop 对我来说就是这样一个黑盒：给它一个任务，它自己规划、调用工具、读文件、写代码、跑测试，最后把结果递到我面前。整个过程丝滑得让人不想追问"它是怎么做到的"。

但有一天我真的去翻了 Claude Code 的源码。50 万行 TypeScript。光入口文件就牵出十几个模块，每个模块又依赖四五个子模块。我花了两个小时在文件树里导航，感觉自己像个在迷宫里打转的蚂蚁——信息量太大，抓不住主线。

这事儿没那么玄学，主要就是认知过载。50 万行代码里 95% 是边界处理、错误恢复、多平台适配、UI 渲染——这些对工程可靠性和产品体验至关重要，但对理解"Agent Loop 是什么"来说全是噪音。

### Section 2: 减法原则 — 核心只有 3 个文件
Type: text
Body: 既然直接读不动，那就做减法。我的策略很简单：从完整项目出发，一层一层删，删到系统不能跑为止。每一层删除之前问自己一个问题："删掉之后，核心对话循环还能跑吗？"

能跑？继续删。

不能跑？停下来，你刚刚删掉的就是核心。

这个暴力筛选法跑完之后，50 万行变成了 3 个文件：

**System Prompt** — 告诉 Agent 它是谁、能做什么、应该怎么做。这是整个系统的"世界观"。Claude Code 的 system prompt 几千行，但核心就三个部分：角色定义、工具描述、行为约束。压缩到 200 行完全够用。

**Tool Loop** — Agent 调用工具、拿到结果、决定下一步的循环逻辑。这是 Agent Loop 的心脏。代码量不大，但逻辑密度极高：解析模型输出、执行工具调用、把结果喂回模型、判断是否终止。

**Agent Runtime** — 管理整个对话的上下文窗口、消息历史、流式响应。这是基础设施层，让 Tool Loop 能跑起来。

Callout: 50 万行 → 3 个文件。不是因为我聪明，是因为 95% 的代码在解决"生产环境怎么不挂"的问题。理解 Agent Loop 不需要这些。

### Section 3: Spec-Driven 阅读流
Type: text
Body: 确定了 3 个核心文件之后，我的下一步不是逐行读代码——是先写 Spec。

具体做法：把源码喂给另一个 Claude 实例，让它输出架构文档。不是"这段代码做了什么"的逐行翻译，而是"这个模块的职责边界在哪、输入输出是什么、依赖关系图长什么样"的结构化描述。

为什么要先写 Spec？因为人类大脑处理结构化信息的效率远高于处理线性代码。一份好的架构文档能让你在 5 分钟内建立全局心智模型，而逐行读源码可能花 5 小时还是只见树木不见森林。

拿到 Spec 之后，阅读顺序就清晰了：

1. 先读 System Prompt 的 Spec——理解 Agent 的行为边界。
2. 再读 Tool Loop 的 Spec——理解循环的状态机模型。
3. 最后读 Agent Runtime 的 Spec——理解上下文管理的工程细节。

Spec 驱动的阅读流有一个隐性好处：它在你的脑子里建了一个"骨架"，后续读具体代码时，每一行都能挂到骨架上，而不是变成孤立的碎片。文档先行，代码后置。Spec 即代码，文档即指令。

### Section 4: 从 REPL 开始
Type: text
Body: Spec 写完了，接下来动手写代码。从哪开始？从最小的可运行循环开始——一个 REPL。

Agent Loop 的本质就是一个增强版的 REPL：用户输入 → 模型思考 → 调用工具 → 拿到结果 → 模型继续思考 → 直到任务完成。所以最自然的起点就是用 `AsyncAnthropic` 建一个流式对话循环，然后往里面加工具。

第一版代码大概 30 行：

```python
from anthropic import AsyncAnthropic

client = AsyncAnthropic()

async def agent_loop(user_input: str):
    messages = [{"role": "user", "content": user_input}]
    async with client.messages.stream(
        model="claude-3-7-sonnet",
        max_tokens=4096,
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            print(text, end="", flush=True)
```

这一版什么工具都没有，纯粹是对话。但跑通它的那一刻，你就有了 Agent Loop 的心跳。接下来加第一个工具——Bash Tool。为什么是 Bash？因为 Bash Tool 是 Agent 跟物理世界交互的最低门槛：能执行命令、能读输出、能拿到退出码。有了 Bash Tool，Agent 就不再是"只会说话的鹦鹉"，它有了手脚。

Callout: Agent 的原子单位不是工具调用，是 REPL 里的一次对话。先把对话跑通，再加工具。先把循环跑通，再加状态。顺序反了，你就是在造一个没有引擎的车壳。

### Section 4.5: Agent Loop 循环
Type: figure
Image: ./figures/figure-01-agent-loop.svg
Caption: Figure 1: Agent Loop 循环——User Input → Agent (LLM) → Tool Execution → Result → 循环
Prompt: Agent loop cycle diagram showing User Input, Agent LLM, Tool Execution, Result cycle

### Section 5: 逆向工具链
Type: text
Body: 上面说的是方法论，实际操作中还有一类工具帮了大忙——逆向源码的工具链。

**zread-cli**：Claude Code 的源码是个巨大的 monorepo，手动翻文件树效率太低。zread-cli 可以极速索引全目录结构，按模块提取文件内容。配合 grep 做关键词定位，基本上能在 10 分钟内找到任何你想看的逻辑。

**Deepwiki**：自动构建工程知识图谱。它做的事情就是把代码里的 import/dependency 关系可视化，消除依赖盲点。看 Deepwiki 生成的依赖图，比在 IDE 里一个个点开文件快 10 倍。

**Claude /init**：这是最简单但最有效的。在一个新目录里运行 `claude /init`，它会扫描项目结构并生成一个 CLAUDE.md 文件——本质上就是项目上下文的快照。把这个快照喂给另一个 Claude 实例，它就能基于完整上下文帮你分析架构。

三个工具组合起来的工作流：zread-cli 提取源码 → Deepwiki 构建依赖图 → Claude /init 生成上下文 → 喂给 Claude 输出 Spec。整个过程大概 30 分钟，从 50 万行黑盒到结构化的架构文档。

### Section 6: Python 复刻 — 500 行就够了
Type: text
Body: 有了 Spec、有了最小 REPL、有了工具链的辅助，最后一步就是完整复刻。

为什么选 Python？就一个原因：Python 是我最熟悉的。复刻的目标是理解，不是搬运。在理解的路径上，每一个不熟悉的语言特性都是认知税。TypeScript 的类型体操、异步模型、装饰器元编程——这些在理解 Agent Loop 逻辑上都是噪音。

500 行代码的文件结构：

```
nano-claude/
├── system_prompt.py    # ~200 行，System Prompt 的 Python 表示
├── tools.py            # ~150 行，Bash Tool + File Tool + 请求解析
└── agent.py            # ~150 行，Tool Loop + Agent Runtime
```

`system_prompt.py` 定义了 Agent 的行为规则：什么时候该调用工具、怎么处理错误、什么时候应该停止。`tools.py` 实现了工具的执行层：运行 bash 命令、读写文件、返回结构化结果。`agent.py` 是整个循环的编排层：管理对话历史、调用模型、解析工具调用、执行工具、把结果喂回模型。

跑起来之后，它就是一个完整的 Agent：你给它一个任务，它自己规划、调用工具、读文件、写代码、跑测试。跟 Claude Code 的核心行为一模一样，只是没有 UI、没有多平台适配、没有错误恢复。

Callout: 目标是理解，不是搬运。500 行 Python 复刻的价值不在于它能替代 Claude Code——在于每一行你都懂。你被迫理解了 Tool Loop 的状态机、System Prompt 的约束逻辑、上下文窗口的管理策略。这些理解，读 50 万行源码反而不一定能得到。

### Section 6.5: 核心文件结构
Type: figure
Image: ./figures/figure-02-three-files.svg
Caption: Figure 2: 50 万行 → 3 个文件——system_prompt.py / tools.py / agent.py
Prompt: Compression from 500K lines to 3 core files: system_prompt.py, tools.py, agent.py

### Section 7: Agent 测试 — 让另一个 Agent 来验证
Type: text
Body: 复刻完了，怎么验证自己理解对了？单元测试不够——你测的是"这段代码做了什么"，而不是"这个 Agent 能不能完成任务"。

我用的是 OpenClaw：部署一个独立的 Agent 实例，让它扮演用户，通过 terminal 跟你的 nano-claude 交互。本质上就是让一个 Agent 测试另一个 Agent。它会给你的 Agent 出各种任务——"读一下这个文件"、"跑一下这个测试"、"把这个 bug 修掉"——然后检查结果是否符合预期。

Pass@1 是唯一硬核指标。第一次交互就成功完成任务的比例。不给重试机会，不搞平均值，不搞曲线优化。Pass@1 高，说明你的 Agent Loop 真的跑通了；Pass@1 低，说明某个环节的理解有偏差，回去重看 Spec。

好处是验证和开发形成了闭环：写代码 → 跑 OpenClaw → 看 Pass@1 → 定位薄弱环节 → 修改 → 再跑。这个循环比手动测试快 10 倍，而且覆盖的场景更全面。最好的测试员是另一个 Agent。

### Section 8: Reference
Type: reference
- **Nano-Claude Artifacts** - yangjing - https://github.com/yangjingo/nano-claude
- **Claude Code Wiki** - OpenClaude Community - https://openedclaude.github.io/claude-reviews-claude
- **Refactoring 2nd Edition** - Martin Fowler - https://book-refactoring2.ifmicro.com/

## PULSE
500 行 Python 复刻比 50 万行源码更有教学价值——不是因为代码少了，而是因为你被迫理解了每一行。理解 Agent Loop 不需要看懂整个 TypeScript 代码库，只需要跑通一个能对话的最小循环。先跑通，再理解，最后优化。这个顺序反过来的人，大部分在 50 万行代码里迷了路就再没出来。
