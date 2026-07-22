# 00 / Cover

## 异构推理：从部署范式到 Token 产业

不同厂商、代际、架构、计算阶段与资源层级，开始共享同一条 Token 生产链

Version: Synapse v6.1 | Author: Why.J | Date: 2026/07/21

---

# 01 / Context

## 现状分析：异构的单位正在从“卡”迁移到“角色”

- **趋势**: 推理论文从共置执行走向 PD/PDD、动态 PD、AFD 与算子级解耦；==可部署单元从整卡下沉到阶段、状态与算子==。
- **商业**: 创业公司分据资源控制、编译运行时、系统级协同和 Token 运营；多数“多芯支持”仍是纳管或副本路由。
- **开源**: HAMi、llm-d、Dynamo、vLLM、SGLang、Mooncake、NIXL 已拼出控制面与数据面；跨厂商状态契约仍是缺口。

::pulse [「 控制面已经能看见异构；数据面还在学习怎样承受异构。 」] ::

::image [./figures/figure-01-context-stack.png] [scale=90] ::

---

# 02 / Agenda

## 三条主线，判断异构推理到底走到了哪一步

- **趋势 / Paper**: PD、PDD、Phasor、PPD、AFD 与 Operator-level Disaggregation，各自解决什么新瓶颈？
- **商业 / Startup**: 公司卖的是卡池、运行时、单请求协同，还是可计费的 Token 产能？
- **技术 / Open Source**: 社区已经把哪些控制面、Connector、KV 与传输能力做成可组合模块？
- **落点 / Project**: 哪条路线可验证、可回退，并能逐步走向跨厂商异构？

::pulse [「 论文定义设计空间，创业公司寻找付费入口，开源社区决定可复制速度。 」] ::

---

# 03 / Trend

## 解耦演进：从“整机副本”到“算子角色”

- **2023–2024 / Co-location**: Continuous Batching 与 PagedAttention 提高单副本效率，但 Prefill 会干扰 Decode 的 TPOT。
- **2024–2025 / PD = PDD**: DistServe、Mooncake、P/D-Serve 把 Prefill 与 Decode 分到独立池；PD 与 PDD 是同一范式的常见写法。
- **2025–2026 / Adaptive PD**: semi-PD、PPD、Phasor 让“是否远程 Prefill、怎样扩缩 P/D”变成在线决策。
- **2026 / AFD 与 EPD**: Attention/FFN 与 Encode-Prefill-Decode 继续解耦，规划器开始面向算子、状态、硬件与 SLO 联合排布。

::pulse [「 每多拆一层，就多暴露一种硬件匹配机会，也多制造一次通信。 」] ::

::image [./figures/figure-03-trend-evolution.png] [scale=90] ::

---

# 04 / Trend

## PD / PDD：用阶段专用化换取 SLO 隔离

- **Prefill**: 输入并行度高、矩阵计算密集，主要影响 TTFT；适合计算吞吐/成本更优的资源池。
- **Decode**: 逐 Token、KV 常驻、带宽与容量敏感，主要影响 TPOT；适合 HBM 容量与带宽更强的资源池。
- **收益条件**: 模型足够大、输入足够长、P:D 配比合理，并且 Prefill 干扰是主要瓶颈。
- **隐藏成本**: KV 传输、排队、网络尾延迟、模型副本与故障恢复，可能把理论收益全部吃掉。

::pulse [「 PD 不是默认答案；只有阶段错配大于状态交接成本时才成立。 」] ::

::image [./figures/figure-04-pd-mechanism.png] [scale=90] ::

---

# 05 / Trend

## Phasor：PD 之后，瓶颈变成动态控制

- **静态分池问题**: 突发长 Prompt 会让 Prefill 队列堆积；Decode 又会因 KV 碎片或上游断粮进入假空闲。
- **P / D / M 三池**: Phasor 用 Prefill、Decode 与 Mixed 弹性池，把计算余量与内存余量投影为统一的 Virtual Freeness。
- **三种时间尺度**: 微秒级请求路由、毫秒级 KV 去碎片、秒级 P/D 池扩缩，组成闭环控制。
- **证据边界**: 论文基于 8×V100 与小模型验证调度收益；它证明动态 PD 控制，不等于跨厂商异构已生产化。

