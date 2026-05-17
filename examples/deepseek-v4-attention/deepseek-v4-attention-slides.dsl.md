# 00 / Cover

## 手撕 DeepSeek-V4 注意力方案

从标准注意力到 HCA / CSA / SWA / MQA，逐层构建 V4 的稀疏注意力架构

Version: Synapse v6.0 | Author: Why.J | Date: 2026/05/17

---

# 01 / Context

## 现状分析：V4 注意力架构的核心事实

- **事实 1**: V4 提出两种注意力——HCA 以压缩率 128 对 KV 做强压缩（block-level），CSA 以压缩率 4 做轻量压缩 + Indexer 筛选 top-k（token-level），==分工明确==。
- **事实 2**: V4 注意力不是从零发明，而是有机融合了 NSA（HCA 前身）和 DSA（Indexer 来源），关键是==原生训练==而非继续预训练。
- **事实 3**: Sparse Kernel 逐 query 拉取非连续 KV 子集，MQA 下单次矩阵乘即得所有头的注意力分数——==零浪费计算==。

::pulse [「 不同距离的上下文不应共享同一种表示——距离变成结构变量。 」] ::

::image [./figures/fig-hca-csa-overview.png] [scale=70] ::

---

# 02 / Agenda

## 从注意力抽象到 V4 实现：七组关键问题

- **Q1**: 从标准注意力到稀疏注意力，中间需要哪些==注意力抽象==？
- **Q2**: Mask-Free 和 Top-K 如何真正减少计算量？
- **Q3**: 压缩注意力和滑窗注意力各自的==数学直觉和工程限制==是什么？
- **Q4**: HCA 的 Compressor 如何实现因果压缩？信息泄漏怎么处理？
- **Q5**: CSA 的 Indexer + Overlap 如何==平衡精度和全局信息==？
- **Q6**: V4-MQA 的分组投影解决了什么==参数瓶颈==？
- **Q7**: Sparse Kernel 在非连续 KV 上如何实现==零浪费==？

---

# 03 / Mechanism I

## V4 注意力方案全貌

- **HCA** (Heavily Compressed Attention): 压缩率 128，block-level 压缩 KV，捕获全局信息。
- **CSA** (Compressed Sparse Attention): 压缩率 4，轻量压缩 + Indexer top-k 筛选 token-level KV，兼顾全局与局部。
- **SWA** (Sliding Window Attention): 选取就近 KV，作为局部信息补充。
- **MQA** (Multi Query Attention): KV 头数保持为 1，减少 KV-Cache，memory-efficient。

::image [./figures/fig-hca-csa-overview.png] [scale=80] ::

---

# 04 / Mechanism I

## 前置工作：NSA (Native Sparse Attention)

- **NSA 是 HCA 的前身**: 采用动态分层稀疏策略，将粗粒度 token 压缩与细粒度 token 选择结合。
- **支持原生训练**: NSA 的关键创新在于可以端到端训练，而非后处理。
- **V4 的取舍**: NSA 的 Select Attention（块级稀疏）在 V4 中被移除，V4 采用 MQA 减少多头计算复杂度。

::image [./figures/fig-nsa-dsa-timeline.png] [scale=80] ::

---

# 05 / Mechanism I

## 前置工作：DSA (DeepSeek Sparse Attention)

- **DSA 是 CSA 的前身**: 在 DeepSeek-V3.2 中引入，用 Indexer 网络做 token 级 KV 筛选，已是产品验证方案。
- **非原生训练**: DSA 基于 V3.1-T 基座继续预训练，而非原生预训练。
- **V4 的改进**: CSA 的 Indexer 源自 DSA，并进一步融入 Compressed-KV 弥补全局信息。

::image [./figures/fig-nsa-dsa-timeline.png] [scale=80] ::

---

# 06 / Mechanism I

## V4 注意力的关键定位

- **作为 DSA 续作**: 最大特点是==原生训练==，而非继续预训练。
- **在 DSA 基础上的改进**: 融合了 Compressed-KV 来做注意力计算，弥补全局序列信息。
- **退化机制**: 当某一层不压缩 KV 时（compress_ratio=0），退化为纯 SWA。

::pulse [「 V4 注意力 = NSA 的全局压缩 + DSA 的稀疏选取 + 原生训练。 」] ::

---

# 07 / Mechanism II

## 标准注意力计算：Scaled Dot-Product Attention

