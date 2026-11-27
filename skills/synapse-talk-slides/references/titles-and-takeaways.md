# 标题、页底结语与正文加粗

## 先确定主体和本页判断

观点标题和页底结语都用完整的陈述句。主语写明角色、组件或对象，谓语说清动作、结果或判断。动作涉及对象时，把宾语写齐。需要区分同类实例时，用职责或当前动作命名，例如「接手第二轮请求的 Prefill 实例」。图和正文可以用 `P1`、`P2`、`D1` 对照流程。标题和结语里的代词、实例编号及「前者」「后者」都改成具体称呼。

标题交代本页推进的论点。首段或口播交代为什么需要关心这个问题。项目名、提纲、来源等功能性标题可以用短语。连读所有观点标题时，听众应能看出每一页新增了什么。

## 从工程博客提炼标题写法

- **从工作负载进入。** vLLM 与 Mooncake 的文章先点出 Agent 工作负载和部署规模，正文开头再解释多轮共享前缀为什么会被重复计算。Slides 可以把负载和主要变化放在同一句，例如「共享 KV 池让长前缀在多轮请求中复用」。[Serving Agentic Workloads at Scale with vLLM x Mooncake](https://vllm.ai/blog/2026-05-06-mooncake-store)
- **给出机制名称。** SGLang v0.4 用具体的批调度器和缓存感知负载均衡器组织章节。Slides 可以把组件名转成一句有动作的标题，例如「SGLang 的批调度器让 CPU 调度与 GPU 计算重叠」。[SGLang v0.4: Zero-Overhead Batch Scheduler, Cache-Aware Load Balancer, Faster Structured Outputs](https://www.lmsys.org/blog/2024-12-04-sglang-v0-4/)
- **带上适用场景。** Anthropic 从长时运行的 Agent 切入，再展开初始化和后续会话之间怎样交接。Slides 可以把场景和可复用动作直接写出来，例如「代码 Agent 用进度文件和 Git 历史跨会话续作」。[Effective harnesses for long-running agents](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)

落笔时按本页任务选一种句式。机制页写组件怎样改变请求路径。边界页写哪项条件决定能否继续。实验页写哪个系统在什么负载下改变了哪项指标。版本、负载或基线改变结论时，把必要的限定留在标题或贴着标题的副文里。细节数据放在正文或图中。

## 页底结语写出可复述的判断

用一句话说出证据支持什么、它会改变哪个选择，或听众可以怎样验证。让读者拿走判断所需的主语、动作和条件。步骤、观测值与例子放在正文、图或讲稿。数值直接定义判断边界时，可以留在结语里。句子太长时，先删语气词、修饰和已交代的过程。

| 证据或场景 | 观点标题 | 页底结语 |
| --- | --- | --- |
| 本地命中 8K，远端可补到 24K | Prefill 实例只回读连续前缀中缺失的 KV | Prefill 实例先查本地命中，再算远端回读量。 |
| MLA 覆盖到 8K，KDA 在 6K 和 10K 留有快照 | 混合模型需要对齐各类状态的恢复点 | 混合模型从各类状态共同支持的最远处继续。 |
| Decode 要等目标块写入完成 | Decode 实例给出目标块，Prefill 实例推送 KV | Decode 实例收到写入完成回报后，才能继续生成。 |

## 正文加粗帮助听众定位证据

vLLM 的摘要强调吞吐、TTFT 及部署规模，设计小节用粗体标出调度侧和 Worker 侧。SGLang 的发布文用粗体突出实验结果和路由特性。Anthropic 用粗体标出负责初始化与负责续作的角色。Slides 可借这三种做法，把加粗用在读者需要先认出的角色、结果或判断条件上。[vLLM × Mooncake](https://vllm.ai/blog/2026-05-06-mooncake-store) · [SGLang v0.4](https://www.lmsys.org/blog/2024-12-04-sglang-v0-4/) · [Anthropic](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents)

| 值得加粗的内容 | 取舍原则 | 写法示例 |
| --- | --- | --- |
| 决定动作的条件 | 加粗能回答「什么时候可以继续」的最短完整短语。 | Decode 实例等 **目标块写入完成的回报**，才能继续生成。 |
| 需要区分的角色 | 职责容易混淆时，加粗角色名称，动作留在句中。 | **Store Master** 返回对象位置，**Worker** 把 KV 读入设备块。 |
| 改变判断的对照结果 | 加粗时保留指标、数值及单位或比较对象。把负载和基线放在同一句或紧邻处。 | 在 vLLM 的 Codex trace 回放中，开启共享池后，**P50 TTFT 降至基线的约 1/46**。 [vLLM 实验结果](https://vllm.ai/blog/2026-05-06-mooncake-store) |

每页先选一处最能帮助扫读的加粗。只有两处需要并列比较时，再加第二处。标题和页底结语沿用模板本身的字重与字号层级。正文在 HTML 中用 `<strong>` 标记短语，Slides DSL 中用 `==短语==`。先把完整句写顺，再确定哪几个字需要突出。

## 交付前读三遍

1. 只读标题，确认每页都有明确主体和判断，连起来能看出论证顺序。
2. 单独读页底结语，确认听众能复述谁该做什么，以及判断在哪个条件下成立。
3. 只扫正文的粗体，确认它们能把视线引到关键依据，指标和单位仍齐全。
