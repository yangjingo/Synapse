
# Metadata
Category: 异构推理
Date/Author: 2026/07/21 · yangjing
Page title: 异构推理：从部署范式到 Token 产业

# TITLE
异构推理：从部署范式到 Token 产业

## LEAD
2026 年的 LLM 推理，已经不是“有没有卡”这么简单。更核心的是：一个请求能否在不同厂商、不同架构、不同阶段之间稳定迁移？同一条 token 流是否能跨系统拆成更细粒度、可管控的执行。本文把公开论文（PD/PDD、AFD、EPD）和创业公司、开源生态放进同一条链路里看：趋势到底到了哪里，谁在做真的工程能力，谁还在“卡兼容”的早期阶段。

## SECTIONS

### Section 1: 先说“异构”到底指什么
Type: text
Body: 这次讨论里，异构不是“多几个芯片品牌共存”这么表面。更重要的是：不同厂商、不同代际、不同架构、不同计算阶段与不同资源层级之间的协同是否成立。  

如果一切都是单一算子、单一卡、单一阶段，那它只是跨厂商支持问题；真正的异构推理是把请求从“角色”角度拆开：谁负责 Prefill，谁负责 Decode，谁负责 KV 传输，谁承担状态恢复与失败兜底。  

这条路线有三条并行线：  
- **趋势线**：论文把部署方式往阶段化、算子化、状态化推；  
- **商业线**：公司在资源控制、编译运行时、Token 运营上各做不同入口；  
- **开源线**：社区在控制面、Connector、KV 与传输上可组合化，开始给工程系统可复用的拼装单元。

### Section 2: 这次把方向定在“工程上可执行”
Type: text
Body: 要把异构从口号变成可执行能力，核心不是“支持更多芯片”，而是回答四个更难问题：  

- **控制面到运行时**：资源层能不能先把硬件纳管起来；  
- **阶段能力分工**：Prefill、Decode（以及未来的 E）能否稳定拆分；  
- **状态契约**：跨阶段/跨芯片交接时 KV、dtype、失败语义是否一致；  
- **成本与 SLO**：不是只要跑得通，而是要在成本、延迟、吞吐和稳定性之间可优化。  

下面的 14 张图把这条线走完：先从趋势，再到商业，再到开源，最后回到我自己的项目落地。  

### Section 3: 图 01 — 六层异构栈，不是“单层同构”叠加
Type: figure
Image: ./figures/figure-01-context-stack.png
Caption: Figure 1: 异构并发能力从“上下文栈”看，不再只看设备，而是看业务、集群、编排、推理、算子、资源六层的协同深度。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Create an Excalidraw hand-drawn style whitepaper with six stacked layers. Top layer labels "业务与 Token 运营", below are "跨集群协同", "跨芯片执行", "推理与训练", "编译器与算子", "资源虚拟化". Show arrows from business down to compute resources and feedback loops from runtime to management layer. Minimal sketch look, thin black lines, sparse labels.

### Section 4: 趋势演进：从整卡同构走到阶段+角色协同
Type: figure
Image: ./figures/figure-03-trend-evolution.png
Caption: Figure 2: 趋势主线从“共置副本”走到 PD / PDD，再到自适应 PD 与 AFD/ODS 的阶段化演进。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Draw a simple timeline diagram in hand-drawn infographic style. X axis: 2023-2024, 2024-2025, 2025-2026, 2026. Nodes: Co-location, PD/PDD separation, semi-PD and PPD adaptive control, AFD and EPD. Add arrows showing communication tradeoff increases with deeper disaggregation.

### Section 5: PD/PDD：好处与代价在“交接成本”这一端交界
Type: figure
Image: ./figures/figure-04-pd-mechanism.png
Caption: Figure 3: PD/PDD 把 Prefill 和 Decode 角色分开：对 TTFT/TPOT 有直接优化空间，但会引入 KV 传输、队列、网络和故障恢复成本。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Draw two-stage architecture with Prefill side and Decode side. Show token flow, KV handoff, routing pressure, and failure fallback path. Label TTFT and TPOT, with explicit “benefit vs cost” callouts in simple hand-drawn style.

### Section 6: Phasor：当 PD 静态失败，动态控制会补缺口
Type: figure
Image: ./figures/figure-05-phasor-control.png
Caption: Figure 4: Phasor 把 Prefill/Decode/Mixed 分离到三个池子，并按秒级/毫秒级/微秒级做滚动控制，目标是减少排队抖动和碎片化损失。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Draw a three-pool control loop with P/D/M queues and feedback arrows. Emphasize multi-time-scale control: microseconds scheduling, milliseconds defragmentation, seconds scaling.

