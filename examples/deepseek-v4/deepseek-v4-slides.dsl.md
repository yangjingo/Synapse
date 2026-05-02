# 00 / Cover

## DeepSeek-V4

重写百万级上下文的成本曲线，而非继续做大模型

Version: Synapse v6.0 | Author: Why.J | Date: 2026/04/24

---

# 01 / Context

## 现状分析：三条事实指向同一个结论

- **事实 1**: V4-Pro 在 1M context 下单 token 推理 FLOPs 仅 V3.2 的 ==27%==、KV cache 仅 10%；V4-Flash 更激进 —— FLOPs ==10%==、KV cache 仅 7%。
- **事实 2**: 混合 CSA/HCA 不是"又加了两个注意力变体"，而是承认不同距离的上下文不应共享同一种表示。
- **事实 3**: mHC 把残差稳定性从"训练技巧"提升为==架构基础设施==。

::pulse [「 不是更大的 MoE，是重写了 long-context 的 cost curve。 」] ::

::image [./figures/figure-01-cost-curve.svg] [scale=80] ::

---

# 02 / Agenda

## 从事实到问题

- **Q1**: 事实 2 的架构逻辑 —— 为什么 V4 要把 ==attention 拆成多条职责不同的路径==？
- **Q2**: 事实 3 的残差约束 —— mHC 如何让混合路径在训练时==稳定放大==？
- **Q3**: 训练系统设计 —— Muon 不需要 QK-Clip 是因为==结构层做了什么==？框架如何配合？
- **Q4**: 事实 1 的终极推演 —— 这套设计能不能从论文==走到工程系统==？

---

# 03 / Mechanism I

## CSA：压缩 + 稀疏选择 + 局部窗口的平衡

- **压缩**: 把一段 token 的 KV 压成更粗的表示，降低远场访问成本。
- **选择**: 只对压缩后的表示做选择性 attention，不做全量扫描。
- **窗口**: 保留 ==128-token sliding-window==，确保近场仍有高分辨率路径。
- **不对称 Q/KV**: Q 对应当前序列，KV 是"压缩远场 + 近场窗口"的拼接，用 MQA 稳定落地。

::pulse [「 不是"又加了一个模块"，是"距离不同，表示不同"。 」] ::

::image [./figures/figure-02-hybrid-attention.svg] [scale=80] ::

---

# 04 / Mechanism II

## HCA：把极长路径的代价真正砍下去

- **角色**: HCA 不做复杂选择，直接用"表示更少"换"代价更低"。
- **分工**: CSA 管"精度和效率的平衡"，HCA 管"==把极长路径砍到底=="。
- **数学直觉**: 放弃"所有距离共享同一种表示"的假设，把"距离"变成结构变量。

::pulse [「 距离越远，压缩越狠 —— 这是结构分工，不是简单取舍。 」] ::

::visual {🍌 nano-banana prompt: two boxes side by side — left "CSA" balanced scale, right "HCA" compressed arrow. Label "trade precision for cost". Hand-drawn, black ink, white background} ::

---

# 05 / Mechanism III

## mHC：让混合路径仍然保有残差行为

- **问题**: Attention 路径越混合，残差统计越容易漂。MoE + 低精度 + 长路径叠加时，先出问题的不是容量，而是==信号一致性==。
- **方案**: mHC 对传统残差连接做结构性增强，不是加复杂度，是把稳定性显式写进架构。
- **配套**: Hybrid attention 改写成本结构，mHC 保证新路径仍可==训练、可放大==。

::pulse [「 没有这个前提，long-context 收益只能停留在图上。 」] ::

::visual {🍌 nano-banana prompt: two hands holding a wobbly line labeled "residual". Left hand "mHC" stabilizing. Hand-drawn, black ink, white background} ::

---

# 06 / Mechanism IV

## Muon：不是优化器技巧，是训练稳定性的系统设计

- **三个问题**: 混合路径放大梯度不均 + 长上下文放大极端更新 + 混合精度让偶发不稳定积累。
- **联动**: Attention 通过 ==RMSNorm 压住 logits 爆炸== → Muon 不再需要 QK-Clip 补丁。
- **框架配合**: 张量级 checkpointing + 混合 ZeRO + mHC 重计算 + 两阶段上下文并行，绑定成整体。

::pulse [「 优化器不孤立项，结构铺路，框架配合。 」] ::

::visual {🍌 nano-banana prompt: three nodes in triangle — "Attention" RMSNorm, "Muon" no QK-Clip, "Framework" ZeRO. Hand-drawn, black ink, white background} ::

---

# 07 / Mechanism V

## 异构 KV Cache：分层存储，不是分几块显存

- **分层存储**: 原始窗口 + 高压缩表示 + 远场索引 + prefix reuse，组成==异构 KV cache==。
- **磁盘策略**: 推理框架引入磁盘存储支持高效的 shared-prefix reuse。
- **训推一致**: Batch-invariant + deterministic 算子库，把一致性从论文承诺变成==工程约束==。

::pulse [「 KV cache 是存储系统，不是 tensor 的脚注。 」] ::

::visual {🍌 nano-banana prompt: four stacked layers — top "raw" dense dots, "compressed" sparse, "far index" few marks, bottom "disk" circle. Arrow down "tiered". Hand-drawn, black ink, white background} ::

---

# 08 / Take A Ways

## Take A Ways

- **Q1 → A1**: V4 把 attention 拆成多路径，因为不同距离的上下文需要不同的==表示和访问语义==，一条路径做不到。
- **Q2 → A2**: mHC 把残差稳定性写进架构，让混合路径在 MoE + 低精度叠加时==信号不漂==。
- **Q3 → A3**: Attention 的 RMSNorm 在结构层解决 logits 爆炸，Muon 因此不再需要 QK-Clip 补丁，两者是==联动设计==。

::pulse [「 V4 证明了一件事：long-context 的成本不是物理极限，是架构选择。选对了，10x 下降只是起点。 」] [fragment] ::

---

# 09 / Reference

## Reference

- **DeepSeek-V4** - DeepSeek Team - https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf
- **DeepSeek-V4 算法和模型结构分析** - https://mp.weixin.qq.com/s/F-0_bbwvQjlYaHVFW_uPNw
- **DeepSeek-V4 预览版** - https://api-docs.deepseek.com/zh-cn/news/news260424
- **DeepSeek V4 推理部署** - https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/tree/main/inference
- **DeepSeek V4 预览版本上线并同步开源** - kaiyuan - https://www.zhihu.com/question/2030963929510310856/answer/2031734018199270833
