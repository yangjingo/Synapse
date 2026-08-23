# 00 / Cover

## whyj-quant

个人量化研究终端 — Agent 编排，人做决策

Version: Synapse v6.0 | Author: Why.J | Date: 2026/06/06

---

# 01 / Context

## 现状：缺的不是又一个"AI 炒股"Demo

- **事实 1**: 大多数 LLM 金融 Agent 做 ==投研/舆情/自动下单==，跟个人投资者的日频研究节奏对不上。
- **事实 2**: 传统量化工具（JQ/聚宽）是 ==Web 回测平台==，没有终端级的 Agent 编排体验。
- **事实 3**: [oh-my-quant](https://github.com/yangjing/oh-my-quant) 的定位是 ==交互式研究终端==：`whyj` CLI，Bun + Ink TUI，人审结论。

::pulse [「 让 Agent 盯盘筛选，人只做决策和复盘。 」] ::

::image [./figures/figure-03-research-repl.svg] [scale=100] ::

---

# 02 / Agenda

## whyj-quant 怎么设计的

- **Q1**: 事实 3 的产品定位 —— whyj-quant ==是什么、不是什么==？
- **Q2**: 代码里 ==四层架构== 怎么拆？各层职责边界在哪？
- **Q3**: ==Slash Command== 和 ==AI Agent== 两条入口怎么共存？
- **Q4**: Tool / 存储 / Agent 三层 ==工程约束== 是什么？

---

# 03 / Mechanism I

## 产品定位：研究终端，不是交易引擎

- **目标用户**: 追 5–10% 年化、==长期持有==、不频繁交易的个人投资者。
- **核心场景**: 拉行情 → 算因子 → 回测 → 看风险 → 跑分对比，==Agent 串流程，人看报告==。
- **不是什么**: 不是 HFT 方向预测（QuantAgent 那条路），不是自动下单，不是舆情分析。
- **是什么**: Claude Code 式的 ==量化研究 REPL==——确定性 slash command + 自然语言 Agent 双通道。

::pulse [「 Agent 辅助分析，人审结论。 」] ::

::code [text] [npm i -g whyj-quant && whyj
/data info --symbol 000001.SZ    # 离线可跑，bundle 示例数据
分析平安银行的动量因子和风险指标   # 需 API key，Agent 编排] ::

---

# 04 / Mechanism II

## 代码架构：四层分离，单向依赖

- **TUI 层**: `app.tsx` + Ink 组件 —— 只负责 ==渲染和事件==，不碰计算逻辑。
- **Command 层**: `commands/registry.ts` —— slash 解析 + 分发，==确定性快路径==。
- **Agent 层**: `agent/session.ts` + `context.ts` —— pi core 包装，12 Tool 注册，prompt 组装。
- **Service 层**: `services/*.ts` —— ==纯函数，零 I/O==，factor / backtest / risk / benchmark。

::pulse [「 计算逻辑碰不到 LLM，LLM 碰不到文件系统。 」] ::

::code [text] [src/
  index.ts          # 入口：REPL / one-shot / doctor
  app.tsx           # Ink 根组件，agent.subscribe → UI
  commands/         # slash 解析 + handler
  agent/            # pi Agent wrapper + prompt
  tools/            # MCP_TOOLS(7) + COMPUTE_TOOLS(5)
  services/         # 纯计算函数
  data/ + storage/  # MCP client + .ohquant/ 本地读写] ::

---

# 05 / Mechanism III

## 双通道入口：同内核，不同确定性

- **Slash Command**: `/factor analyze --symbol 000001.SZ` → `parseCommand()` → `executeCommand()` → 直接调 service，==结果可复现==。
- **自然语言**: 无 `/` 前缀 → `createAgent().prompt()` → LLM 决定调哪些 Tool，==灵活但需 API key==。
- **One-shot**: `whyj -c "/backtest run --symbol 000001.SZ"` 或 `whyj --json doctor`，==CI/脚本友好==。
- **设计原则**: slash 是 Agent 的 ==子集==——Agent 能做的事，slash 都能确定性执行；反过来不成立。

::pulse [「 Slash 是快路径，Agent 是探索路径。 」] ::

::image [./figures/figure-04-dual-entry.svg] [scale=100] ::

---

# 06 / Mechanism IV

## Tool 设计：数据拉取与计算严格分层

- **MCP_TOOLS × 7**: `tushare_daily` / `llmquant_price` / `fd_snapshot` 等 —— 调 MCP → 规范化 → `saveBars()` 缓存。
- **COMPUTE_TOOLS × 5**: `compute_factor` / `run_backtest` / `check_risk` / `score_benchmark` / `show_dashboard` —— 只读 `.ohquant/data/` 缓存。
- **硬约束**: 计算 Tool 缓存为空时返回 `DATA_NO_CACHE`，==强制 Agent 先拉数据==，不会凭空算。
- **Schema**: 每个 Tool 用 ==TypeBox== 定义参数，pi core 做 JSON Schema 校验。

::pulse [「 data → factor → backtest → risk → benchmark，顺序写死在 prompt 里。 」] ::

::code [typescript] [// quant-tools.ts — compute Tool 模式
const cached = await loadCachedBars(symbol);
if (!cached) return err("DATA_NO_CACHE", ...);
const values = compute(args.factor, close, volume, period);
return ok(`Factor: momentum_20 — ${symbol}  Latest: +0.0432`);] ::

---

# 07 / Mechanism V

## 存储策略：四类目录，portfolio 禁止缓存

- **durable**: `settings.json` / `watchlist.json` —— 用户配置，==不可当缓存删==。
- **cache**: `.ohquant/data/{source}/{symbol}/` —— 公开行情，可重取可覆盖。
- **artifact**: `benchmark/results/` / `sessions/` —— 跑分结果和对话 Markdown，==显式产出==。
- **forbidden**: `portfolio/` —— 持仓净值 ==live-only==，不允许写入或推断本地文件。

::pulse [「 公开市场数据可缓存，个人仓位绝不落盘。 」] ::

::image [./figures/figure-05-storage-policy.svg] [scale=100] ::

---

# 08 / Mechanism VI

## Agent 层：pi core 包装，不做多余的事

- **createAgent()**: 注册 12 Tool，`toolExecution: "sequential"`，一次只跑一个 Tool。
- **Prompt 组装**: `BASE_SYSTEM_PROMPT` 列清 12 Tool + 工作流 + 输出约束（==NO markdown, NO emoji==，纯 ASCII 金融术语）。
- **上下文压缩**: token 超 111k 时启发式 compact，==不调 LLM 做摘要==，保留最近 24k token。
- **Session 持久化**: `agent_end` hook → `.ohquant/sessions/{date}/session-{time}.md`，==对话可审计==。
- **错误系统**: 12 个 `ErrorCode`，每个带 problem + cause + fix，==DX 优先==。

::pulse [「 Agent 是编排器，不是计算器，也不是交易员。 」] ::

::code [typescript] [// session.ts
new Agent({
  tools: [...MCP_TOOLS, ...COMPUTE_TOOLS],
  toolExecution: "sequential",
  transformContext: (msgs) =>
    estimateTokens(msgs) >= 111616 ? compactMessages(msgs) : msgs,
});] ::

---

# 09 / Take A Ways

## Take A Ways

- **Q1 → A1**: 定位 —— ==个人日频量化研究终端==，Agent 编排 + 人审结论；不是 HFT、不是自动下单、不是舆情 Agent。
- **Q2 → A2**: 四层架构 —— TUI / Command / Agent / Service ==单向依赖==，计算全是 `services/` 纯函数，LLM 只编排 Tool。
- **Q3 → A3**: 双通道 —— slash 是确定性快路径，自然语言是探索路径；同一套 Tool 和 Service 内核。
- **Q4 → A4**: 工程约束 —— TypeBox schema、cache-first 数据、portfolio live-only、12 错误码、session Markdown 审计。

::pulse [「 LLM 在 whyj 里的位置：编排计算、解释计算、让人审核计算。 」] [fragment] ::

---

# 10 / Reference

## Reference

- **oh-my-quant (whyj-quant)** - yangjing - https://github.com/yangjing/oh-my-quant
- **whyj-quant on npm** - https://www.npmjs.com/package/whyj-quant
- **Agent System Spec** - docs/agent-system-spec.md - https://github.com/yangjing/oh-my-quant/blob/main/docs/agent-system-spec.md
- **Storage Policy** - docs/ohquant-storage-policy.md - https://github.com/yangjing/oh-my-quant/blob/main/docs/ohquant-storage-policy.md
- **QuantAgent Paper** - Fei Xiong et al. - https://arxiv.org/abs/2509.09995
