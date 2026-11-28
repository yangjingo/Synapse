# 电脑关机后，Agent 仍能沿着看板交付

晚上合上电脑前，WhyJ-Quant 的 CI 需求卡还挂着一行「盘点现有检查」。第二天打开手机，我希望能看到 Agent 查了哪个提交、哪些用户路径还缺证据、下一步归谁。如果 Worker 已经开了 PR，却在回填看板前掉线，接班的 Worker 还得找回那条 PR，接着查它的 CI。

我把这个设想称为 24 小时 SuperAgent。GitHub 看板保存需求和验收条件，云端 Worker 按任务记录接力，PR 和 Actions 保存可复查的交付证据。本文从 WhyJ-Quant 已有的看板与 CI 出发，设计云端接力、故障恢复和关机验收。这三项还待部署验证。

## 需求卡负责交接，PR 和 Actions 保存交付证据

第二天打开看板时，「CI-01 进行中」只能说明有人领了任务。接手者还需要知道该交付什么、上一次查到哪里，以及哪次运行可以核对。

**需求卡写清验收条件，云端任务记录留下接力点，PR 和 Actions 把变更与测试证据绑定到具体提交。**

[WhyJ-Quant 的 CI 总卡](https://github.com/users/yangjingo/projects/4?pane=issue&itemId=321201735)汇总覆盖盘点、安装后验收、工作台交互和只读行情连通性等工作。其中，[CI-01 的覆盖盘点卡](https://github.com/users/yangjingo/projects/4?pane=issue&itemId=321232280)要求交付一张覆盖表，逐条说明工作流从哪里启动、测试哪一层、实际断言什么。打开卡片需要 Project 权限。

接手者可以从[常规 Linux/Windows CI](https://github.com/yangjingo/WhyJ-Quant/actions/runs/46099215204)核对现有检查，从 [Windows Desktop 基线运行](https://github.com/yangjingo/WhyJ-Quant/actions/runs/46099215212)核对桌面检查，再翻看[可选 Live Provider 运行](https://github.com/yangjingo/WhyJ-Quant/actions/runs/46099215243)的行情连通性证据。三次运行都绑定到同一个提交 `08f860b`，可以作为同一轮盘点的基线。每条运行能覆盖什么，还要看具体步骤和断言。

在 [WhyJ-Quant Board](https://github.com/users/yangjingo/projects/4/views/2) 中，「CI补齐以及Review」「UI/UX 易用性优化」和「TODO」都占用 Status 字段。CI 总卡可以留在 CI 列，细项由子卡跟踪。团队需要跨类别查看「所有进行中」时，可以借鉴 [DeepInfer Roadmap 的特性视图](https://github.com/orgs/cann-framework/projects/1/views/4)，把特性和进度分开筛选。两个看板视图都需要相应权限。[DeepInfer 需求清单](https://github.com/cann-framework/cann-deepinfer-recipe/blob/main/docs/requirements.yaml)里的稳定编号也适合让 RFC 和实现回指具体需求。

| 信息 | 建议的记录位置 | Agent 如何使用 |
| --- | --- | --- |
| 需求、优先级、负责人、验收条件 | Project 需求卡或仓库 Issue | Agent 按稳定条目编号领取一段范围明确的工作。 |
| 执行阶段、阻塞、恢复位置 | 云端任务记录，摘要及链接回填到需求卡 | 新会话按任务 ID 定位上次已完成的动作。 |
| 变更、评审、测试与产物 | PR、Actions 和报告 | 验收者核对同一个提交对应的证据和限制。 |

## 一次完整委派从 CI-01 的覆盖盘点开始

同一个提交的三次基线运行可以供 CI-01 对照，但看见「成功」还判断不了测试是从源码目录启动，还是从已安装的候选包启动。

**先让 CI-01 交付一张逐项可核对的覆盖表，再把其中确认的安装后路径缺口交给 CI-02。**

把 CI-01 委派给 Agent 时，先要求它读固定版本的 [WhyJ-Quant CI 指南](https://github.com/yangjingo/WhyJ-Quant/blob/08f860beeb8d3a3b9bf0eae15b7c9ebcde75fdb5/docs/ci-release.md)，再核对盘点基线提交的工作流和 Actions 记录，把「入口、平台、断言、运行链接、缺口」逐项写进覆盖表。[GitHub Projects API](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)提供读取条目和更新项目的 GraphQL 操作。Agent 只有读取权限时，先交出带证据链接的草稿，由维护者写回原卡。

第一次可以用两个只读命令确认数据入口。这两条命令分别查看私有 Project 的任务列表和已知的 Windows Desktop 基线运行，需要登录有相应访问权限的 GitHub 账号。

~~~powershell
gh project item-list 4 --owner yangjingo --format json --limit 50
gh run view 46099215212 --repo yangjingo/WhyJ-Quant --json headSha,conclusion,jobs,url
~~~

如果 CI-01 的覆盖表确认安装后路径有缺口，维护者可以从 [CI-02 的安装验收卡](https://github.com/users/yangjingo/projects/4?pane=issue&itemId=321232316)挑一条路径，开独立的实现 Issue。候选用例是用发布包里的 CLI 回放固定行情，检查日期、零值、缺失值，再验证归档缺失时的失败行为。Worker 在隔离 checkout 中提交 PR，核对最终修订的 Actions 结果，再把证据链接写回 CI-02。[WhyJ-Quant 的 PR policy](https://github.com/yangjingo/WhyJ-Quant/blob/08f860beeb8d3a3b9bf0eae15b7c9ebcde75fdb5/docs/ci-release.md#issues-and-pull-requests)已有 Issue 关联、说明章节和文档变更要求。安装后路径是否达标，由这个 Issue 的断言和合入门禁共同决定。

~~~text
Project card  →  Scoped task  →  Worker
      ↑                            ↓
Acceptance  ←  Run evidence  ←  GitHub PR
~~~

**Figure 1: The board points to delivery evidence.** 需求卡提供目标与范围，Worker 生成变更，Actions 产出验证证据，维护者将验收结果写回原卡。

## dots 接住云端委派，运行环境决定关机后能做什么

CI-01 只需要读卡片和 Actions，CI-02 却要试跑一个安装候选。即使同一个 dot 接到了两项任务，关机后能执行的步骤也会不同。

**dot 可以发起巡检和委派，CI-02 能否关机续跑取决于云端环境能否取得对应候选包、执行检查并保存结果。**

我会先把 CI-01 的只读巡检交给 dot，由它核对最新 Actions 结果，把需要研判的运行链接和问题带回来。[OpenAI 的 dot 入门指南](https://help.openai.com/en/articles/20001530-getting-started-with-your-dot)说明，dot 有自己的云端电脑，也可以使用预先配置的 Codex 云环境派发编码任务。CI-02 的实现可以交给这样的环境。[dots 的运行边界](https://learn.chatgpt.com/docs/enterprise/dots-security)决定哪些步骤还要依赖本机文件、桌面登录态或本机工具。

[OpenAI 对 dot 主动研究和动作权限的说明](https://help.openai.com/en/articles/20001529-dots-privacy-security-and-safety-faqs)区分了私有笔记和外部动作。更新共享看板时，应核对安排的任务、连接器权限和审批要求。对 PR 变化，可以先检查工作区是否支持 [ChatGPT Work 的事件触发任务](https://help.openai.com/en/articles/10291617-scheduled-tasks-in-chatgpt)，也可以让自己的服务接收 GitHub Webhook。验收时在 dot 的 Activity 中核对委派任务的运行位置，并实测事件、私有 Project 可见性和写入权限。

CI-02 要在关机后运行，云环境得能检出指定提交、取得对应安装候选、重放固定输入并留下 Actions 结果。[WhyJ-Quant 的 Windows Desktop 工作流](https://github.com/yangjingo/WhyJ-Quant/blob/08f860beeb8d3a3b9bf0eae15b7c9ebcde75fdb5/.github/workflows/desktop.yml)为安装、升级和跨入口检查提供了起点。原生输入法、系统托盘或干净机器等验收项由符合条件的 Windows 环境执行。维护者可以在手机上作决定和审批。

## SuperAgent 把一次任务变成可恢复的工作流

假设 CI-02 的 Worker 已开 PR，但还没回填看板就掉线。重启后的 Worker 从哪一步继续？如果它只看到「CI-02 进行中」，就不知道该新建 PR，还是等待已有 PR 的测试。

**在这套设计里，接班 Worker 先按稳定分支找回已有的 PR，再核对当前提交的 Actions 结果并回填看板。**

Anthropic 在 [Effective harnesses for long-running agents](https://www.anthropic.com/research/effective-harnesses-for-long-running-agents) 中让接班的 Claude 读取进度文件和 Git 历史，再挑选未完成的工作。[DeepSeek 的 DSH SuperAgent](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/8c32a9dc5d72c033816c6a8110b37f40cf94fba4/README.md)研究原型用 Ticket 追踪请求和执行，其[执行与恢复文档](https://github.com/deepseek-ai/dsh-superagent-prototype/blob/8c32a9dc5d72c033816c6a8110b37f40cf94fba4/docs/003-execution.md)说明了重启时如何读取任务记录，以及重试外部操作前如何检查已产生的结果。

~~~text
Schedule / Webhook  →  Durable queue  →  Cloud worker  →  PR / Actions
                             ↑                                  │
                             └───────── Reconcile result ───────┘
~~~

**Figure 2: Durable work survives a cloud worker restart.** 在拟议架构中，队列保存待办，接班 Worker 从远端结果恢复进度。

在 WhyJ-Quant 的拟议编排里，CI-02 从登记到验收经过四步。

1. **入口登记任务。** 按 [GitHub Webhook 的投递建议](https://docs.github.com/en/webhooks/using-webhooks/best-practices-for-using-webhooks)校验来源、异步处理，并用投递 ID 识别重发。编排器持久化事件后再应答，用「需求卡 ID + 条目编号」识别同一项工作。定时扫描只有在缺了状态时才到 GitHub 对账。
2. **Worker 领取一次尝试。** 任务记录保存授权范围、基线提交、当前尝试、预算、检查点、稳定分支和已知 PR。编排器领取时登记带期限的占用，更新状态时核对当前尝试编号，避免迟到的回执覆盖新进度。
3. **接班 Worker 找回原 PR。** CI-02 在开 PR 后掉线时，接班 Worker 先按稳定分支查 GitHub，找到已有 PR 就补写链接，再查它当前 head SHA 的 CI。暂时查不到远端结果时按预算重试。缺少权限、目标机或人的决定时，将现有证据和等待事项写回卡片。
4. **维护者按当前提交验收。** 编排器把 Actions 的运行结果关联到 CI-02 对应的 PR 和提交，维护者复核关键断言后结束任务。PR 有新提交时，相关验证回到待核。值守者如需停机，按 [dot 的暂停与委派说明](https://help.openai.com/en/articles/20001530-getting-started-with-your-dot)分别检查调度、在途任务和已委派的云任务。

## 自动评审把风险反馈写回同一个 PR

假设 CI-02 的 PR 已经加了安装检查。如果 smoke test 仍从源码目录启动，即使 Actions 全绿也可能绕过安装产物。维护者需要看到测试具体从哪里进来。

**让评审 Bot 在同一个 PR 标出被绕过的入口，维护者复核后由作者补断言，再用新提交的 Actions 结果完成验收。**

CI-02 要验证安装、Agent 调用和数据源。以安装检查为例，评审意见应指出启动命令的位置，以及该命令怎么绕过了候选包。作者改用安装后的入口后，维护者可以按同一个 Issue 的验收条件核对运行。

[WhyJ-Quant 的 GitHub ruleset](https://github.com/yangjingo/WhyJ-Quant/rules/28285489)对面向 `main` 的就绪 PR 启用了 Copilot 自动评审，实际触发取决于作者权限和额度。[GitHub 对 Copilot 代码评审的模型说明](https://docs.github.com/en/copilot/concepts/agent-capabilities/agent-powered-workflows-and-operations/code-review#model-usage)把这项服务的模型组合和其他界面的模型选择分开说明。验收 Bot 时，可把评审的 head SHA、PR 或运行链接和结果记回 [CI-07 卡片](https://github.com/users/yangjingo/projects/4?pane=issue&itemId=321232423)，查看需要 Project 权限。

## 第一次验收就合上电脑

手动运行一次 CI-01，可以观察任务能否完成。要验收 24 小时接力，还得观察本机关机后任务是否继续，以及 Worker 在开 PR 后中断时，团队能不能接着核对证据。

**关机验收要看到 CI-01 从云端交付覆盖表，也要看到 CI-02 在 Worker 中断后找回原 PR 并继续验证。**

我会选一个明确的离线窗口，先用 CI-01 验证只读巡检，再把获授权的 CI-02 候选放到测试仓或隔离分支做故障测试。每次记录触发时间、运行环境、任务标识、PR、head SHA 和 Actions 链接，方便另一个人复核。

| 测试 | 怎么触发 | 通过条件 |
| --- | --- | --- |
| CI-01 关机续跑 | 关机后从手机发起，或由定时任务触发。 | 云环境交付覆盖表，另一位同事能从需求卡定位盘点基线和所引用的运行。 |
| CI-02 重复投递 | 对同一请求进行重发。 | 看板上仍只有一项业务任务，重复 PR 数为 0。 |
| CI-02 开 PR 后中断 | 等 PR 创建成功、看板尚未收到链接时结束 Worker。 | 接班 Worker 找回同一个 PR，并继续核对当前提交的 Actions。记录恢复耗时。 |
| CI-02 缺少写权限 | 用只读身份领取任务。 | Worker 留下已取得的证据和待授权事项，任务进入等待。 |
| CI-02 提交更新 | 旧提交验证通过后，给同一个 PR 推送新提交。 | 依赖旧提交的检查回到待核，维护者能定位新提交对应的运行。 |

这是这套 24 小时方案的验收口径。只要任务已获授权，团队可以在任何时点将它入队，Worker 按预算推进，需要人时留下等待项。第二天接手的人打开原卡，就能找到证据和下一步。

## Synapse 把完成后的证据写成团队能复用的材料

CI-02 验收后，另一位同事可能想知道，为什么要从安装产物重放行情，以及这条检查覆盖了源码入口测试漏掉的什么。看板上的「已完成」只能告诉他团队做完了这项工作。

**把需求、验证断言和运行结果一起写进技术解释，下一位同事才能沿着文章复跑这条检查。**

把需求卡、最终 PR、Actions 运行和失败日志交给 [Synapse 的 Forge 流程](https://github.com/yangjingo/Synapse/blob/0eda5e6789f8393acf3f818e8d9f85fdf315c451/skills/synapse-tech-blog/workflows/forge/WORKFLOW.md)，就有材料解释这条测试为什么值得补。团队可用 [Synapse 的博客和幻灯片技能](https://github.com/yangjingo/Synapse/tree/0eda5e6789f8393acf3f818e8d9f85fdf315c451/skills)分别写技术解释和复盘短讲，两份材料沿用同一组证据。

Worker 可以从对应提交读取 [WhyJ-Quant 的 issue-skill](https://github.com/yangjingo/WhyJ-Quant/blob/08f860beeb8d3a3b9bf0eae15b7c9ebcde75fdb5/.agents/skills/issue-skill/SKILL.md)界定任务范围，再按 [pr-skill](https://github.com/yangjingo/WhyJ-Quant/blob/08f860beeb8d3a3b9bf0eae15b7c9ebcde75fdb5/.agents/skills/pr-skill/SKILL.md)核对交付。成文时保留回到原需求和原运行的入口。等另一位同事能沿着文章找到断言、复跑测试，并用在自己的安装场景里，团队才知道这份记录能被复用。

## 附录 A · GitHub、Linear 和 Jira 的委派入口

如果团队已经在 Linear 或 Jira 规划工作，CI-02 的状态就可能同时出现在原任务和 GitHub 看板，接手者需要知道该更新哪一边。

**让团队已有的任务系统负责状态更新，用 GitHub PR 和 Actions 保存可回查的代码与验证证据。**

对 WhyJ-Quant，GitHub Projects 加仓库 Issues 已经能关联需求、PR 和项目字段。使用 Linear 或 Jira 的团队可以继续沿用所在系统的委派入口和更新权限。

| 入口 | 适合怎样交办 | Agent 怎样接手 |
| --- | --- | --- |
| GitHub Projects + Issues | 维护者从看板选工作，把卡片或 Issue 链接交给 Agent。 | Agent 通过 CLI 或 API 回填。具备权限时，维护者可以[将仓库 Issue 指派给 GitHub Copilot](https://docs.github.com/en/copilot/how-tos/copilot-on-github/use-copilot-agents/kick-off-a-task)，由它提交 PR 供评审。 |
| Linear + GitHub | 负责人通过委派或 @ 提及发起工作。 | 现有 Agent 可以用 [Linear MCP](https://linear.app/docs/mcp)读写卡片。原生委派通过 [AgentSession 与 Activity](https://linear.app/developers/agent-interaction)接收任务、报告进展，再通过 [Linear 的 GitHub 集成](https://linear.app/docs/github-integration)关联 PR 和 Issue。 |
| Jira + GitHub | 团队已经在 Jira 管理需求与跨团队依赖。 | 团队可以[从 Jira 工作项启动编码 Agent](https://support.atlassian.com/jira-software-cloud/docs/generate-code-from-a-work-item-in-jira/)，让它提交 Draft PR 供评审。 |

[Linear 的 Agent 委派设计](https://linear.app/developers/agents)区分人的 assignee 和 Agent 的 delegate。我会把这个责任边界沿用到 GitHub。维护者继续负责需求与验收，Worker 会话负责推进当前尝试。会话结束或重试后，负责人与待验收内容还留在需求卡上。

## 附录 B · 用自己的账号接入 Codex 托管评审

连接账号后，PR 上对 `@codex review` 的回应只能确认请求已收到。开启自动触发前，还需要看到一次完整的评审回执。

**先用一条真实 PR 的手动评审验证仓库权限和回执，再开启自动评审。**

1. 用有 Code Review 权限的 ChatGPT 账号打开 [Codex 的 Code Review 设置](https://chatgpt.com/settings/code-review)，连接 GitHub。GitHub 要求选择授权范围时，只选择目标仓库。配置自动评审需要对该仓库有写入或管理权限。
2. 在一条真实 PR 下留言 `@codex review`。看到 Codex 对评论作出反应后，继续等 PR 上出现由 Codex 发出的评审。反应表示收到了请求，评审回执才证明这次调用走完。
3. 按 [Codex 的 GitHub 评审指南](https://learn.chatgpt.com/docs/third-party/github)为目标仓库开启自动评审，并核对个人偏好的触发选项。仓库可在 `AGENTS.md` 的 **Code Review Rules** 段写下具体契约和容易漏掉的风险。

托管评审使用你授权的账号，可以在电脑关机时继续运行。需要在 CI 里控制提示词、模型或输出时，可用 [`openai/codex-action@v1`](https://learn.chatgpt.com/docs/github-action)运行 Codex，把 `OPENAI_API_KEY` 存为 Actions Secret，再用 `model` 参数选择该 API 项目可用的模型。

## 附录 C · 用 Actions 接入 Gemini、GLM、DeepSeek 和 Kimi

四种模型接到同一个 Actions 后，拿到模型 ID 或一条短响应只说明接入走通。要比较它们对 CI-02 这类变更的判断，还得让它们评同一个改动。

**比较评审模型时，固定同一 PR、提交和评审指令，记录响应与耗时，再由维护者复核每条发现。**

先用 [GitHub Actions Secrets](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets)为各服务保存凭据，服务地址和模型 ID 写在可信的 workflow 配置或仓库 Variables 里。评审任务根据预先定义的 provider 名称选用对应的地址、模型和 Secret。下表的模型 ID 是配置示例，运行前以账号可调用的模型为准。

| 模型 | 地址、模型 ID 与凭据 | 配置要点 |
| --- | --- | --- |
| **Gemini Pro** | 在 [Google AI Studio](https://aistudio.google.com/api-keys)创建项目密钥，存为 `GEMINI_API_KEY`。示例模型 `gemini-3.1-pro-preview`。 | 用 [Gemini CLI Action 的 PR 评审示例](https://github.com/google-github-actions/run-gemini-cli/blob/main/examples/workflows/pr-review/README.md)接入，通过 `gemini_model` 选模型。账号若能在 [Google Developer Program 福利页](https://me.developers.google.com/benefits)领取 Cloud 额度，先按[计费说明](https://developers.google.com/profile/help/faq?hl=en)核对 Gemini API 的抵扣条件。 |
| **智谱 GLM** | `https://open.bigmodel.cn/api/paas/v4/` · `glm-5.3` · `ZAI_API_KEY` | 用智谱开放平台的通用 API Key 调用[智谱的 OpenAI 兼容接口](https://docs.bigmodel.cn/cn/guide/develop/openai/introduction)。 |
| **DeepSeek** | `https://api.deepseek.com` · `deepseek-flash` 或 `deepseek-v4-pro` · `DEEPSEEK_API_KEY` | 按 [DeepSeek 的模型与地址表](https://api-docs.deepseek.com/quick_start/pricing/)确认模型 ID。复用 GLM 的 Chat Completions 调用，替换地址、模型和密钥。 |
| **Kimi 多模型网关** | 使用供应商给出的 OpenAI 兼容 Base URL · 模型 ID 取自目录 · `REVIEW_GATEWAY_API_KEY` | 多条路由可能指向同一模型系列。先调用 `/models`，复制所选 Kimi 路由的完整 ID，再向 `/chat/completions` 发一条短请求。核对最终正文是否非空，并记录实际返回的模型和耗时。 |

如果你已有多模型网关，把 Base URL（包含网关要求的版本路径，例如 `/v1`）放入 `REVIEW_BASE_URL`，把 Actions Secret 传给调用步骤的 `REVIEW_API_KEY`。下面的命令只列出模型 ID。

~~~bash
curl -fsS "$REVIEW_BASE_URL/models" \
  -H "Authorization: Bearer $REVIEW_API_KEY" |
  jq -r '.data[].id'
~~~

确认模型 ID 后，可以在同一步骤设置 `REVIEW_MODEL` 并发一条短请求。命令只输出最终正文。

~~~bash
jq -n --arg model "$REVIEW_MODEL" \
  '{model:$model,messages:[{role:"user",content:"Reply with OK."}],max_tokens:1024}' |
  curl -fsS --max-time 30 "$REVIEW_BASE_URL/chat/completions" \
    -H "Authorization: Bearer $REVIEW_API_KEY" \
    -H "Content-Type: application/json" --data-binary @- |
  jq -er '.choices[0].message.content | select(type == "string" and length > 0)'
~~~

先用 [GitHub Actions 的手动触发](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)选择 PR 编号和一个 provider。`workflow_dispatch` 要求 workflow 文件存在于默认分支。第一次只把结果写进运行摘要，注明 head SHA、服务实际返回的模型标识和是否超时，供下一轮对照。目录接口成功后，还要照上面的短请求验证生成能交付可读正文。

等单次验收通过，再决定哪个模型负责自动评审。评审任务只读取 PR diff 和基线分支的评审规范。需要自动回帖时，单独给发布步骤所需的 PR 写权限。[GitHub Actions 的安全指南](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions)解释了高权限作业执行不可信 PR 代码的风险。公开仓库应把这种代码执行与模型密钥隔开。WhyJ-Quant 的合入继续由 `CI required` 与 `PR policy` 执行确定性检查。

**一次试跑。** 我用 [WhyJ-Quant PR #1007](https://github.com/yangjingo/WhyJ-Quant/pull/1007)的 workflow diff 试跑 Kimi。前几次请求超时，成功的短请求返回模型 `kimi-k3`。它把「手动运行仅限 `main`」和「自动运行需要显式打开」都报成问题。我用[可选 Live Provider 的 CI 指南](https://github.com/yangjingo/WhyJ-Quant/blob/08f860beeb8d3a3b9bf0eae15b7c9ebcde75fdb5/docs/ci-release.md#optional-live-provider-evaluation)和需求复核后，把两条都记为误报。这个例子说明了怎样用项目契约复核一条评审意见，模型对比还需要更多固定样本。
