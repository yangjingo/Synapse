# Metadata
Category: DeepSeek-V4 推理
Date/Author: 2026/05/07 · yangjing
Page title: DeepSeek-V4 昇腾 NPU 推理优化实践

# TITLE
DSV4 上昇腾不是移植，是重新设计算子、并行和量化的三重匹配

## LEAD
华为昇腾团队 0 Day 支持了 DSV4 的推理部署，适配 Atlas A3 和 950PR/DT 两代芯片，提供 1M 序列推理能力。核心挑战不在模型有多大——而在 DSV4 的混合注意力 + mHC + MoE 三重叠加，要求从零设计融合 kernel、并行策略和量化方案。这篇文章拆解了整个工程决策链。

## SECTIONS

### Section 1: 问题定义：三种新结构同时出现，kernel 不是改参数能跑的
Type: text
Body: DSV4 相比 V3.2 改了三个东西同时出现在一个 Layer 里：MQA 取代了 MLA（不再区分 prefill/decode 的 absorb 路径），Window/Sparse/Compress 三种 Attention 按层交织，mHC 把残差从一路扩展到多路。每一个单独拿出来都能写一篇优化文档，三个叠在一起意味着你没法复用上一代的 kernel 设计，得从数据流开始重新想。

### Section 1a: DSV4 模型结构
Type: figure
Image: ./figures/fig-01-dsv4-architecture.png
Caption: Figure 1: DSV4 每个 Layer 包含 mHC + Attention(SWA/CSA/HCA) + MoE，三种 Attention 按层交织而非并列——不同距离的上下文走不同压缩路径。
Prompt: DSV4 model architecture showing per-layer structure with mHC multi-path residual, hybrid attention (SWA near field / CSA mid field compress+select / HCA far field heavy compression), and MoE expert routing.

### Section 1b: mHC 多路残差结构
Type: figure
Image: ./figures/fig-02-mhc-structure.png
Caption: Figure 2: mHC 把 hidden_state 从一路扩展到多路，Pre Mapping 融合回一路做 Attention/MoE 计算，Post Mapping 再展开——残差稳定性从训练技巧变成架构基础设施。
Prompt: mHC (Manifold-Constrained Hyper-Connections) structure showing Pre Mapping, Post Mapping, Res Mapping flows with multi-path residual connections.

### Section 1c: Attention 稀疏与压缩——按层分配不同压缩策略
Type: text
Body: DSV4 的 Attention 在不同层用了不同的压缩策略：前两层用 SWA（sliding_window=128），只保留最近 128 个 KV，计算量和内存都低；Pro 版本前两层直接用 HCA 做 128 倍压缩。后续层交替使用 CSA（4 倍压缩 + LI 稀疏选 Top 512 KV）和 HCA（128 倍压缩）。MQA 取代了 MLA，不再区分 prefill/decode 的 absorb 路径，同时引入 attention_sink 参数。这套组合的效果是：128K 序列在 HCA 层压缩后只保留 1K KV，CSA 层保留 32K KV，内存压力显著下降。

### Section 1d: MoE 专家规格与 KV Cache 内存
Type: text
Body: MoE 部分两个规格：285B 模型 256 个路由专家 + 1 个共享专家，单 Token 激活 6 个路由专家；1.6T 模型 384 个路由专家 + 1 个共享专家，单 Token 激活 6 个。前 3 层用 hash routing，后 40 层用可学习的 soft routing。KV Cache 内存方面，SWA 只保留 sliding_window 大小；压缩层存储压缩后 KV，未满足压缩长度的 kv_state 和 score_state 保存在 remainder 中；CSA 层 LI 也做了 4 倍压缩的 Indexer Cache。综合来看，128K 序列在 HCA 后仅保留 1K KV，CSA 后保留 32K KV，长序列内存压力大幅缓解。

