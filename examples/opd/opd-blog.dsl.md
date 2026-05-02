# Metadata
Category: OPD
Date/Author: 2026/05/02 · yangjing
Page title: OPD — 1/10 GPU-hours 追平 RL 的工程事实

# TITLE
OPD: 1/10 GPU-hours 追平 RL 的工程事实

## LEAD
后训练的信息效率差了一个数量级，而 OPD（On-Policy Distillation）是第一个把这个差距显式量化出来的路线。Thinking Machines Lab 的实验数据很直接：OPD 用 1,800 GPU-hours 达到 74.4% AIME'24，RL 需要 17,920 hours 才到 67.6%。算力降 10x，分数高 7pp。这不是某个团队的私有技术——Qwen3、GLM-5、DeepSeek V4 三家技术报告同时选择了它。本文拆解 OPD 为什么能比 RL 高效一个量级，以及它失败时到底是什么在崩。

## SECTIONS

### Section 1: 现状：10x 算力差距不是调参的结果
Type: text
Body: Thinking Machines Lab 做了一组对照实验，直接把 OPD 和 RL 放在同一个基座上跑。结果很硬：OPD 用 1,800 GPU-hours 拿到 74.4% AIME'24，RL 烧了 17,920 GPU-hours 只到 67.6%。10 倍算力换来的不是微小提升而是 7 个百分点的落后。这不是调 learning rate 或者 batch size 能追回来的差距——是信号机制本身的物理上限。更值得关注的是，Qwen3、GLM-5、MiMo-V2-Flash 三家的技术报告几乎同时把 OPD 列为后训练标配。独立团队、独立 infra、同时收敛到同一条路线，在工程领域这种事情通常意味着一个范式正在替换上一个范式。

### Section 2: 信息效率：dense per-token signal 打 sparse outcome reward
Type: text
Body: RL 的信号瓶颈在于，每个 rollout 只产生 1 bit 信息量——对或错。模型生成了一条 8K token 的推理链，最终答案不对，你只知道"错了"，不知道是第 3 步的逻辑跳转出了问题还是第 7 步的计算失误。Credit assignment 全靠 reward model 事后猜测，猜错了整条链的梯度方向就偏了。OPD 换了一个完全不同的信号机制：teacher 对 student 轨迹上每个 token 都给 log-prob 反馈。每个位置都有"好到什么程度"的连续评分，信号量从 O(1) bits/episode 跳到 O(N) bits/episode。实现成本极低——本质上就是在 RL 代码里换一行，把 KL regularizer 里的 reference model 换成 teacher model。Student rollout 是便宜的小模型生成的，teacher 只需要一次 forward pass 算 logprobs。也不需要额外训练 reward model，teacher 的 log-prob 本身就是 dense reward signal，天然 unhackable——低 KL 一定对应 teacher 认为好的行为。
Callout: RL 花 90% compute 搜索策略，只有 10% 在学习。OPD 跳过搜索直接学最终策略，所以快 10x。信号量从 O(1) bits/episode 到 O(N) bits/episode，这不是调参能追的。

### Section 3: Signal Density 对比
Type: figure
Image: ./figures/figure-03-signal-density.svg
Caption: Figure 1: RL 每个 rollout 只有 1 bit（对/错），OPD 每个 token 都有 log-prob 评分。O(1) vs O(N) bits/episode
Prompt: Signal density comparison: RL sparse reward (1 bit per episode) vs OPD dense per-token log-prob feedback. Show token-level signal arrows along a reasoning chain.

### Section 4: Reverse KL：多专家融合时该丢的是 teacher 口音，不是 student 能力
Type: text
Body: Forward KL 和 Reverse KL 在蒸馏中的行为差异是理解 OPD 的关键。Forward KL 是 mode-covering：期望在教师分布上计算，学生要覆盖教师所有模式包括噪声。SFT 就是 forward KL——在教师的棋盘状态上学，一旦学生犯错就越跑越偏。数学上 D_KL(P||Q) = -H(P) + CE(P,Q)，因为 H(P) 是常数，最小化 FKL 等价于最小化交叉熵，最老最稳但也是信息量最少的蒸馏 loss。Reverse KL 是 mode-seeking：期望在学生分布上计算，学生只在自己采样的位置受惩罚。D_KL(Q||P) = -H(Q) + CE(Q,P)，两项都带参数，entropy 和交叉熵同时拉扯。Student 不采到的概率空间根本不参与 loss 计算，原有能力对应的概率质量不会被挤掉。多专家场景下这个特性尤其关键——10+ 领域专家各带"领域口音"，reverse KL 保证融合时 student 只学知识不学口音。你用标准发音开口，老师只在你已说出的话上纠正语法，不会把你往方言方向拉。
Callout: Forward KL 学 teacher 全部分布包括噪声，Reverse KL 只改 student 已说的话。多专家融合时该丢的是 teacher 口音，不是 student 能力。

### Section 5: FKL vs RKL 分布行为对比
Type: figure
Image: ./figures/figure-04-fkl-rkl.svg
Caption: Figure 2: Forward KL mode-covering（覆盖 teacher 全部模式包括噪声）vs Reverse KL mode-seeking（只优化 student 访问到的概率空间）
Prompt: Probability distribution overlay showing teacher P (bimodal) and student Q. Left: Forward KL forces Q to cover both modes including noise. Right: Reverse KL lets Q focus on nearest mode, preserving student's existing distribution.