::pulse [「 注：用户给出的 Prassf 暂按最接近的公开系统 Phasor 校准。 」] ::

::image [./figures/figure-05-phasor-control.png] [scale=90] ::

---

# 06 / Trend

## AFD：把 Decode 再拆成 Attention 与 FFN

- **Attention / A**: KV 状态重、显存容量与带宽敏感；上下文增长使每步负载持续变化。
- **FFN / F**: 状态轻、GEMM 与 MoE Experts 计算密集；更适合聚合大 Batch 与计算性价比更高的设备。
- **新增代价**: A↔F 每层、每步传 Activation；通信频率远高于 PD 的一次 KV 交接，并引入严格同步。
- **核心结论**: A:F 资源比例、互连拓扑和 SLO 决定收益；错误配比会把独立扩展变成双方等待。

::pulse [「 AFD 的价值不是“拆得更细”，而是让带宽型与计算型资源分别定价。 」] ::

::image [./figures/figure-06-afd-loop.png] [scale=90] ::

---

# 07 / Trend

## 下一站：Fully / Operator-level Disaggregation

- **Frontier**: 用角色化 Cluster Worker 同时建模共置、PDD 与 AFD；在 16×H800 上报告平均吞吐误差低于 4%，并可推演 1K+ GPU。
- **HexGen-3**: 把异构资源规划、流水线切分与细粒度扩缩放到统一框架，代表 Fully Disaggregated 路线。
- **ODS / CAD**: 规划器输入模型、硬件画像、负载与 SLO，输出 Attention、FFN、KV、工具等算子角色的设备布局。
- **判断**: 设计空间已被论文打开；通用运行时、跨厂商通信与在线重规划仍是工程缺口。

::pulse [「 未来的部署文件不再写“8 张卡”，而会写“哪些角色需要什么资源”。 」] ::

::image [./figures/figure-07-operator-planner.png] [scale=90] ::

---

# 08 / Commercial

## 创业公司地图：四层能力、四种付费入口

- **资源控制**: 密瓜智能 Dynamia / HAMi、趋动 OrionX、TensorFusion —— 共享、隔离、远程 GPU 与池化。
- **编译运行时**: 中科加禾 XCoreSigma、清程极智 —— IR、算子转译、推理引擎与多后端性能工程。
- **系统级协同**: 无问芯穹、趋境科技 —— 单任务异构、异构 PD、KV 数据面与性能模型。
- **Token 运营**: 硅基流动、趋境、无问芯穹 —— Router、SLO、成本、扩缩容与 Token Factory。

::pulse [「 支持芯片数量是覆盖面；能否掌握请求状态才决定技术纵深。 」] ::

::image [./figures/figure-08-commercial-map.png] [scale=90] ::

---

# 09 / Commercial

## 资源与运行时：先解决“卡怎么管、模型怎么跑”

- **Dynamia / HAMi**: 多厂商设备注册、显存/算力切分、隔离与拓扑调度；资源控制面开源生态最清晰。
- **OrionX / TensorFusion**: 前者偏商业 GPU over IP，后者偏开源远程 GPU 与显存池化。
- **XCoreSigma / Chitu**: 面向统一推理入口、算子转译和国产芯片性能工程；需验证共享 IR 与统一状态深度。
- **边界**: 这些能力能把任务送到一张卡，却不天然解决同一请求的 KV 语义、跨运行时故障与数值一致性。

::pulse [「 卡池提供可用资源；Runtime 才开始定义可执行语义。 」] ::

::image [./figures/figure-09-control-runtime.png] [scale=90] ::

---

# 10 / Commercial

## 系统与 Token：把“单请求协同”变成“可售卖产能”

- **无问芯穹**: M×N 平台与 HETHUB 论文展示异构通信、性能预测和自动并行；训练证据不能直接等同于跨厂商推理成熟度。
- **趋境科技**: KTransformers 已有 CPU/GPU MoE 开源路径，商业路线进一步指向跨厂商 PD 与 Token 工厂。
- **硅基流动**: Token Factory 以统一 API、模型/成本路由和多芯片副本池先实现规模化运营。
- **证据梯度**: 论文、开源代码、客户案例、独立基准、长期生产数据必须分开计权。