### Section 2: 融合算子不是优化，是唯一能跑的路径
Type: text
Body: 列一下需要重新设计的算子清单：SAS (SparseAttnSharedKV) 统一处理 SWA/CSA/HCA 三种 attention 计算；Compressor 包含 KV/Gate 的 Linear 计算和 kv_state/score_state 更新，选取对应数据计算压缩 KV；KvCompressEpilog 对压缩 KV 做量化、拼接 Scale、刷新到 KV Cache；IndexerCompressEpilog 处理 Indexer Cache 的量化和刷新；LightningIndexer 在压缩后的 cache 上做 score_batchmatmul + relu + reduce_sum + topk，长序列场景 topk 成为瓶颈时用流水计算掩盖其他操作耗时；HCPre 和 HCPost 处理 mHC 的前后映射，其中 hc_pre 提供 Ascend C 和 PyPTO 两种实现。这些东西不是锦上添花——DSV4 的新结构如果没有这些融合算子，在 NPU 上根本跑不起来。
Callout: SAS 统一了三种 attention 计算接口，Compressor 和 Epilog 处理 KV cache 的实时压缩和刷新。不是可选拓扑，是必选路径。

### Section 2a: Attention 融合算子结构
Type: figure
Image: ./figures/fig-03-attn-fused-kernels.png
Caption: Figure 3: Attention 融合算子全景——Compressor 做 KV 线性投影+压缩，KvCompressEpilog 做量化+刷新，LightningIndexer 做 topk 选择，SAS 统一执行 SWA/CSA/HCA 计算。
Prompt: Attention fused kernel architecture showing Compressor, KvCompressEpilog, IndexerCompressEpilog, LightningIndexer, and SparseAttentionSharedKV data flow.

### Section 2b: mHC 融合算子融合范围
Type: figure
Image: ./figures/fig-04-mhc-fused-kernels.png
Caption: Figure 4: HC_Pre 融合了 Pre Mapping 前的多路投影计算，HC_Post 融合了后向映射——融合范围覆盖 mHC 的前后处理全流程，hc_pre 提供 Ascend C 和 PyPTO 两种实现版本。
Prompt: mHC fused kernel scope showing HC_Pre and HC_Post fusion boundaries with Pre Mapping, Post Mapping, and Res Mapping operations.

### Section 3: Prefill 并行：CP 分摊长序列 + all_gather 跨卡同步
Type: text
Body: Prefill 阶段的内存占用和 TTFT 是主要瓶颈。attention 部分采用 Context Parallel (CP)，多 Rank 分摊计算和访存。因为 LI 用 causal_mask，越靠后的 Chunk 计算量越大，所以用 zig_zag 切分——把首尾序列块放在同一 Rank 上，让各卡负载均衡。切分时还要考虑 SWA/HCA/CSA 的边界：SWA 层每个 Chunk 需要前序 128 个 KV；HCA 层通过 128 对齐避免跨 Rank 传递额外 token；CSA 层需要 4 个 Overlap token。全局 all_gather 通信让每个 Rank 获取所有 Rank 最后的 128 个 Token，再按 receive_idx 裁切。

### Section 3a: zig_zag 切分
Type: figure
Image: ./figures/fig-05-prefill-cp-zigzag.png
Caption: Figure 5: zig_zag 切分将首尾序列块放在同一 Rank 上——LI 的 causal_mask 导致靠后的 Chunk 计算量更大，首尾配对让各卡负载均衡。
Prompt: Prefill Context Parallel zig_zag partitioning showing chunk distribution across ranks with causal mask load balancing.

### Section 3b: Prefill all_gather 通信
Type: figure
Image: ./figures/fig-06-prefill-allgather.png
Caption: Figure 6: 全局 all_gather 让每个 Rank 获取所有 Rank 最后 128 个 Token，通过 receive_idx 裁切出各 Chunk 所需数据——首个 Chunk 不需要额外 Token。
Prompt: Prefill all_gather communication showing each rank gathering last 128 tokens from all ranks, with receive_idx trimming for each chunk.

### Section 3c: CSA Prefill 通信方案
Type: text
Body: Attention 模块引入 2 次通信：MQA 起始做一次 128 大小 hidden_states 的通信（MLAProlog 有少量冗余计算，但实现简洁）；Compressor 计算后，对 Compress Cache 做 CP 域 all_gather 获取完整压缩 Cache，用于 LI 和 SAS 计算，zig_zag 场景还需要顺序重排。CSA 有两种实现：单路径方案一次性获取 SWA 和 Compressor 需要的数据，Compressor 后再做 all_gather；双路径方案把 Window Attention 和 Compressor 的数据分别通信，实现计算通信掩盖，冗余数据更少，两个 Compressor 也能并行。