### Section 6: OPD 的失败模式：overlap 不够时蒸馏直接崩
Type: text
Body: OPD 不是万能的，它有明确的失败条件。核心问题出在师生分布的 overlap 上。实验数据显示了一个很反直觉的现象：同一个 student 从两个分数差不多的 teacher 蒸馏，GRPO teacher（base 出身，与学生思维模式兼容）效果碾压 Non-thinking teacher。初始 overlap ratio 差 20pp，训练后期也追不回来。同家族大一号模型（只是参数更多、拟合更好）蒸馏效果极差，gap recovery 约 0%。只有经过额外 RL 获得新能力的 teacher 才能通过 OPD 传递增量知识，recovery 超过 80%。Token 级别的机制更清晰：成功的 OPD 表现为 overlap ratio 从 72% 稳步上升到 91%，重叠 token 承载 97-99% 的总概率质量。只对重叠 token 做优化就够了。但全局信号好不等于局部可优化——失败 teacher AUROC 0.73 vs 成功 0.75，信号质量几乎一样。问题出在各向异性 advantage 导致梯度方向不一致、互相抵消。

### Section 7: Overlap 概念图
Type: figure
Image: ./figures/figure-05-overlap.svg
Caption: Figure 3: 成功的 OPD 需要 teacher-student token 分布有足够 overlap。Overlap 从 72% 到 91%，重叠区承载 97-99% 概率质量
Prompt: Venn diagram or distribution overlap visualization showing teacher and student token distributions. Highlight overlap region carrying 97-99% probability mass. Show failed case (low overlap, 72%) vs successful case (high overlap, 91%).

### Section 8: Cold Start + Entropy-Aware：先拉齐分布再做 on-policy
Type: text
Body: OPD 的修复路径已经形成了比较成熟的工程模式。第一步是 off-policy cold start：先用 teacher 生成 200K 条 response 做 SFT，把 student 拉到 teacher 分布附近，然后再上 OPD。这不仅加速收敛，还提高最终天花板。第二步是 teacher-aligned prompt：用 teacher post-training 时见过的 prompt 做 OPD，但要混合 OOD prompt 防止 student 的 entropy 塌缩。DeepSeek V4 的工程实践更激进——Base-Model 先走 10+ 领域专家（各走 SFT+GRPO 练到极致），然后用 multi-teacher OPD 做融合。V3.2 的 off-policy 路线被整个替换掉了。Entropy-Aware OPD 是另一个关键修复：当 teacher token-level 熵超过阈值时额外加入 forward KL。低熵位置用 reverse KL 做精确模式匹配，高熵位置用 forward KL 保留分布支撑和生成多样性。还有一个容易被忽略的细节——response length 上限。3K-7K tokens 最优，10K+ 开始退化，15K 崩溃。高熵从 response 末尾向前传播，OPD 对长链推理有天生软肋。
Callout: 冷启动的 forward-KL 阶段不是可选的——先拉齐分布再做 on-policy，这个顺序不能反。高熵位置加 FKL 保多样性，response length 3K-7K 是安全区间。

### Section 9: DeepSeek V4 Multi-Teacher OPD Pipeline
Type: figure
Image: ./figures/figure-06-pipeline.svg
Caption: Figure 4: DeepSeek V4 后训练 pipeline——Base-Model → 10+ 领域专家 → multi-teacher OPD 融合。Cold start (FKL) → Entropy-Aware OPD (RKL+FKL) 两阶段
Prompt: DeepSeek V4 post-training pipeline: Base Model splits into 10+ domain experts (SFT+GRPO), then multi-teacher OPD fusion. Two stages: Cold Start with FKL alignment, then Entropy-Aware OPD switching between RKL and FKL based on token-level entropy.

### Section 10: 工程启示：三家同时选 OPD 是收敛不是巧合
Type: text
Body: Qwen3、GLM-5、DeepSeek V4 三家的技术报告几乎同时把 OPD 列为后训练标配。独立团队、独立 infra、不同的模型架构，同时收敛到同一条路线。在工程领域这种事情通常意味着范式转移正在发生。对 infra 团队来说，OPD 的工程复杂度比 RL 低一个台阶——不需要训练 reward model，不需要维护复杂的 reward shaping pipeline，不需要担心 reward hacking。Teacher model 的 log-prob 就是 reward signal，天然 unhackable。你需要的只是一个足够好的 teacher 和一套能稳定跑 on-policy 采样的 infra。但 OPD 也有它自己的工程陷阱：师生分布 overlap 不够会直接崩盘，cold start 阶段不能跳过，response length 需要严格控制。这些不是理论问题，是跑实验才会踩到的坑。好消息是这些坑已经有比较成熟的修复方案了。

### Section 11: Reference
Type: reference
- **On-Policy Distillation** - Thinking Machines Lab - https://thinkingmachines.ai/blog/on-policy-distillation/
- **Rethinking On-Policy Distillation of Large Language Models** - Li et al. (THUNLP) - https://arxiv.org/abs/2604.13016
- **Qwen3 Technical Report** - Qwen Team - https://arxiv.org/pdf/2604.00626
- **强老师蒸馏反而训崩？** - 李rumor - https://zhuanlan.zhihu.com/p/2029672748490715936
- **DeepSeek V4 多专家 OPD** - 九老师 - https://zhuanlan.zhihu.com/p/2031622077107659474
- **FKL vs RKL** - Taki - https://zhuanlan.zhihu.com/p/690748958

## PULSE
三家独立技术报告同时选择 OPD 不是巧合——后训练的信息效率差了一个数量级，10x 成本下降不是调参的结果，是范式本身的物理优势。RL 的 sparse reward 天花板已经碰到了，dense per-token signal 才是下一个阶段的起点。