- **公式**: S = Q @ K^T → softmax → P @ V，最基本的注意力实现。
- **参数**: mask 预留，用于控制 KV 的选择范围。
- **复杂度**: 全局 O(L^2)，所有 KV 参与计算。

::code [python] [
args = AttentionModelArgs()
bsz, seq_len = 2, 256
X = torch.randn(bsz, seq_len, args.dim)

def ScaledDotProductionAttention(Q, K, V, M):
    S = Q @ K.transpose(-2, -1)
    if M != None:
        S = S.masked_fill(M == False, float('-inf'))
    P = F.softmax(S, dim = -1)
    Z = P @ V
    return Z

M = torch.ones(bsz, seq_len, seq_len)
Z = ScaledDotProductionAttention(X, X, X, M)
print(Z.shape)  # torch.Size([2, 256, 512])
] ::

---

# 08 / Mechanism II

## 随机注意力计算：Bool 掩码

- **思路**: 生成随机的 bool 掩码，使得每个 query 仅注意随机选中的 KV 位置。
- **局限**: 仅用 mask 标记，并未真正减少注意力计算量。

::code [python] [
shape = [bsz, seq_len, seq_len]
M_random = torch.randint(0, 2, size=shape, dtype=torch.bool)
O_random_mask = ScaledDotProductionAttention(X, X, X, M_random)
print((M_random.int())[0, :2, :10])
] ::

::pulse [「 随机掩码是稀疏注意力的起点，但只是"标记"而非"减量"。 」] ::

---

# 09 / Mechanism II

## Mask-Free 随机注意力：概念

- **核心思想**: 只计算 mask 非零位置的 KV，实打实减少计算量。
- **实现方式**: 先写出单 Q 多 KV 的注意力计算方程，再遍历每个 query。

::image [./figures/fig-mask-free-attn.png] [scale=80] ::

---

# 10 / Mechanism II

## Mask-Free：SingleQuerySDPA 实现

::code [python] [
def SingleQuerySDPA(q, K, V):
    S = q @ K.t()
    P = F.softmax(S, dim=-1)
    Z = P @ V
    return Z
] ::

- **单 query 接口**: 输入一个 query 向量和对应的 K、V 子集，输出注意力结果。
- **这是所有稀疏注意力的基本计算单元**。

---

# 11 / Mechanism II

## Mask-Free：完整遍历实现

::code [python] [
class AttentionFreeMask(nn.Module):
    def __init__(self, args):
        super().__init__()
        dim, head_dim, n_heads, n_kv_heads = args.dim, args.head_dim, args.n_heads, args.n_kv_heads
        self.Wq = nn.Linear(dim, n_heads * head_dim, bias=False)
        self.Wk = nn.Linear(dim, n_kv_heads * head_dim, bias=False)
        self.Wv = nn.Linear(dim, n_kv_heads * head_dim, bias=False)
        self.Wo = nn.Linear(dim, dim, bias=False)

    def forward_free_mask(self, X, mask):
        B, L, D = X.shape
        Q, K, V = self.Wq(X), self.Wk(X), self.Wv(X)
        Z = torch.zeros_like(Q)
        for i in range(B):
            for j in range(L):
                idx = torch.where(mask[i, j] != 0)[0].tolist()
                q, K_, V_ = Q[i,[j], :], K[i, idx, :], V[i, idx, :]
                Z[i,j,:] = SingleQuerySDPA(q, K_, V_)
        O = self.Wo(Z)
        return O
] ::

---

# 12 / Mechanism II

## Top-K 注意力：Post vs Pre 模式

- **Post**: 先计算完整注意力分数，再选 Top-K。无法避免 O(L^2) 计算复杂度。
- **Pre**: 由筛选函数（如 DSA 的 Indexer）先行选 KV，再计算注意力，只计算必要位置。

::image [./figures/fig-topk-attn.png] [scale=75] ::

---

# 13 / Mechanism II

## Top-K 注意力：Pre 模式为什么要先选？

- **Post 模式的问题**: 必须先算全量 S = Q @ K^T，复杂度 O(L^2)，选 top-k 只是后处理。
- **Pre 模式的优势**: 先用轻量评分筛选 KV，只对选中的 KV 计算注意力。
- **V4 的选择**: Pre 模式——由 Indexer 先选 KV，再逐 query 计算。

::image [./figures/fig-post-vs-pre.png] [scale=75] ::

---

# 14 / Mechanism II

