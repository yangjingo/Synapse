# Metadata
Category: CLI-Revolution
Date/Author: 2026/05/02 · yangjing
Page title: CLI 不是复古，是软件交互层正在发生的结构性位移

# TITLE
CLI 不是复古，是软件交互层正在发生的结构性位移

## LEAD
最近在调一套 Agent 工作流，从 Cursor 到 Windsurf 到 Claude Code，跑了一圈下来发现一个很基本的共同点：这些工具的交互入口全是 CLI。不是图形界面，不是拖拽画布，就是命令行。GitHub Copilot 也从 Chat 模式转向了 Agent Mode，底层从 Tool-calling 演进为直接写代码执行。这些现象放在一起，指向的不是某种怀旧情结，而是软件交互层正在发生的结构性位移——当 Agent 成为主要的操作者，CLI 天然成为最高效的交互协议。

## SECTIONS

### Section 1: 现状：三条事实指向同一个方向
Type: text
Body: 先摆事实。Cursor、Windsurf、Claude Code，2025 年到现在最活跃的 AI 编程工具，交互入口全部是 CLI。GitHub Copilot 转 Agent Mode，操作粒度从对话建议变成直接在终端里跑命令。这不是巧合。这些团队各自独立迭代，最后收敛到同一个选择，说明 CLI 在 Agent 场景下有结构性的效率优势，而不是某个团队的产品偏好。把 CLI 当成"程序员审美"来理解就搞反了——它是 Agent 和系统之间摩擦最小的协议层。

### Section 2: Token 效率：CLI O(1) vs GUI O(n)，这是数学不是偏好
Type: text
Body: 一条 CLI 指令的 Token 消耗基本恒定：你告诉 Agent 做什么，它执行，返回结果。GUI 的操作路径完全不一样——每多一个交互步骤，上下文就多一轮膨胀。点按钮、读弹窗、选菜单、填表单，每一步都在烧 Token，而且是线性增长。这个差距不是微调能弥补的，它是协议层面的结构性差异。CLI 的语义密度天然高于 GUI，因为命令本身就是意图的最短表达。GUI 把意图拆散到了视觉元素和交互步骤里，对人类来说直觉，对 Agent 来说是效率灾难。
Callout: CLI 的 O(1) Token 效率不是优化结果，是协议属性。GUI 的 O(n) 增长不是实现问题，是交互范式本身的代价。这不是偏好，是数学。

### Section 2.5: Token 效率对比
Type: figure
Image: ./figures/figure-01-token-efficiency.svg
Caption: Figure 1: CLI O(1) Token 效率 vs GUI O(n) 线性膨胀
Prompt: Token consumption comparison showing CLI constant vs GUI linear growth

### Section 3: Code-as-Action：从 Tool-calling 到 Agent 直接写代码执行
Type: text
Body: Tool-calling 的模式是：Agent 判断需要调用某个工具 → 构造参数 → 调用 → 拿结果。这个流程有个隐含假设——工具的接口是固定的、预先定义好的。但实际工程里的操作远比预定义接口复杂。CodeAct（ICML 2024）提出了一种更直接的路径：Agent 不调用工具，直接写代码执行。写一段 Python、一条 bash 命令、一个 SQL 查询，然后跑。这带来的变化是根本性的——Agent 的能力边界不再受限于工具定义的覆盖范围，而是受限于它能生成和验证的代码。SWE-bench（ICLR 2024）的评测数据也印证了这一点：直接写代码执行的 Agent 在复杂工程任务上的表现，显著优于纯 Tool-calling 的方案。

### Section 4: 平台博弈：飞书钉钉重做 API 层为 Agent 通道
Type: text
Body: 国内平台在做的动作比想象中激进。飞书和钉钉都在重构 API 层，不是简单开放几个接口，而是把核心操作路径暴露为 Agent 可直接调用的通道。之前这些操作路径只服务于 GUI——用户点按钮，后端响应。现在它们开始为第二种用户服务：Agent。Slack 在海外也在走类似的路。这意味着平台的竞争维度在变：以前比的是界面好不好用，现在比的是 Agent 能不能无障碍地操作你的平台能力。
Callout: 平台重做 API 层不是为了开放生态，是为了不被 Agent 时代绕过。能被 Agent 直接调用的平台才有入口价值，剩下的都是沉没成本。

### Section 4.5: 交互层优先级
Type: figure
Image: ./figures/figure-02-priority-stack.svg
Caption: Figure 2: 交互层优先级——CLI/API → Logic → GUI
Prompt: Priority stack showing CLI/API at base, Logic in middle, GUI as thin top layer

### Section 5: SaaS 策略转变：界面变薄，API/CLI 成为核心
Type: text
Body: 对 SaaS 公司来说，这个趋势的冲击是直接的。如果你的核心价值在 UI 层——漂亮的界面、精心设计的交互流程——那 Agent 时代对你不太友好，因为 Agent 不看界面，它走接口。反过来，如果你的核心价值在 API 和 CLI 层——功能本身就是可编程的、可编排的、可被外部系统调用的——那 Agent 越普及，你的系统越容易被集成。所以你看到越来越多的产品策略是：先做能被调用的系统，再做好看的系统。界面变薄，变成结果展示和审批层，不再是操作层。OSWorld Benchmark 做的事情也反映了这个判断——它在评测 Agent 操作真实桌面环境的能力，而评测结果显示，纯 GUI 操作的 Agent 成功率远低于走 API/CLI 的方案。

### Section 6: 落地动作：封装 CLI → Agent 串联 → 校验收敛
Type: text
Body: 说完了趋势，聊点能落地的。OpenHands 项目的架构给了一个很清晰的参考路径。第一步，把关键流程封装成 CLI 命令。不是所有流程都需要 CLI，但高频、确定性的操作一定要有命令行入口。第二步，用 Agent 驱动命令的串联执行。单个 CLI 命令不够，Agent 需要的是多步编排——跑完测试再跑部署，部署完跑冒烟验证。第三步，用校验器收敛输出质量。Agent 生成的代码和执行的命令不是每次都对，需要有结构化的校验环节来兜底。这三步不是理论，是在实际工作流里反复验证过的。从封装到串联到校验，每一步都在把不确定性压低一个量级。

### Section 7: Reference
Type: reference
- **CodeAct** - ICML 2024 - https://arxiv.org/abs/2402.01030
- **SWE-bench** - ICLR 2024 - https://arxiv.org/abs/2310.06770
- **OSWorld Benchmark** - https://os-world.github.io/
- **OpenHands Project** - https://github.com/All-Hands-AI/OpenHands

## PULSE
SaaS 的护城河不在界面，在能不能被 Agent 调用。选错方向的公司不是被竞争打败的，是被交互层的结构性位移淘汰的。先把 CLI 做对，再做界面。顺序反了就是给别人铺路。
