# Metadata
Category: DeepSeek-V4
Date/Author: 2026/04/24 · yangjing
Page title: DeepSeek-V4 的核心不是更大的 MoE，而是重写 long-context 的 cost curve

# TITLE
DeepSeek-V4 的核心不是更大的 MoE，而是重写 long-context 的 cost curve

## LEAD
论文的正式标题是 DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence。这个标题本身已经把讨论边界说得很清楚了：重点不是更大的参数规模，而是 million-token context 在效率上的可实现性。它试图突破现有大模型在处理超长上下文时的效率瓶颈，并且把这个目标同时落实到模型结构、训练稳定性和运行时实现里。

## SECTIONS

### Section 1: 现状：核心问题不是参数规模，而是服务成本曲线
Type: text
Body: DeepSeek-V4 的关键不在于参数继续做大，也不在于引入一个孤立的新注意力模块。它真正改变的是 long-context 的问题定义：问题不再只是模型能不能看到更长的上下文，而是模型结构、残差路径、KV cache、专家并行和运行时能不能一起把成本压到可部署区间。

### Section 2: mHC：把残差稳定性从训练技巧提升为架构基础设施
Type: text
Body: 长上下文压缩、MoE、混合精度和定制 kernel 一旦叠加，残差路径本身就会变成训练稳定性的关键变量。mHC 的作用不是单纯增加结构复杂度，而是把残差稳定性显式写进架构。如果没有这个约束，attention 路径越混合，残差统计就越容易漂。
Callout: mHC 的意义不是结构更花，而是它把残差稳定性提升成了基础设施。没有这个前提，前面的 long-context 收益很可能只能停留在图上。

### Section 3: mHC 结构——残差稳定性作为基础设施
Type: figure
Image: ./figures/figure-01-cost-curve.svg
Caption: Figure 1: V3.2 vs V4 — 1M context 下 FLOPs 和 KV cache 大幅降低
Prompt: Cost curve comparison showing V3.2 baseline vs V4-Pro (27%/10%) and V4-Flash (10%/7%)

### Section 4: 混合注意力：不同距离的上下文不应共享同一种表示
Type: text
Body: DeepSeek-V4 没有把 attention 当成单一路径，而是拆成了职责不同的多条路径：近场路径保精度，中远场路径做压缩和选择，极远场路径进一步做高倍率摘要。这个设计的关键不是又加了两个新模块，而是承认不同距离的上下文不应该共享同一种表示和访问语义。
Callout: CSA 负责精度和效率的平衡，HCA 负责把极长路径的代价真正砍下去。两条路径，两个旋钮，而不是一个。

### Section 5: DeepSeek-V4 模型架构——按哪些路径被一起重写来读
Type: figure
Image: ./figures/figure-02-hybrid-attention.svg
Caption: Figure 2: 混合注意力——SWA/CSA/HCA 三条路径，两个旋钮
Prompt: Hybrid attention architecture showing SWA (near field), CSA (mid field compress+select), HCA (far field heavy compression)

### Section 6: CSA 压缩稀疏注意力：压缩 + 选择 + 窗口的平衡
Type: text
Body: CSA 先把一段 token 的 KV 压缩成更粗的表示，然后只对压缩后的表示做选择性注意力，同时保留 sliding-window 分支确保近场仍有高分辨率路径。压缩后的 KV 上还额外拼接了一个 128-token 的滑动窗口 KV，用 MQA 稳定落地不对称的 Q/KV 访问路径。

### Section 7: HCA 重度压缩注意力：用表示更少换取代价更低
Type: text
Body: 如果说 CSA 还是一种兼顾质量的压缩，那么 HCA 的角色就更直接。它进一步提高压缩倍率，把更长的 token 段合并成更少的状态，不再把重点放在复杂选择上，而是直接用表示更少换取代价更低。

### Section 8: 效率数据：FLOPs 和 KV cache 的大幅降低
Type: text
Body: 按照论文表述，相比 DeepSeek-V3.2：DeepSeek-V4-Pro 在 1M context 下，single-token inference FLOPs 只需 27%，KV cache 只需 10%。DeepSeek-V4-Flash 更激进——FLOPs 仅 10%，KV cache 仅 7%。
Callout: V4-Pro 在 1M context: FLOPs 27%, KV cache 10%。V4-Flash: FLOPs 10%, KV cache 7%。混合 CSA/HCA 负责压远场成本，精度优化进一步压推理 FLOPs。

### Section 9: Muon 不是孤立的优化器技巧，是训练稳定性的系统设计
Type: text
Body: Muon、iterative clip、张量级 checkpointing、混合 ZeRO、低成本 mHC 重计算、以及两阶段上下文并行，这些东西一起决定了前面的结构能不能在训练时稳定放大。前面的 attention 结构已经通过 RMSNorm 压住了最容易失控的 logits 路径，因此 Muon 不再需要 QK-Clip 补丁。

### Section 10: 异构 KV Cache：分层存储系统，不是分几块显存
Type: text
Body: 一旦上下文来到百万级，KV cache 不再是分几块显存的问题。V4 把它当成分层存储系统来处理：原始窗口、高压缩表示、远场索引和 prefix reuse 共同组成异构 KV cache。推理框架进一步引入磁盘存储策略来支持高效的 shared-prefix reuse。

### Section 11: 后训练与训推一致性
Type: text
Body: V4 通过 batch-invariant 和 deterministic 算子库尽量保证训推一致。推理侧把异构 KV cache、shared-prefix reuse 和磁盘存储策略直接写进了系统设计。对 infra 团队来说，这一套并不轻松，但它明确在朝低成本长上下文推理这个方向收敛。

### Section 12: Reference
Type: reference
- **DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence** - DeepSeek - https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf
- **DeepSeek-V4详细分析(1): 算法和模型结构** - 佚名 - https://mp.weixin.qq.com/s/F-0_bbwvQjlYaHVFW_uPNw
- **DeepSeek-V4 预览版：迈入百万上下文普惠时代** - DeepSeek - https://api-docs.deepseek.com/zh-cn/news/news260424
- **deepseek-ai/DeepSeek-V4-Pro / inference** - DeepSeek - https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/tree/main/inference
- **DeepSeek V4 预览版本上线并同步开源** - kaiyuan - https://www.zhihu.com/question/2030963929510310856/answer/2031734018199270833

## PULSE
V4 证明了一件事：long-context 的成本不是物理极限，是架构选择。选对了注意力结构，10x 成本下降只是起点。