## Top-K：零浪费的注意力计算

::code [python] [
class AttentionTopK(nn.Module):
    def __init__(self, args):
        super().__init__()
        # Wq, Wk, Wv, Wo projections...

    def forward(self, X, topk=10, is_post=True):
        B, L, D = X.shape
        Q, K, V = self.Wq(X), self.Wk(X), self.Wv(X)
        Z = torch.zeros_like(Q)
        for i in range(B):
            for j in range(L):
                if is_post:
                    S = Q[i,[j], :] @ K[i].t()
                    # ... select top-k from S
                else:
                    # Pre: Indexer 先选 KV
                    S = torch.randn(1, L)  # 模拟 Indexer 评分
                    _, idx = torch.topk(S, topk)
                    idx = idx[0].tolist()
                    q, K_, V_ = Q[i,[j], :], K[i, idx, :], V[i, idx, :]
                    Z[i,j,:] = SingleQuerySDPA(q, K_, V_)
        O = self.Wo(Z)
        return O
] ::

---

# 15 / Mechanism II

## Top-K 小结：逐 query 的必要性

- **逐 query 拉取 top-k KV** 看似低效，但 V4 的 Sparse Attn Kernel 确实如此实现。
- **原因**: 稀疏选取下各 query 的 KV 集合==互不相交==，块式复用失去前提。
- **不是 FlashAttention 的块式计算**: FlashAttention 假设 KV 连续，Sparse 场景不满足。

::image [./figures/fig-post-vs-pre.png] [scale=70] ::

::pulse [「 稀疏选取下各 query 的 KV 集合互不相交，FlashAttention 的块式复用失去前提。 」] ::

---

# 16 / Mechanism III

## 压缩注意力：核心概念

- **直觉**: 当上下文长度为 1M、压缩率为 128 时，压缩后仅有 ==7812.5== 个 KV。
- **方法**: 等间距的池化平均（mean-pooling，免参数）来压缩 KV。
- **效果**: KV 长度大幅减少，但带来位置编码对齐、信息泄漏等新问题。

::image [./figures/fig-compress-attn.png] [scale=80] ::

---

# 17 / Mechanism III

## 压缩注意力：代码实现

::code [python] [
class AttentionCompress(nn.Module):
    def __init__(self, args):
        super().__init__()
        # Wq, Wk, Wv, Wo projections...

    def forward(self, X, compress_ratio):
        B, L, D = X.shape
        Q, K, V = self.Wq(X), self.Wk(X), self.Wv(X)
        c, n_c = compress_ratio, L // compress_ratio
        if compress_ratio != 0:
            # mean-pooling 压缩
            K_ = K.reshape(B, n_c, c, D).mean(dim=2)
            V_ = V.reshape(B, n_c, c, D).mean(dim=2)
        Z = ScaledDotProductionAttention(Q, K_, V_, None)
        O = self.Wo(Z)
        return O
] ::

---

# 18 / Mechanism III

## 压缩率对比分析

- **ratio=1**: 退化为标准注意力，KV 长度不变（256）。
- **ratio=4**: KV 从 256 缩至 64，计算量降至 1/4。
- **ratio=16**: KV 缩至 16，计算量降至 1/16。
- **ratio=128**: 1M 上下文仅 7812.5 个 KV，==极端压缩==。

::pulse [「 压缩率是结构旋钮——ratio=1 退化为标准注意力，ratio=128 砍到极致。 」] ::

---

# 19 / Mechanism III

## 压缩注意力的遗留问题

- **位置编码**: Compressed KV 的 RoPE 如何处理？
- **KV-Cache**: Inference Prefill/Decode 时如何增量更新？
- **因果信息泄漏**: 因果注意力下压缩 KV 的信息泄漏如何掩码？
- **Overlap 平滑**: 相邻块的 Compressed KV 如何通过 overlap 平滑表达？

::pulse [「 这些问题将在 HCA/CSA 的具体实现中逐一解决。 」] ::

---

# 20 / Mechanism III

## 滑窗注意力：概念与计算

- **核心**: 每个 query 仅关注窗口内的 KV，O(L^2) → O(L·w)。
- **模式**: 复用候选 ID 式的 KV 选取，重写遍历零浪费计算。
- **天然适配**: block-wise attention 天然适配 SWA。

::image [./figures/fig-swa-blockwise.png] [scale=80] ::

---

# 21 / Mechanism III

## 滑窗注意力：代码实现