### Section 7: AFD：Attention 与 FFN 的角色化拆分
Type: figure
Image: ./figures/figure-06-afd-loop.png
Caption: Figure 5: AFD 把 attention 与 FFN 角色分离：在合适负载下可让带宽型与计算型任务走不同硬件或实例，但每层激活通信会成为瓶颈源。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Draw Attention-FFN split in one transformer layer with two branches and a synchronization edge. Add text: bandwidth-sensitive, compute-sensitive, token-level exchange cost. Hand-drawn black/white diagram, minimal.

### Section 8: Operator-level 方向：工程上“谁做什么算子”才是下阶段
Type: figure
Image: ./figures/figure-07-operator-planner.png
Caption: Figure 6: Fully / Operator-level Disaggregation 把同构 PD 与异构 AFD 并列，形成按算子、按设备特征做自动映射的规划器问题。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Draw a planner view with roles: Scheduler, Token classifier, Operator pools, KV/Activation cache, and multiple device classes. Show one request split into operator tasks.

### Section 9: 公司图谱：从资源控制到 Token 运营，能力边界先画清楚
Type: figure
Image: ./figures/figure-08-commercial-map.png
Caption: Figure 7: 创业公司按四类能力分层，资源控制面、编译运行时、系统级协同、Token 运营形成不同入口。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Draw quadrant map with axes or four boxes: Resource Control, Runtime/Compiler, System-level Cooperation, Token Operations. Place representative company labels and connection arrows.

### Section 10: 运行时边界 — 资源控制能否变成模型可执行语义
Type: figure
Image: ./figures/figure-09-control-runtime.png
Caption: Figure 8: 硬件纳管和运行时不一样。前者把设备变成池子，后者决定请求在不同阶段被如何执行。跨层语义是工程难点。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Draw two-layer split diagram: "任务调度/资源切分" and "Runtime / stateful execution". Show request path across CPU + GPU + ASIC nodes with mismatch gap.

### Section 11: Token 运营：单请求协同到“Token 可售”需要证据分级
Type: figure
Image: ./figures/figure-10-evidence-ladder.png
Caption: Figure 9: 从论文、代码到生产指标的证据链必须分层，不能把“披露”误当“可复现实证”。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Draw a ladder chart with levels: 论文/演示, 开源/工程验证, 客户/案例, 长期生产SLA. Show confidence rising with level.

### Section 12: 开源堆栈：控制层与数据层正在解耦
Type: figure
Image: ./figures/figure-11-open-stack.png
Caption: Figure 10: 开源生态逐步把资源层、运行层、Connector 和后端分离，正在形成可组合的推理系统栈。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Draw open-source modular stack: Resource (K8s), Serving control, Runtime, Connectors (Mooncake/NIXL/LMCache), Backend plugins. Flat labels and clean sketch style.

### Section 13: Connector 缺口：协议统一仍在前列，尚未解决全链路契约
Type: figure
Image: ./figures/figure-12-connector-gap.png
Caption: Figure 11: Connector 能搬数据，但跨架构的 canonical KV/状态契约、dtype、故障语义、版本兼容仍未完全统一。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Draw a connector layer with “supported” and “unresolved” zones. Show protocol boxes: layout, dtype, version, recovery semantics. Keep it plain and direct.

### Section 14: 成熟度与我的项目路线
Type: figure
Image: ./figures/figure-13-maturity.png
Caption: Figure 12: 不同公司能力可分为 L4（生产工程化）到 L1（研究前沿），我关注的是“单请求跨池交接是否可回退”。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Draw four-level maturity ladder L4 to L1 with brief labels: production-ready, candidate, early research, experimental. Emphasize fallback and failure semantics.

### Section 15: 研发路线图：从副本路由到 AFD/Operator-level
Type: figure
Image: ./figures/figure-14-roadmap.png
Caption: Figure 13: 我自己的最小可行路线是 M1 副本路由，M2 同架构 PD，M3 跨厂商 PD，M4 AFD + 算子级分布，先在失败处理和回退上闭环。
Prompt: Use strict Excalidraw-style engineering diagram constraints: white paper background, rough hand-drawn black ink, thin strokes, sparse labels, single accent #D97757, no gradients, no shadows, no 3D, no decorative elements, no emoji. Draw roadmap with four milestones M1-M4 and gate conditions (routing, p99, cost/token, failover, operator planning). Clean hand-drawn diagram.

### Section 16: 结论：不是“多支持”，而是“能否交接”
Type: text
Body: 我想要的不是支持更多后端型号清单；而是请求级别的可移交性。  

从趋势上看，PD/PDD 已成主流，AFD/Operator-level 是下一代方向。商业上，资源控制和 Token 运营是最近最有流量入口的部分；开源上，HAMi、Dynamo、vLLM、SGLang、Mooncake、NIXL、llm-d 已经给了足够多可组合组件。  

