# Metadata
Category: engineering
Date/Author: 2026/06/06 · yangjing
Page title: Quant Agent 的两条路 — 论文里的四 Agent 流水线，和我做的 whyj 终端

# TITLE
Quant Agent 的两条路

论文里的四 Agent 流水线，和我做的 whyj 终端

## LEAD
TradingAgents 读新闻、FINCON 做长线——LLM 金融 Agent 跟我想干的量化分析压根不在一个时区。我想盯的是 K 线和因子，不是滞后半天的舆情。[QuantAgent 论文](https://arxiv.org/html/2509.09995) 把交易台拆成四个专职 Agent，SPX 方向准确率 63.7%；我照着另一套思路做了 [oh-my-quant](https://github.com/yangjing/oh-my-quant)——一个 Agent + 十二个 Tool，跑在终端里，日频 A 股也能分析。这篇文章拆 QuantAgent 的架构，也说说我自己踩过的分叉。

## SECTIONS

### Section 1: 问题 — 我想让 Agent 帮我看盘，不是帮我读新闻
Type: text
Body: 我给自己定了一条原则（写在 oh-my-quant 的 `docs/notes.md` 里）：**珍惜注意力，不亲自选股选基。让 Agent / 系统去盯盘和筛选，人只做决策和复盘。**

但市面上大多数 LLM 金融 Agent 干的事跟这条原则对不上。TradingAgents 模拟机构投研流程，吃的是新闻和财报；FINCON 搞 manager-analyst 层级，决策周期是天、周、月；RD-Agent(Q) 能自动挖因子，但粒度也是日频以上的研究循环。

我要的场景更朴素：打开终端，拉平安银行（000001.SZ）的 OHLCV，算动量因子，跑个双均线回测，看 VaR 和夏普，然后让 Agent 用自然语言串起来告诉我"这只票现在处于什么状态"。不需要 vision LLM 识别头肩顶，也不需要秒级 LONG/SHORT 指令——日频、人审、可追溯，就够了。

最近看到 [QuantAgent 论文](https://arxiv.org/html/2509.09995)，它是另一个极端：四个 Agent 固定流水线，输入只有 K 线，输出只有 LONG 或 SHORT，瞄准 1h/4h 的高频场景。读完之后我没有 fork 它的代码，而是回头审视了自己 oh-my-quant 里的架构选择——两条路解决的是同一个问题的不同切面。

Callout: QuantAgent 回答的是"LLM 能不能做小时级方向预测"；oh-my-quant 回答的是"个人投资者怎么用 Agent 做日频量化研究"。问题不同，工程取舍完全不同。

### Section 2: QuantAgent — 四个 Agent，一条固定流水线
Type: text
Body: 先拆论文。QuantAgent 的核心判断是：文本信号在高频场景里有两个硬伤——滞后（价格动完了新闻才出来）和噪声（难验证）。所以输入只留 OHLC bar，用 LangGraph 串四个专职 Agent：

```
Indicator Agent → Pattern Agent → Trend Agent → Risk Agent → Decision Agent
```

**Indicator** — TA-Lib 算 RSI、MACD、Stochastic、Williams %R、ROC，LLM 做上下文解读，不是硬规则 `if RSI > 70: sell`。

**Pattern** — 生成 K 线图，喂 vision LLM 识别旗形、三角形、头肩顶。纯文本模型在这里直接断链。

**Trend** — OLS 拟合支撑/阻力线，看通道斜率和几何关系。形态必须放在趋势上下文里读。

**Risk + Decision** — 固定止损 ρ = 0.0005（0.05%），止盈比 r ∈ [1.2, 1.8]，综合三份报告输出 LONG 或 SHORT。HFT 场景禁止 HOLD。

每个 Agent 写结构化报告到共享 state，没有 Agent 间辩论，就是一条带状态机的 pipeline。好处是可追溯——每笔决策都能拉出四份报告对照。代价是灵活性：上游错了，下游只能硬着头皮综合。

论文数据（4h 框架，相对随机 baseline）：QQQ 59.7%（+26.2%），SPX 63.7%（+34.6%），NQ 55.3%（+26.5%）。SPX 滚动窗口连续预测 10 次对了 8 次。7/8 品种的风险约束收益率拿第一。不是碾压 XGBoost，但在多品种上更稳。

### Section 2.5: QuantAgent 架构图
Type: figure
Image: ./figures/fig-01-quantagent-pipeline.png
Caption: Figure 1: QuantAgent 的固定流水线——Indicator 压指标、Pattern/Trend 看图（vision LLM）、Risk 定止损止盈、Decision 二选一 LONG/SHORT。整条链只消费价格，不碰新闻。跟我做的 whyj 最大区别：它是多 Agent 编排，我是单 Agent + 多 Tool。
Prompt: Create a flat engineering diagram, white background. Left: OHLC input. Center vertical chain: Indicator (TA-Lib) → Pattern (chart→vision LLM) → Trend (OLS→vision LLM) → Risk (ρ=0.0005) → Decision (LONG/SHORT). Right side dashed box labeled "oh-my-quant: 1 Agent + 12 Tools, human-in-loop". Virgil hand-drawn font, no 3D.

### Section 3: 分叉 — 我为什么没抄 QuantAgent 的四 Agent 架构
Type: text
Body: 看完论文，我第一反应不是"我也要四个 Agent"，而是列了一张对比表：

| | QuantAgent | oh-my-quant (whyj) |
|---|---|---|
| 架构 | 4 Agent 固定流水线 (LangGraph) | 1 Agent + 12 Tool (pi agent core) |
| 时间粒度 | 1h / 4h bar | 日频 |
| 市场 | 美股期货、加密 (SPX, NQ, BTC) | A 股 + 美股 (tushare, llmquant) |
| 决策输出 | LONG / SHORT 自动指令 | 因子分位、回测指标、风险报告 |
| 视觉 | 必须 vision LLM | 纯文本，不算形态 |
| 计算层 | LLM 做指标语义解读 | 确定性函数算因子/回测/风险，LLM 只编排 |
| 入口 | Flask Web + Python API | Ink TUI 终端 + slash command |
| 人机关系 | Agent 替人决策 | Agent 辅助分析，人做决策 |

原本以为是"多 Agent 一定比单 Agent 好"，后来发现坑在场景。

我追的是 5-10% 年化、长期持有、不频繁交易——这跟 QuantAgent 的"预测接下来三根 K 线方向"完全是两种物理定律。给它加 Pattern Agent 和 vision LLM，对我的日频回测没有帮助，只会多烧 token。

更关键的是：**我不想要 Agent 替我下单。** notes.md 里写得很清楚，人只做决策和复盘。QuantAgent 的 Decision Agent 直接出 LONG/SHORT，适合研究"LLM 能不能做方向预测"；我要的是"Agent 帮我把数据、因子、风险算清楚，结论我自己看"。

所以我选了另一条路：把"分工"下沉到 Tool 层，而不是 Agent 层。

### Section 4: oh-my-quant — 一个 Agent，十二个 Tool
Type: text
Body: [oh-my-quant](https://github.com/yangjing/oh-my-quant)（npm 包名 `whyj-quant`，CLI 命令 `whyj`）是一个跑在终端里的量化分析 REPL。技术栈就这些：Bun + TypeScript + Ink TUI + pi agent core + MCP 数据源。

两种入口，一个内核：

```
Q > /factor analyze --symbol 000001.SZ --factor momentum    # slash command，确定性执行
Q > 分析平安银行的动量因子和风险指标                          # 自然语言，Agent 编排
```

**7 个数据 Tool（MCP 后端）** — `tushare_daily` 拉 A 股 OHLCV，`llmquant_price` 拉美股，`fd_snapshot` 拉美股财务快照。拉完自动缓存到 `.ohquant/data/`，下次不用重下。

**5 个计算 Tool（纯函数）** — 这才是核心。因子、回测、风险、跑分全是确定性代码，不经过 LLM：

- `compute_factor` — momentum / reversal / volatility / rsi / sma_deviation / volume_ratio，输出最新值 + 历史分位
- `run_backtest` — 双均线交叉，输出 total return、CAGR、Sharpe、max drawdown、win rate
- `check_risk` — 年化波动、VaR(95/99)、CVaR(95/99)、偏度、峰度
- `score_benchmark` — 三维度评分：收益 40 + 风险 40 + 稳健性 20 = 100 分
- `show_dashboard` — 读取 `.ohquant/benchmark/results/` 排名展示

Agent 的 system prompt 里写死了工作流：`data → factor → backtest → risk → benchmark`。LLM 的职责是**决定调用顺序和处理异常**（比如缓存没有就先拉数据、A 股代码格式不对就换 tushare_stock_basic 搜索），不是亲自算 RSI。

这跟 QuantAgent 的 Indicator Agent 形成对照：它让 LLM 解读 MACD 金叉的"语义"；我让 `compute_factor` 算出 RSI 分位数，LLM 只负责把数字串成一句话告诉你。

Callout: 确定性计算下沉到 Tool，LLM 只做编排——这是我从 QuantAgent 学到但没照搬的地方。论文证明了"分工"有效；我的分工是在 Tool 层，不是在 Agent 层。

### Section 4.5: oh-my-quant 架构图
Type: figure
Image: ./figures/fig-02-whyj-architecture.png
Caption: Figure 2: oh-my-quant 的单 Agent 架构——用户输入走 slash command（确定性）或自然语言（Agent 编排）两条路，汇入同一个 pi Agent。Agent 持有 12 个 Tool：7 个 MCP 数据 + 5 个本地计算。计算结果缓存到 .ohquant/，portfolio 信息 live-only 不缓存。跟 QuantAgent 的四 Agent 流水线比，少了一层编排，多了人机之间的审核环节。
Prompt: Create a flat terminal-style diagram. Top: User input splits to "/slash command" (left, deterministic) and "natural language" (right, Agent). Both feed into single "pi Agent" box. Below Agent: two rows of tool boxes — Row 1 "MCP Data" (tushare_daily, llmquant_price, fd_snapshot x3), Row 2 "Compute" (compute_factor, run_backtest, check_risk, score_benchmark, show_dashboard). Bottom: ".ohquant/ local cache". Monospace font, brutalist black/white, no gradients.

### Section 5: 跑一遍 — 从论文到终端
Type: text
Body: 光说架构抽象，跑一个具体例子。

**QuantAgent 的方式**（SPX，4h）：

```python
from trading_graph import TradingGraph
graph = TradingGraph(provider="anthropic")
result = graph.run(asset="SPX", interval="4h")
# → {"direction": "LONG", "rationale": "...", "risk_reward_ratio": "1.5"}
```

四个 Agent 串行跑完，2 次 LLM 看图，1 次综合决策。输出是交易指令。

**oh-my-quant 的方式**（平安银行，日频）：

```bash
npm i -g whyj-quant
whyj
```

```
Q > 分析平安银行的动量因子和风险指标
```

Agent 的实际调用链大概是：

1. `tushare_daily("000001.SZ")` → 缓存 487 根日 K
2. `compute_factor("000001.SZ", "momentum", 20)` → Latest: +0.0432, Percentile: 78%
3. `check_risk("000001.SZ")` → Ann Vol: 18.2%, VaR(95): -2.1%, Max DD: -12.4%
4. 输出一段纯 ASCII 分析报告（system prompt 禁止 markdown 和 emoji）

整个过程 2-3 次 tool 调用，没有 vision，没有 LONG/SHORT 指令。我看完报告自己决定要不要动。

第一条命令甚至不需要 API key——bundle 了平安银行的示例数据，`/data info --symbol 000001.SZ` 离线就能跑。QuantAgent 必须联网拉 Yahoo Finance，必须配 LLM key，必须 vision 模型。我的场景是"晚上回家打开终端看看自选"，不是"毫秒级下单"。

### Section 6: 两条路各踩的坑
Type: text
Body: 知道架构了，说坑。两条路都有，但不一样。

**QuantAgent 的坑**（论文自己也承认了）：

- **延迟** — 四个 Agent 串行 + 2 次看图，1h/4h bar 勉强够，秒级真·高频跑不动。标题写 HFT，实测是小时级。
- **成本** — 每次分析 4-5 次 LLM 调用，100 段 × 8 品种评测的 token 账单不小。
- **没有仓位管理** — 输出方向 + 止损止盈，没有组合相关性、滑点、手续费。
- **过拟合** — 80% 是单段 SPX case study，没做跨年份 regime shift 测试。

**oh-my-quant 的坑**（我自己的）：

- **没有形态识别** — 不算头肩顶、不看 K 线图。日频场景我觉得够用，但如果要做 QuantAgent 那种短周期方向预测，这是硬伤。
- **只有双均线回测** — `run_backtest` 目前只支持 SMA 交叉，策略空间窄。RD-Agent(Q) 那种自动挖因子我根本没碰。
- **A 股数据依赖 MCP** — tushare 要 token，AKShare 做 fallback，美股靠 llmquant-data。数据源断了，Agent 只能干瞪眼。
- **Agent 还是会啰嗦** — system prompt 写了"NO markdown, NO emoji"，但模型偶尔还是犯规。确定性 slash command 反而更靠谱。
- **日频跟不上市场** — 对于 notes.md 里"克制短期交易欲望"的原则，这反而是 feature；但如果你真想做小时级交易，whyj 完全不对路。

我不确定哪条路更"正确"。QuantAgent 在 SPX 上方向准确率 63.7%，证明了多 Agent + 价格驱动 + LLM 语义解读在小时级有效。oh-my-quant 还没跑过大样本 benchmark 证明"Agent 编排比手动敲命令好多少"——它解决的是工程体验问题，不是 alpha 问题。

### Section 7: 从论文到工程 — 我拿走了什么
Type: text
Body: 绕了一圈回来，QuantAgent 对我影响最大的不是那组准确率数字，是三句话：

**第一，价格驱动。** 不碰新闻、不碰社媒，OHLC bar 就是信息密度的上限。oh-my-quant 的数据 Tool 也只拉 OHLCV 和财务指标，不接舆情流。跟 notes.md 里"不亲自选股"不矛盾——让 Agent 看价格和数据，人看 Agent 的报告。

**第二，分工可追溯。** QuantAgent 用四个 Agent 各写一份报告；我用五个计算 Tool 各输出一段结构化结果。本质一样：决策过程可审计。`.ohquant/benchmark/results/` 里存着每次跑分的 JSON，`.ohquant/sessions/` 里存着 Agent 对话的 Markdown。哪天结论错了，能翻日志找是哪个 Tool 的数据有问题。

**第三，确定性计算和 LLM 推理分层。** 论文里 Indicator Agent 用 TA-Lib 算指标、LLM 解读；我把它推到底：`src/services/factor.ts` 和 `backtest.ts` 是纯函数，零 I/O，可单测；LLM 碰不到计算逻辑。这是古典软件工程的单一职责——跟 Synapse 项目里一直强调的"注入、暴露、编排"是同一套审美。

没拿的东西也很明确：vision LLM 看图（我的场景不需要）、固定 LONG/SHORT 决策（我要人审）、LangGraph 多 Agent 编排（一个 Agent + Tool 够用了，Bun 单进程跑得更轻）。

### Section 8: takeaway
Type: text
Body: 如果你问我"Quant Agent 应该怎么做"，我的回答是：先想清楚你要回答什么问题。

- 问题是"小时级方向预测能不能用 LLM 做" → 看 [QuantAgent 论文和代码](https://github.com/Y-Research-SBU/QuantAgent)，四 Agent 流水线是经过验证的架构。
- 问题是"个人投资者怎么用 Agent 做日频量化研究" → 试试 [oh-my-quant](https://github.com/yangjing/oh-my-quant)，`npm i -g whyj-quant && whyj`，第一条命令 `/data info --symbol 000001.SZ` 不用配 key 就能跑。

好处是：QuantAgent 给了学术上的分工范式，oh-my-quant 给了工程上的落地参考。代价是：两条路都不等于"能赚钱"——论文有样本外风险，我的终端没跑过实盘验证。

目前的方案上限也就到这了。QuantAgent 是小时级研究工具，whyj 是日频分析终端，都不是生产级交易引擎。但它们把同一件事说清楚了：**LLM 在量化里的位置不是替代计算，是编排计算、解释计算、让人能审核计算。**

先这样。等跑起来再说。

### Section 9: Reference
Type: reference
- **QuantAgent: Price-Driven Multi-Agent LLMs for High-Frequency Trading** - Fei Xiong et al., arXiv:2509.09995 - https://arxiv.org/abs/2509.09995
- **QuantAgent GitHub** - Y-Research-SBU - https://github.com/Y-Research-SBU/QuantAgent
- **oh-my-quant (whyj-quant)** - yangjing - https://github.com/yangjing/oh-my-quant
- **whyj-quant on npm** - https://www.npmjs.com/package/whyj-quant
- **TradingAgents** - Xiao et al., 2025 - https://arxiv.org/abs/2412.20138
- **FINCON** - Yu et al., 2024 - https://arxiv.org/abs/2407.06576

## PULSE
Quant Agent 有两条路：QuantAgent 用四个专职 Agent 做小时级 LONG/SHORT 预测，SPX 准确率 63.7%；oh-my-quant 用一个 Agent 加十二个 Tool 做日频量化研究，人审结论、Agent 编排。共同点是价格驱动、分工可追溯、确定性计算和 LLM 推理分层。分歧点是时间粒度、决策权和架构复杂度。LLM 在量化里的位置不是替代计算，是编排计算、解释计算、让人能审核计算。