::code [python] [
class AttentionSlidingWindow(nn.Module):
    def __init__(self, args):
        super().__init__()
        # Wq, Wk, Wv, Wo projections...

    def forward(self, X, window_size):
        B, L, D = X.shape
        Q, K, V = self.Wq(X), self.Wk(X), self.Wv(X)
        Z = torch.zeros_like(Q)
        for i in range(B):
            for j in range(L):
                left = max(j, j - window_size)
                right = min(j, j + window_size)
                q = Q[i,[j], :]
                K_ = K[i, left:right, :]
                V_ = V[i, left:right, :]
                Z[i,j,:] = SingleQuerySDPA(q, K_, V_)
        O = self.Wo(Z)
        return O
] ::

---

# 22 / Mechanism III

## 注意力抽象小结

- **标准注意力**: 全局 O(L^2)，所有 KV 参与。
- **Mask-Free**: 真正减少计算量，逐 query 拉取。
- **Top-K**: Pre 模式先选后算，避免 O(L^2)。
- **压缩注意力**: 降维表示，遗留位置编码和因果泄漏。
- **滑窗注意力**: 局部信息，O(L·w) 复杂度。

::pulse [「 五种注意力各有分工——V4 的 HCA/CSA 是它们的有机组合。 」] ::

---

# 23 / Mechanism IV

## HCA：Compressor 类设计

- **可学习压缩**: 使用可学习的线性投影 w_compress 对每段 KV 做加权压缩。
- **对比 mean-pooling**: Compressor 的压缩表达更具表达能力。
- **参数**: w_compress 是 [compress_ratio, 1] 的线性层。

::code [python] [
class Compressor(nn.Module):
    def __init__(self, compress_ratios, dim):
        super().__init__()
        self.compress_ratios = compress_ratios
        self.w_compress = nn.Linear(compress_ratios, 1, bias=False)

    def forward(self, X):
        B, L, D = X.shape
        c, n_c = self.compress_ratios, L // self.compress_ratios
        if self.compress_ratios > 1:
            X_ = X.reshape(B, n_c, c, D)
            X_ = self.w_compress(X_.transpose(2,3))[...,0]
        return X_
] ::

---

# 24 / Mechanism IV

## HCA：因果压缩前向计算

- **因果约束**: 第 j 个 query 只能看到 j // ratio 个压缩 KV 块。
- **以 ratio=4 为例**: 序列长度 8192 仅产生 2048 个压缩 KV。
- **实现**: 逐 query 计算注意力，限制可见的压缩 KV 范围。

::code [python] [
bsz, seq_len = 2, 8192
args.compress_ratios = 4

compressor = Compressor(args.compress_ratios, args.dim)
K_ = compressor(K)  # [B, 2048, D]
V_ = compressor(V)  # [B, 2048, D]

O = torch.zeros_like(Q)
for i in range(bsz):
    for j in range(seq_len):
        j_ = j // args.compress_ratios  # 因果边界
        K_c, V_c = K_[i, :j_], V_[i, :j_]
        O[i,j] = Q[i, [j]] @ K_c.T @ V_c
] ::

---

# 25 / Mechanism IV

## HCA：信息泄漏分析

- **问题**: 因果约束下，压缩 KV 可能包含未来信息。
- **原因**: 一个压缩块包含多个 token 的 KV，query 只应看到过去的信息。
- **解决**: 因果边界 j_ = j // ratio，只看到 j_ 之前的完整压缩块。
- **代价**: 当前 token 所在块的信息被丢弃，需要 SWA 补充。

::pulse [「 因果约束下压缩 KV 的信息泄漏是真实问题——空缺由 SWA 补，这是 HCA 必须夹带 SWA 的原因。 」] ::

---

# 26 / Mechanism IV

## HCA + SWA 配合机制

- **HCA 负责全局**: 通过强压缩捕获远场信息。
- **SWA 补充局部**: 填补因果压缩丢弃的当前块信息。
- **分工**: HCA 管"代价更低"，SWA 管"近场不丢"。

::pulse [「 HCA 不独立运行——没有 SWA，因果压缩的信息空缺无法填补。 」] ::

---

# 27 / Mechanism V

## CSA：Indexer 类设计

- **功能**: 轻量投影做点积评分，top-k 选出稀疏索引。
- **简化版**: 投影到 1 维做评分。
- **V4 实际**: 投影到 n_head=64 维，weights_proj 学习每个头的重要性权重，再加权求和。