::pulse [「 商业化先奖励副本路由；系统护城河最终要落到状态交接和稳定性。 」] ::

::image [./figures/figure-10-evidence-ladder.png] [scale=90] ::

---

# 11 / Open Source

## 社区开源栈：控制、调度、执行、传输开始解耦

- **Resource**: Kubernetes + HAMi 提供设备发现、共享、切分、配额与拓扑放置。
- **Serving Control**: llm-d / Dynamo 组合 Router、前缀感知、负载感知、P/D 编排与 Autoscaling。
- **Runtime**: vLLM / SGLang 承担 Scheduler、Paged KV、Batch、并行与后端适配。
- **Data Plane**: Mooncake / NIXL / LMCache 处理 KV 迁移、分层缓存与点对点传输。
- **Backend**: CUDA、ROCm、Ascend、TPU、XPU、Gaudi 等插件把硬件差异继续下沉。

::pulse [「 开源社区正在把推理系统拆成可替换的平面，而非一体化黑盒。 」] ::

::image [./figures/figure-11-open-stack.png] [scale=90] ::

---

# 12 / Open Source

## Connector 已经多样化，Canonical KV 仍未统一

- **SGLang**: PD 传输后端公开列出 Mooncake、NIXL、Ascend、MORI 等，证明 Connector 已成为独立扩展点。
- **NIXL**: 统一 CPU/GPU 内存与文件、块、对象存储的点对点传输抽象，并通过插件选择 UCX、Libfabric 等后端。
- **Mooncake**: 以 KVCache 为中心解耦 Prefill、Decode 与分布式缓存，强调复用与分层存储。
- **未解决**: Connector 能搬字节，不代表不同 Runtime 已统一 dtype、layout、block metadata、版本与错误语义。

::pulse [「 传输协议解决“怎么搬”；状态契约决定“搬过去还能不能继续算”。 」] ::

::image [./figures/figure-12-connector-gap.png] [scale=90] ::

---

# 13 / Open Source

## 成熟度：同构 PD 进入工程化，跨厂商 AFD 仍在前沿

- **L4 / Scale**: 多后端适配、设备切分、K8s 纳管、监控、配额与副本级路由，已有完整产品与社区证据。
- **L3 / Production Candidate**: 同架构 PD、前缀路由、分层 KV、NIXL/Mooncake Connector 与 xPyD 配比，已有部署指南与基准。
- **L2 / Early**: 跨厂商 PD、Canonical KV、非对称并行与统一失败语义，厂商案例多于可复现实验。
- **L1 / Research**: 跨厂商 AFD、算子级动态放置、在线重规划和端到端正确性，仍缺通用运行时。

::pulse [「 成熟度判断只看三件事：代码、独立基准、失败时怎样退。 」] ::

::image [./figures/figure-13-maturity.png] [scale=90] ::

---

# 14 / Project

## 项目主线：沿开源路径逐级增加异构深度

- **M1 / Replica**: 建立模型×芯片性能画像，用 SLO、成本和能耗完成副本级 Router 闭环。
- **M2 / Same-arch PD**: 基于 vLLM/SGLang + Mooncake/NIXL 打通 P/D，量化 KV、排队、网络与回退成本。
- **M3 / Cross-vendor PD**: 定义 Canonical KV Contract，加入版本协商、数值校验、重算与同构 fallback。
- **M4 / AFD / Operator**: 仅在 P99、goodput、cost/token 证明净收益后，才下探 Attention/FFN 与算子级规划。

::pulse [「 第一个真正的异构里程碑：请求能跨池交接，也能在失败时完整退回。 」] ::

::image [./figures/figure-14-roadmap.png] [scale=90] ::

---

# 15 / Takeaways

## Take A Ways

- **趋势**: PD/PDD 已成主流解耦范式；Phasor、PPD 解决动态控制；AFD/ODS 把异构推进到算子角色。
- **商业**: 资源池化与副本路由已经形成产品，单请求跨厂商协同仍主要依赖公司披露与局部证据。
- **开源**: HAMi + llm-d/Dynamo + vLLM/SGLang + Mooncake/NIXL 已形成可组合路径，但缺统一状态与失败契约。