### Section 3d: CSA 单路径通信
Type: figure
Image: ./figures/fig-07-csa-prefill-single-comm.png
Caption: Figure 7: CSA 单路径方案——一次通信获取 SWA 和 Compressor 数据，Compressor 后对 Compressed Cache 做 CP 域 all_gather。
Prompt: CSA Prefill single-path communication showing unified data fetch and compressed cache all_gather.

### Section 3e: CSA 双路径并行通信
Type: figure
Image: ./figures/fig-08-csa-prefill-dual-comm.png
Caption: Figure 8: CSA 双路径方案——Window Attention 和 Compressor 数据分别通信，两个 Compressor 并行，实现计算通信完全掩盖。
Prompt: CSA Prefill dual-path parallel communication showing separate Window Attention and Compressor data fetch with compute-communication overlap.

### Section 4: Decode 并行：DP + EP + TP 三级并行
Type: text
Body: Decode 阶段沿用 DeepSeek-R1 和 V3.2 的并行方案：Attention 用 DP，MoE 用 EP，LM_head 用 TP。一个额外的优化点是 o_a_proj——这个权重较大，访存耗时长，在低时延场景可以选 TP 切分，让多 Rank 并行分担访存，通过 all_to_all 和 reduce_scatter 做 DP/TP 域转换。950DT 用 8/16 卡获取极低单用户时延，Atlas A3 用 64 卡大 EP 获取高吞吐。

### Section 4a: Decode o_a_proj TP 切分
Type: figure
Image: ./figures/fig-09-decode-oaproj-tp.png
Caption: Figure 9: Decode 阶段 o_a_proj 访存耗时长，通过 TP 切分让多 Rank 并行分担，all_to_all + reduce_scatter 做 DP/TP 域转换。
Prompt: Decode parallel strategy showing DP for attention, EP for MoE, TP for LM_head, with optional o_a_proj TP splitting and communication primitives.

### Section 5: MTP 在混合 Attention 下的适配——Ring Buffer 和梯形掩码
Type: text
Body: MTP 机制允许一次推理同时验证多个 draft token，降低单 token 推理耗时。但 DSV4 的混合 attention 让这件事变复杂了。先说 Cache 设计：Window KV 和 Compressor 的 kv_state/score_state 用 Ring Buffer 管理，通过 block_table 与 slot_mapping 实现少数几块 Cache 的内存复用，其余 KV Cache 按压缩后最大长度申请。相比传统每次重新申请，Ring Buffer 把内存管理变成了 O(1) 操作。再说 MTP 适配：梯形掩码要确保 draft token 的压缩 cache 不参与主模型 token 的计算；如果 draft 被拒绝需要回滚，Compressor 的 kv_state/score_state 需要额外缓存。结合 Ring Buffer 设计，只需提前申请更大的 Buffer 就能自然实现缓存。缓存大小以 compress_ratio 个 Token 为一组统计，overlap 在 CSA 等于 1，HCA 等于 0。Spec Model 方面，MTP 小模型只使用 SWA，next_n 个 Draft Token 共享一份 MTP 权重和 KV Cache。性能方面，高吞吐场景用 MTP1（计算密度大，多 draft 容易触顶），低时延场景用 MTP3（计算密度小，有更多空间投机）。

### Section 5a: Ring Buffer vs 传统 Cache
Type: figure
Image: ./figures/fig-10-mtp-ring-buffer.png
Caption: Figure 10: Ring Buffer 通过 block_table + slot_mapping 实现少数几块 Cache 内存复用——相比传统方案每次重新申请，内存管理变成 O(1) 操作。
Prompt: Ring Buffer vs traditional cache management comparison showing block_table and slot_mapping based memory reuse for Window KV and Compressor kv_state/score_state.

### Section 5b: MTP 梯形掩码与缓存策略
Type: figure
Image: ./figures/fig-11-mtp-triangular-mask.png
Caption: Figure 11: MTP 场景下梯形掩码隔离 draft token 的压缩 Cache——左侧是 kv_state/score_state 缓存范围，右侧是 Indexer/Attention 使用的梯形掩码边界。
Prompt: MTP triangular mask diagram showing kv_state/score_state caching range on left and Indexer/Attention mask boundary on right for draft token isolation.