::code [python] [
class Indexer(nn.Module):
    def __init__(self, args):
        super().__init__()
        dim, n_head = args.dim, args.n_heads
        # 简化版：投影到1维做点积评分
        self.Wk_light = nn.Linear(dim, 1, bias=False)
        self.Wq_light = nn.Linear(dim, 1, bias=False)

    def forward(self, Q, K, topk):
        Q_, K_ = self.Wq_light(Q), self.Wk_light(K)
        S = Q_ @ K_.transpose(-2, -1)
        _, idx = torch.topk(S, topk, dim=-1)
        return idx
] ::

---

# 28 / Mechanism V

## CSA：前向计算流程

- **Step 1**: Compressor 对 KV 做轻量压缩（ratio=4）。
- **Step 2**: Indexer 对原始 KV 做 top-k 筛选。
- **Step 3**: 每个 query 同时计算稀疏 KV + 压缩 KV 注意力。
- **Step 4**: 结果相加，得到最终输出。

::pulse [「 双路注意力——稀疏 KV 保证精度，压缩 KV 弥补全局信息。 」] ::

---

# 29 / Mechanism V

## CSA：代码实现（基础版）

::code [python] [
Q = torch.randn(bsz, seq_len, args.dim)
K = torch.randn(bsz, seq_len, args.dim)
V = torch.randn(bsz, seq_len, args.dim)

args.compress_ratios = 4
compressor = Compressor(args.compress_ratios, args.dim)
K_ = compressor(K)  # 压缩 KV
V_ = compressor(V)

indexer = Indexer(args)
idx = indexer(Q, K, args.attn_top_k)  # 稀疏索引

z = torch.zeros_like(Q)
for i in range(bsz):
    for j in range(seq_len):
        sparse_ids = idx[i, j]
        z[i, [j]] += attn(Q[i, [j]], K[i, sparse_ids], V[i, sparse_ids])
        z[i, [j]] += attn(Q[i, [j]], K_[i, :], V_[i, :])  # 压缩 KV
] ::

---

# 30 / Mechanism V

## CSA：Overlap 平滑策略

- **目的**: 将相邻段的压缩特征拼到当前位置，使段间过渡自然，避免边界信息断裂。
- **仅在 CSA 中使用**: HCA 不需要 overlap。
- **效果**: overlap 后压缩 KV 从 [B, L/4, D] 变为 [B, L/4, 2D]，再 sum 回 [B, L/4, D]。

::image [./figures/fig-csa-overlap.png] [scale=80] ::

---

# 31 / Mechanism V

## CSA：Overlap 代码实现

::code [python] [
def overlap(X):
    B, L, D = X.shape
    X_ = torch.zeros(B, L, D*2)
    X_[:, :, D:] = X          # 当前段
    X_[:, 1:, :D] = X[:, :L-1, :]  # 前一段
    return X_

# Overlap 后再压缩回原维度
overlap_flag = 1
coff = 1 + overlap_flag

K_ = overlap(compressor(K))  # [B, L/4, 2D]
V_ = overlap(compressor(V))

if overlap_flag:
    _, L_c, _ = K_.shape
    K_ = K_.reshape(bsz, L_c, args.dim, coff).sum(dim=-1)
    V_ = V_.reshape(bsz, L_c, args.dim, coff).sum(dim=-1)
] ::

---

# 32 / Mechanism V

## CSA：SWA + CSA 组合

- **三路 KV**: 每个 query 同时关注 稀疏 KV + 窗口 KV + 压缩 KV。
- **拼接策略**: 三路 KV 在候选索引层面拼接。
- **注意力计算**: 统一计算，softmax 自动归一化。

::image [./figures/fig-csa-complete.png] [scale=75] ::

---

# 33 / Mechanism V

## CSA：三路 KV 拼接代码

::code [python] [
win = 128
z = torch.zeros_like(Q)
for i in range(bsz):
    for j in range(seq_len):
        sparse_ids = idx[i, j]
        left, right = max(0, j-win), min(seq_len, j+win)

        K_mix = torch.cat((
            K[i, sparse_ids],      # Top-K 稀疏 KV
            K[i, left:right],      # 滑窗 KV
            K_[i, :]))             # 压缩 KV
        V_mix = torch.cat((
            V[i, sparse_ids],
            V[i, left:right],
            V_[i, :]))

        z[i,j] = attn(Q[i, [j]], K_mix, V_mix)
] ::