真正决定胜负的，不是你是否“兼容”多少厂商，而是你是否能交给系统一个明确契约：状态怎么搬、失败怎么收、成本如何回退、SLO 怎么在不同阶段保证。  

### Section 17: 参考（趋势与架构分类）
Type: reference
- **PD（Prefill-Decode Disaggregation）**：7 项（DistServe、SplitWise、Mooncake、PrfaaS、PDD、TaiChi、PPD）
- **AFD（Attention-FFN Disaggregation）**：3 项（Theoretical Provisioning、How Far Can Disaggregation Go、vLLM AFD）
- **EPD（Encode-Prefill-Decode）**：6 项（HydraInfer、SpaceServe、EPDServe、SGLang EPD、vLLM EPD、Ascend EPD-Serve）

### Section 18: 参考（PD / PDD）
Type: reference
- **DistServe: Disaggregating Prefill and Decoding for Goodput-optimized Large Language Model Serving**（OSDI 2024，Zhong et al.） - https://www.usenix.org/conference/osdi24/presentation/zhong-yinmin
- **SplitWise: Efficient Generative LLM Inference Using Phase Splitting** - https://arxiv.org/abs/2311.18677
- **Mooncake: A KVCache-centric Disaggregated Architecture for LLM Serving**（FAST 2025 Best Paper） - https://arxiv.org/abs/2407.00079
- **PrfaaS: Prefill-as-a-Service: KVCache of Next-Generation Models Could Go Cross-Datacenter** - https://arxiv.org/abs/2604.15039
- **PDD: Unleashing Economical and Flexible Heterogeneous LLM Inference via Cross-Datacenter Prefill-Decode Disaggregation**（InfiniGence GitHub） - https://github.com/infinigence/pdd
- **TaiChi: Prefill-Decode Aggregation or Disaggregation? Unifying Both for Goodput-Optimized LLM Serving** - https://arxiv.org/abs/2508.01989
- **PPD: Not All Prefills Are Equal: PPD Disaggregation for Multi-turn LLM Serving** - https://arxiv.org/abs/2603.13358

### Section 19: 参考（AFD）
Type: reference
- **Analytical Provisioning for Attention-FFN Disaggregated LLM Serving under Stochastic Workloads** - https://arxiv.org/abs/2601.21351
- **How Far Can Disaggregation Go? A Design-Space Exploration of Attention–FFN Disaggregation for Efficient MoE LLM Serving** - https://arxiv.org/abs/2605.28302
- **vLLM RFC: ATTN-FFN Disaggregation for MoE Models (#22799)** - https://github.com/vllm-project/vllm/issues/22799
- **vLLM Feature: AFD basic implementation (#29772)** - https://github.com/vllm-project/vllm/pull/29772
- **Step-3（AFD）说明文档 / 实践系统** - https://arxiv.org/abs/2507.19427

### Section 20: 参考（EPD + 商业与开源）
Type: reference
- **HydraInfer: Hybrid Disaggregated Scheduling for Multimodal Large Language Model Serving** - https://arxiv.org/abs/2505.12658
- **SpaceServe: Spatial Multiplexing of Complementary Encoders and Decoders for Multimodal LLMs** - https://papers.neurips.cc/paper/2025/hash/720e7ebc49c84252abc0754dddf80976-Abstract-Conference.html
- **EPDServe: Efficiently Serving Large Multimodal Models Using EPD Disaggregation** - https://arxiv.org/abs/2501.05460
- **EPDServe Repo** - https://github.com/vbdi/epdserve
- **SGLang EPD Disaggregation** - https://docs.sglang.io/advanced_features/epd_disaggregation.html
- **vLLM EPD Disaggregation** - https://docs.vllm.ai/en/latest/user_guide/feature_guide/epd_disaggregation.html
- **vLLM PR: Encoder separation for EPD** - https://github.com/vllm-project/vllm/pull/21740
- **Ascend EPD-Serve** - https://arxiv.org/abs/2601.11590
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

### Section 21: Takeaways
Type: text
Body: 三件事先记住：  

第一，异构推理现在最少能形成三层产能：同架构副本路由、PD/PDD 阶段解耦、AFD/Operator-level 深入拆分。  

第二，控制面先行（资源和运行时）仍是产业主线，但单请求跨厂商协同的关键在于状态契约与失败语义。  

第三，开源和商业不是两条平行路：开源先给了组件和接口，商业再把它们打磨成可交易 Token 产能。  

我现在会优先做的是：先把路由、回退和状态交接做稳，再逐步放大到 AFD。  

## PULSE
“卡上了，说明你会分配；交接对了，说明你会系统性推理。”