### Section 6: 量化：同一模型，两种芯片，两套完全不同的方案
Type: text
Body: Atlas A3 走 W8A8C16 (Int8) 量化：MLAProlog 里 q_b_proj 用 W8A8，其余 Linear 不量化，KV Cache 维持 C16；IndexerProlog 里 q_b_proj 用 W8A8，indexer_q 用 A8，Indexer Cache 用 C8；LI 的 batch_matmul 用 Int8；MLAEpilog 里 o_b_proj 用 W8A8，o_a_proj 不量化；MoE 路由和共享专家的 Linear 都用 W8A8；LMHead 不量化。只对参数量大的 Linear 做量化是出于性能考虑。950DT 走原生 Hybrid FP8-MXFP4：MLAProlog 里 q_a_proj、q_b_proj、kv_proj 都用 W8A8(MXFP8)，KV Cache 用 C8 伪量化（存 8 算 16）；MoE 路由专家的 Linear 用 W4A8(MXFP4)，共享专家用 W8A8(MXFP8)；LMHead 不量化。C8 KV Cache 在超长序列下内存优化 2 倍。还可以用 MXFP8 替代原生 FP8，在高吞吐场景进一步提升算力利用率。两套方案的选择不是拍脑袋——是根据芯片的算力结构和精度特性做的针对性匹配。
Callout: A3 的 Int8 量化只对参数量大的 Linear 做 W8A8，KV Cache 维持 BF16；950DT 的 MXFP8 对 MoE 路由专家用 W4A8，共享专家用 W8A8。同一个模型，两种芯片，两套量化方案。

### Section 6a: Int8 量化策略 (Atlas A3)
Type: figure
Image: ./figures/fig-12-int8-quantization.png
Caption: Figure 12: Atlas A3 的 W8A8C16 量化——只对 q_b_proj、o_b_proj 做 Int8，KV Cache 维持 BF16，LI 用 A8C8 降低计算时延。
Prompt: Int8 W8A8C16 quantization strategy table for Atlas A3 showing per-module quantization config: MLAProlog, IndexerProlog, LightningIndexer, Compressor, MLAEpilog, MoE, LMHead.

### Section 6b: Hybrid MXFP8-MXFP4 量化策略 (950DT)
Type: figure
Image: ./figures/fig-13-mxfp8-quantization.png
Caption: Figure 13: 950DT 的 Hybrid MXFP8-MXFP4——MoE 路由专家用 W4A8，共享专家用 W8A8，KV Cache 用动态 Per-Group-64 FP8 存 8 算 16。
Prompt: Hybrid MXFP8-MXFP4 quantization strategy table for 950PR/DT showing per-module quantization config with FP8 and MXFP4 details.

### Section 7: 多流并行：算子粒度够细，才能控核
Type: text
Body: 多流并行的前提是算子粒度足够细，能精确分配到 Cube 和 Vector 核上。在 MLAProlog 里，Query 的 kv_proj 和 q_b_proj 跑 Cube 核，q_rms_norm 跑 Vector 核，天然并行。CSA 时 LI 和 Compressor 无数据依赖，通过 CV 控核确保不抢计算资源，可以把 Compressor 的耗时完全掩盖。HCA 没有 LI，直接用 MLAProlog 计算掩盖部分 Compressor。MoE 模块里共享专家和路由专家也存在计算与通信的并行机会，Int8 和 MXFP8 两种量化场景都实现了专家多流并行。还有一个容易被忽略的优化：AICPU Scheduler 算子。Attention 和 LI 依赖实际上下文长度计算分核策略，如果放在算子执行时做会增加延迟。AICPU Scheduler 在算子执行前就计算出 Tiling 信息，整网单轮推理中每个 SAS/LI 的 Scheduler 只执行一次，Tiling 在不同层间复用。这样 Tiling 计算就能和 Embedding 及 MLAProlog 并行执行，有效掩盖 Tiling 耗时。关键不是能不能并行，而是你的算子拆得够不够细。

### Section 7a: Attention 多流并行时序
Type: figure
Image: ./figures/fig-14-attn-multistream.png
Caption: Figure 14: CSA 场景多流并行时序——Cube 核跑 Matmul，Vector 核跑 Norm，LI 与 Compressor 通过 CV 控核并行，完全掩盖 Compressor 耗时。
Prompt: Attention multi-stream parallel timeline showing Cube/Vector core allocation for MLAProlog, LightningIndexer, and Compressor with compute-communication overlap.