---

# 34 / Mechanism V

## CSA：完整计算要点

1. **原始 KV + 压缩 KV** 在内存中拼接为统一序列。
2. **候选索引** 由 [window_ids, sparse_ids, compress_ids] 三路拼接。
3. **Sparse Kernel** 按候选索引逐 query 拉取 KV 子集，零浪费计算注意力。
4. **Softmax 归一化** 在统一序列上自动处理。

::image [./figures/fig-csa-complete.png] [scale=70] ::

::pulse [「 三路 KV 拼接是 V4 注意力的工程精髓——一条路径做不到，三条路各司其职。 」] ::

---

# 35 / Mechanism V

## CSA：Softmax 归一化问题

- **问题**: 多种注意力混合后，注意力分数如何 Softmax 归一化？
- **V4 的方案**: 三路 KV 拼接为统一序列，在统一序列上做全局 Softmax。
- **优势**: 不需要分别归一化再加权，数学上等价且更简洁。

::pulse [「 统一 Softmax 是关键设计——分别归一化会丢失跨路径的相对重要性。 」] ::

---

# 36 / Mechanism VI

## MQA vs MLA：核心区别

- **MLA**: 上投影到多头 KV 后再算注意力。推理时需反复加载上投影矩阵把 latent cache 还原成高维 KV，长解码下开销显著。
- **V4-MQA**: 直接用单头 KV 计算注意力，引入分组输出投影控制 Wo 规模。

::image [./figures/fig-mqa-vs-mla.png] [scale=80] ::

---

# 37 / Mechanism VI

## V4-MQA：算法设计

- **KV 头数**: n_kv_heads = 1，极大减少 KV-Cache 量。
- **分组输出投影**: 多头输出拼接后维度过大，引入 Wo_a + Wo_b 两段投影控制规模。
- **计算优势**: MQA 下单 query 维度为 [H, d]，单头 KV 块为 [blk, d]，一次矩阵乘即得所有头分数。

::pulse [「 V4-MQA 不只是 KV 头数为 1 的 MQA——分组输出投影是独立的工程创新。 」] ::

---

# 38 / Mechanism VI

## V4-MQA：完整代码实现

::code [python] [
class MQA(nn.Module):
    def __init__(self, args, o_lora_rank, o_groups):
        super().__init__()
        dim, head_dim, self.n_heads = args.dim, args.head_dim, args.n_heads
        self.n_kv_heads = 1
        self.Wq = nn.Linear(dim, self.n_heads * head_dim, bias=False)
        self.Wc = nn.Linear(dim, head_dim, bias=False)
        self.Wk = nn.Linear(head_dim, head_dim, bias=False)
        self.Wv = nn.Linear(head_dim, head_dim, bias=False)
        self.o_lora_rank, self.o_groups = o_lora_rank, o_groups
        self.Wo_a = nn.Linear(self.n_heads * head_dim // o_groups,
                              o_groups * o_lora_rank, bias=False)
        self.Wo_b = nn.Linear(o_lora_rank * self.n_heads, dim, bias=False)
] ::

---

# 39 / Mechanism VI

## V4-MQA：前向计算代码