::pulse [「 研发顺序：先可观测、再可交接、最后才值得拆得更细。 」] [fragment] ::

---

# 16 / Reference

## Reference / 趋势与架构分类

- **PD（Prefill-Decode Disaggregation）**：7 项。
- **AFD（Attention-FFN Disaggregation）**：3 项。
- **EPD（Encode-Prefill-Decode）**：6 项。

---

# 17 / Reference

## Reference / PD（PDD）

- **DistServe: Disaggregating Prefill and Decoding** - https://www.usenix.org/conference/osdi24/presentation/zhong-yinmin
- **SplitWise: Efficient Generative LLM Inference Using Phase Splitting** - https://arxiv.org/abs/2311.18677
- **Mooncake: A KVCache-centric Disaggregated Architecture** - https://arxiv.org/abs/2407.00079
- **PrfaaS: Prefill-as-a-Service** - https://arxiv.org/abs/2604.15039
- **PDD（Cross-Datacenter Prefill-Decode Disaggregation）** - https://github.com/infinigence/pdd
- **TaiChi: Prefill-Decode Aggregation or Disaggregation?** - https://arxiv.org/abs/2508.01989
- **PPD: Not All Prefills Are Equal** - https://arxiv.org/abs/2603.13358

---

# 18 / Reference

## Reference / AFD（Attention-FFN Disaggregation）

- **Theoretical Provisioning for Attention-FFN Disaggregated LLM Serving** - https://arxiv.org/abs/2601.21351
- **How Far Can Disaggregation Go?** - https://arxiv.org/abs/2605.28302
- **vLLM RFC: ATTN-FFN Disaggregation** - https://github.com/vllm-project/vllm/issues/22799
- **vLLM Feature: AFD basic implementation** - https://github.com/vllm-project/vllm/pull/29772
- **Step-3（AFD）说明文档 / 实践系统** - https://arxiv.org/abs/2507.19427

---

# 19 / Reference

## Reference / EPD（Encode-Prefill-Decode）

- **HydraInfer: Hybrid Disaggregated Scheduling** - https://arxiv.org/abs/2505.12658
- **SpaceServe: Spatial Multiplexing of Complementary Encoders and Decoders for Multimodal LLMs** - https://papers.neurips.cc/paper_files/paper/2025/hash/720e7ebc49c84252abc0754dddf80976-Abstract-Conference.html
- **EPDServe: Efficiently Serving Large Multimodal Models Using EPD Disaggregation** - https://arxiv.org/abs/2501.05460
- **EPDServe Repo** - https://github.com/vbdi/epdserve
- **SGLang EPD Disaggregation** - https://docs.sglang.io/advanced_features/epd_disaggregation.html
- **vLLM EPD Disaggregation** - https://docs.vllm.ai/projects/ascend/en/latest/user_guide/feature_guide/epd_disaggregation.html
- **vLLM PR: Encoder separation for EPD** - https://github.com/vllm-project/vllm/pull/21740
- **Ascend EPD-Serve** - https://arxiv.org/abs/2601.11590

---

# 20 / Reference

## Reference / 商业与开源技术

- **HAMi / CNCF Incubating** - https://www.cncf.io/blog/2026/07/15/hami-becomes-a-cncf-incubating-project/
- **llm-d P/D Disaggregation Guide** - https://github.com/llm-d/llm-d/tree/main/guides/pd-disaggregation
- **NVIDIA Dynamo Disaggregated Serving** - https://docs.nvidia.com/dynamo/latest/user-guides/disaggregated-serving
- **vLLM KV Connectors** - https://docs.vllm.ai/en/latest/features/disagg_prefill/
- **SGLang PD Disaggregation** - https://docs.sglang.ai/advanced_features/pd_disaggregation.html
- **Mooncake Project** - https://github.com/kvcache-ai/Mooncake
- **NIXL** - https://github.com/ai-dynamo/nixl
- **无问芯穹 / HETHUB** - https://arxiv.org/abs/2405.16256
- **中科加禾 XCoreSigma** - https://xcoresigma.com/
- **密瓜智能 Dynamia** - https://dynamia.ai/products
- **清程极智 Chitu** - https://github.com/thu-pacman/chitu
- **硅基流动 Token Factory** - https://www.siliconflow.cn/token-factory