### Section 7b: MoE 共享路由多流并行
Type: figure
Image: ./figures/fig-15-moe-multistream.png
Caption: Figure 15: MoE 模块共享专家和路由专家并行——共享专家计算耗时被路由专家的计算与通信掩盖，不影响整体时延。
Prompt: MoE shared-router multi-stream parallel diagram showing shared expert and routed expert compute/communication overlap.

### Section 7c: AICPU Scheduler 算子多流并行
Type: figure
Image: ./figures/fig-16-aicpu-scheduler.png
Caption: Figure 16: AICPU Scheduler 在算子执行前计算 Tiling 分核策略，整网单轮只执行一次——Tiling 计算与 Embedding/MLAProlog 并行，有效掩盖调度耗时。
Prompt: AICPU Scheduler multi-stream parallel diagram showing Tiling computation overlapped with Embedding and MLAProlog, with metadata_stream and event synchronization.

### Section 8: Benchmark：硬数字，不吹
Type: text
Body: 所有数据基于 Offline 推理模式，不含 Serving 调度开销。950DT 16卡 DSV4 Flash，Hybrid MXFP8-MXFP4 量化：8K 序列 Decode batch=256 时 1625TPS@9.84ms，batch=1536 时 4722TPS@20.33ms，128K 序列 batch=16 时 128TPS@7.8ms。原生 Hybrid FP8-MXFP4 对比：batch=256 时 1447TPS@11.06ms，batch=1536 时 3953TPS@24.28ms——MXFP8 替换 FP8 在高吞吐场景有 20% 提升。DSV4 Pro 在 950DT 上 16卡：batch=128 时 388TPS@20.61ms。Atlas A3 64卡 DSV4 Flash，Int8 量化：8K 序列 batch=7168 时 4025TPS@27.82ms，batch=8192 时 4388TPS@29.17ms。MTP1 场景平均 1 个 Draft Token 中 Accepted Token 0.7 个，MTP3 平均 1.44 个。profile 数据已开源。

### Section 9: 开源生态：三层算子开发接口
Type: text
Body: 融合算子提供三种实现路径：Ascend C 是底层直接对接硬件指令的实现，性能最好但门槛最高；PyPTO 的前端不用感知芯片代际差异，后端通过 pass IR 和 PTO-ISA 指令区分 A3 和 950；TileLang 提供 Expert 模式（Ascend C 基础指令）和 Developer 模式（PTO-AS），为不同层次的开发者提供多层开放接口。三层都已在 CANN 仓库 0 Day 开源，几百行代码就能完成复杂融合 kernel 的开发。

### Section 10: Reference
Type: reference
- **CANN DSV4 推理代码** - https://gitcode.com/cann/cann-recipes-infer/blob/master/models/deepseek-v4/README.md
- **CANN DSV4 文档目录** - https://gitcode.com/cann/cann-recipes-infer/tree/master/docs/models/deepseek-v4
- **Ascend C Kernel 技术文档** - https://gitcode.com/cann/cann-recipes-infer/blob/master/docs/models/deepseek-v4/deepseek_v4_mHC_guide.md
- **Ascend C Kernel 代码** - https://gitcode.com/cann/cann-recipes-infer/blob/master/ops/ascendc/README.md
- **PyPTO Kernel 技术文档** - https://gitcode.com/cann/cann-recipes-infer/blob/master/docs/models/deepseek-v4/deepseek_v4_pypto_operator_guide.md
- **PTO-ISA 使用指南** - https://gitcode.com/cann/pto-isa/blob/master/README.md
- **TileLang Kernel 技术文档** - https://gitcode.com/cann/cann-recipes-infer/blob/master/docs/models/deepseek-v4/deepseek_v4_tilelang_operator_guide.md
- **mHC 论文 (Xie et al., 2026)** - https://arxiv.org/abs/2512.24880
- **DeepSeek-V4 技术报告** - https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf
- **DSV4 昇腾首发系列干货** - https://mp.weixin.qq.com/s/bN3zhUT-0HDiYLD2ULE75A
- **量化策略文档** - https://gitcode.com/cann/cann-recipes-infer/blob/master/docs/models/deepseek-v4/deepseek_v4_inference_guide.md

## PULSE
把万亿参数模型搬到新硬件上，真正的工程量不在模型端，在算子端。DSV4 上昇腾的实践证明了一件事：融合 kernel 的设计深度决定了部署的上限。