::code [python] [
    def forward(self, X, mask):
        B, L, D = X.shape
        Q, K, V = self.Wq(X), self.Wk(X), self.Wv(X)
        Q = Q.reshape(B, L, self.n_heads, D // self.n_heads).transpose(1, 2)
        K = K.reshape(B, L, self.n_heads, D // self.n_kv_heads).transpose(1, 2)
        V = V.reshape(B, L, self.n_heads, D // self.n_kv_heads).transpose(1, 2)
        Z = ScaledDotProductionAttention(Q, K, V, mask)

        d = self.n_heads * D // self.o_groups
        Z = Z.reshape(B, L, self.o_groups, d)
        Z = self.Wo_a(Z)           # 分组降维
        Z = Z.reshape(B, L, self.o_lora_rank * d)
        O = self.Wo_b(Z)           # 升维回 dim
        return O
] ::

---

# 40 / Mechanism VI

## Group Projection：参数规模分析

- **V4-Pro 配置**: dim=7168, n_heads=128, head_dim=512, o_groups=16
- **问题**: 多头输出 [128, 512]，拼接为 65536，全连接 Wo [65536, 7168] 参数不可接受。
- **拆分方案**:
  - Wo_a = [16, 1024, 4096] — 分组降维
  - Wo_b = [16384, 7168] — 升维回 dim

::pulse [「 128x512=65536 维全连接不可行——分组投影把参数量从 O(D^2) 降到 O(D * r)。 」] ::

---

# 41 / Mechanism VI

## Group Projection：验证代码

::code [python] [
Wo_a = torch.ones(2, 4, 3)  # 2 groups, 4 dim_in, 3 dim_out
X = torch.ones(5, 4)         # 5 batchsize, 4 dim_in
Wo_a[0] *= 2
Wo_a[1] *= 3

Y = X @ Wo_a           # torch.Size([2, 5, 3])
Y1 = X @ Wo_a[0]       # torch.Size([5, 3])
Y2 = X @ Wo_a[1]       # torch.Size([5, 3])

print(f'Y, Y1, Y2 shape: {Y.shape} | {Y1.shape} | {Y2.shape}')
print(torch.norm(Y - torch.stack([Y1, Y2], dim=0)))  # 0
] ::

::pulse [「 分组投影的数学等价性：Y = X @ Wo_a 等于逐组 Y1 = X @ Wo_a[0]。 」] ::

---

# 42 / Mechanism VI

## Group Projection：五条洞察

1. **成组方式**: 每 8 个注意力头拼为一条组向量，128 头共得 16 条。
2. **组隔离**: 每条组向量只与 Wo_a 中对应子矩阵交互，组间计算完全隔离。
3. **权重独立**: 分组等价于把 128 个头压成 16 个"共享组头"，每组独立投影权重。
4. **计算量可控**: 总开销由组数、组内维度与中间维度决定。
5. **块对角与硬件友好**: 贴合 Tensor Core 高效区间，适配 FP4/FP8 量化。

::pulse [「 分组不是简单拆矩阵——是把 128 个头压成 16 个共享组头。 」] ::

---

# 43 / Mechanism VII

## Sparse Attention Kernel：调用接口

- **V4 统一接口**: `sparse_attn(q, kv, attn_sink, topk_idxs, softmax_scale)`
- **KV 布局**: kv = [2, L + L_compressed, d]，原始 KV + 压缩 KV 拼接。
- **索引来源**: 三路 — SWA + Sparse + Compress。

::image [./figures/fig-sparse-kernel-overview.png] [scale=80] ::

---

# 44 / Mechanism VII

## Sparse Kernel：主函数入口

::code [python] [
if __name__ == "__main__":
    L, H, d = 4, 8, 32
    L_compressed = 6

    # QKV
    q = torch.randn(L, H, d)
    kv = torch.randn(2, L + L_compressed, d)  # 原始 KV + 压缩 KV

    # ids: 三路来源
    num_win_ids = 2
    num_sparse_ids = 3
    num_compressed_ids = 1
    K = num_win_ids + num_sparse_ids + num_compressed_ids

    topk_ids = torch.randint(0, L + L_compressed, (L, K))

    # sparse attn
    out = sparse_linear_attn_torch(q, kv, topk_ids, block=3)
    print(out.shape)  # torch.Size([4, 8, 32])
] ::

---

# 45 / Mechanism VII

## Sparse Kernel：核心实现

::image [./figures/fig-sparse-kernel-detail.png] [scale=80] ::

---

# 46 / Mechanism VII

## Sparse Kernel：逐 query 块式 gather

::code [python] [
def sparse_linear_attn_torch(q, kv, topk_ids, block=64, scale=None):
    L, H, d = q.shape
    K_topk = topk_ids.shape[1]
    num_blocks = math.ceil(K_topk / block)
    o = torch.zeros(L, H, d, device=q.device, dtype=q.dtype)

    for i in range(L):              # 外循环：逐 query
        qi = q[i]                    # [H, d]
        acc_o = torch.zeros(H, d)

        for t in range(num_blocks):  # 内循环：分块 gather
            start = t * block
            end = min(start + block, K_topk)
            idxs = topk_ids[i, start:end]

            kv_block = kv[:, idxs]   # 非连续 KV gather
            scores = qi @ kv_block[0].T   # q @ K
            acc_o += scores @ kv_block[1]  # score @ V

        o[i] = acc_o
    return o
] ::

---

# 47 / Mechanism VII

## Sparse Kernel：三个关键提炼

1. **外循环逐 query，内循环分块**: topk_ids 分块 gather，逐块计算。
2. **gather 的 KV 地址不连续**: 各 query 的稀疏子集互不相交。
3. **MQA 优势**: qi [H, d] @ K_block.T [d, blk] → [H, blk]，==多头并行无额外开销==。

::image [./figures/fig-sparse-kernel-detail.png] [scale=70] ::

::pulse [「 一次矩阵乘即得所有头的注意力分数——MQA 的计算优势在 Kernel 层充分体现。 」] ::

---

# 48 / Mechanism VII

## Sparse Kernel：MQA 在 Kernel 中的优势

- **单头 KV**: MQA 下 KV 只有一份，所有 query 头共享。
- **矩阵乘维度**: qi [H, d] @ K_block.T [d, blk] = scores [H, blk]
- **多头并行**: 一次 GEMM 即可计算所有头的注意力分数。
- **对比 MHA**: MHA 需要 H 次独立 gather + H 次 GEMM。

::pulse [「 MQA 的计算优势在 Sparse Kernel 中充分体现——单头 KV 让多头并行成为可能。 」] ::

---

# 49 / Summary

## V4 注意力方案全景回顾

- **HCA**: block-level 强压缩（ratio=128），负责全局信息理解。
- **CSA**: token-level 稀疏选取 + 轻量压缩（ratio=4），负责精确注意力建模。
- **SWA**: 局部窗口（128 token），近场兜底。
- **MQA**: 单头 KV + 分组投影，减少 KV-Cache + 控制输出参数。
- **Sparse Kernel**: 逐 query 块式 gather，零浪费计算。

::pulse [「 block-level 全局 + token-level 精确 + 局部窗口兜底。 」] ::

---

# 50 / Summary

## V4 训练策略：先短后长

- **初始阶段**: SWA 为初始训练兜底，模型先学会局部注意力。
- **渐进学习**: 随着训练推进，逐步学会压缩和稀疏。
- **退化安全**: HCA/CSA 退化为 SWA 时仍可兜底，不会训练崩溃。

::pulse [「 先学会走再学会跑——SWA 兜底确保训练稳定性。 」] ::

---

# 51 / Take A Ways

## Take A Ways

- **Q1 → A1**: 标准注意力 → Mask-Free（减量）→ Top-K（选择性）→ 压缩（降维）→ 滑窗（局部），==每层解决一个具体问题==。
- **Q2 → A2**: Mask-Free 逐 query 拉取 KV 真正减少计算；Top-K Pre 模式先选后算避免 O(L^2)，是 V4 Sparse Kernel 的基础。
- **Q3 → A3**: 压缩注意力的数学直觉是"距离越远压缩越狠"，工程限制是位置编码对齐和因果泄漏，由 HCA/CSA 各自解决。
- **Q4 → A4**: Compressor 用可学习投影做因果强压缩，信息空缺由 SWA 填补——HCA 不独立运行。
- **Q5 → A5**: Indexer 做稀疏选取保证精度，Compressor 弥补全局信息，overlap 消除段间断裂，统一 Softmax 归一化。
- **Q6 → A6**: Wo 拆成 Wo_a + Wo_b 两段分组投影，128x512=65536 → 分组后参数量从 O(D^2) 降到 O(D*r)。

::pulse [「 V4 注意力方案整体是 NSA + DSA 的有机融合——block-level 全局 + token-level 精确 + 局部窗口兜底，Sparse Kernel 逐 query 零浪费计算。 」] [fragment] ::

---

# 52 / Reference

## Reference

- **手撕 DeepSeek-V4 (2) : 注意力方案** - 小冬瓜AIGC - https://mp.weixin.qq.com/s/824ZVhBvdvHroA_nJyoj-g
- **DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence** - DeepSeek Team
- **NSA: Native Sparse Attention: Hardware-Aligned and Natively Trainable Sparse Attention** - https://arxiv.org/abs/2502.11089
- **DSA: DeepSeek Sparse Attention** - DeepSeek Team
- **手撕 DeepSeek-V4 (1) : 模型架构** - https://zhuanlan.zhihu.com/p/2032043071395869284
- **手撕NSA：DeepSeek新作-原生稀疏注意力** - https://zhuanlan.zhihu.com/p/24841366485
- **手撕 DSA：DeepSeek-V3.2 的 Sparse Attention** - https://zhuanlan.zhihu.com/p/1957032283270812718
- **DeepSeek-V4-mini 代码仓库** - https://github.com/dhcode-cpp/DeepSeek-V4-mini
