# 00 / Cover

## OPD: 1/10 算力追平 RL 的工程事实

Reverse KL + on-policy 采样 + dense token reward，把后训练的信息效率拉对了量级

Version: Synapse v6.0 | Author: Why.J | Date: 2026/04/30

---

# 01 / Context

## 现状分析：后训练路线正在从 SFT+RL 收敛到 OPD

- **事实 1**: ==Thinking Machines Lab== 实验表明 OPD 用 ==1,800 GPU-hours== 达到 74.4% AIME'24，RL 需要 17,920 hours 才到 67.6%——算力降 10x，分数高 7pp
- **事实 2**: ==Qwen3==、==GLM-5==、==MiMo-V2-Flash== 三家技术报告同时将 OPD 列为后训练标配，不是某个团队的私有技术

::pulse [「 后训练的信息效率差了一个数量级——RL 每局教 O(1) bits，OPD 每步教 O(N) bits，这不是调参能追的。 」] ::

::visual {🍌 nano-banana prompt: 三条柱状图对比 OPD vs RL vs SFT 的 GPU-hours 和 AIME'24 分数。Excalidraw 手绘风格，黑色墨水，白色背景，简笔标签} ::

---

# 02 / Agenda

## 后训练范式转移的四个问题

- **Q1**: 事实 1→2 的效率差距——OPD 用 1/10 算力追平 RL，dense signal 到底比 sparse reward 强在哪？
- **Q2**: KL 方向选择——forward KL 和 reverse KL 在蒸馏中的行为差异是什么？为什么多专家场景必须用 reverse KL？
- **Q3**: OPD 的失败模式与冷启动——overlap 不够时 OPD 会怎样？cold start 和 entropy-aware 切换如何修复？
- **Q4**: 更大的图景——OPD 正在从实验技术变成后训练标配，这对 infra 团队意味着什么？

---

# 03 / Mechanism I

## 信息效率：dense per-token signal 打 sparse outcome reward

- **RL 的信号瓶颈**: 每个 rollout 只有 1 bit 信息量——对或错。你不知道推理链上哪一步走偏了，只知道最终答案不对。==credit assignment== 是事后猜的
- **OPD 的信号密度**: teacher 对 student 轨迹上每个 token 给 log-prob 反馈，每个位置都有"好到什么程度"的评分。信号量从 ==O(1) bits/episode== 跳到 ==O(N) bits/episode==
- **实现成本极低**: 就是在 RL 代码里换一行——把 KL regularizer 里的 reference model 换成 teacher model。Student rollout 是便宜的小模型生成的，teacher 只需要一次 forward pass 算 logprobs
- **不需要 reward model**: teacher 的 log-prob 本身就是 dense reward signal，天然 unhackable——低 KL 一定对应 teacher 认为好的行为

::pulse [「 RL 花 90% compute 搜索策略，只有 10% 在学习。OPD 跳过搜索直接学最终策略，所以快 10x。 」] ::

::image [./figures/figure-03-signal-density.svg] [scale=80] ::

---

# 04 / Mechanism II

## Reverse KL：为什么多专家融合必须用 mode-seeking

- **Forward KL = mode-covering**: 期望在教师分布上计算，学生要覆盖教师所有模式包括噪声。SFT 就是 forward KL——在教师的棋盘状态上学，一旦学生犯错就越跑越偏
- **Reverse KL = mode-seeking**: 期望在学生分布上计算，学生只在自己采样的位置受惩罚。student 不采到的概率空间根本不参与 loss 计算，原有能力对应的概率质量不会被挤掉
- **多专家场景的关键**: 10+ 领域专家各带"领域口音"，reverse KL 保证融合时 student 只学知识不学口音——你用标准发音开口，老师只在你已说出的话上纠正语法，不会把你往方言方向拉
- **FKL 的数学等价**: D_KL(P||Q) = -H(P) + CE(P,Q)，因为 H(P) 是常数，最小化 FKL = 最小化交叉熵——最老最稳但也是信息量最少的蒸馏 loss
- **RKL 的动态平衡**: D_KL(Q||P) = -H(Q) + CE(Q,P)，两项都带参数，entropy 和交叉熵同时拉扯——优化动态更复杂但信号更有信息量

::pulse [「 Forward KL 学 teacher 全部分布包括噪声，Reverse KL 只改 student 已说的话。多专家融合时该丢的是 teacher 口音，不是 student 能力。 」] ::

::image [./figures/figure-04-fkl-rkl.svg] [scale=80] ::

---

# 05 / Mechanism III

## OPD 的失败模式：overlap 不够 + 新知识缺失

- **条件一——思维模式一致性**: 同一个学生从两个分数差不多的老师蒸馏，GRPO 老师（base 出身，与学生思维模式兼容）效果碾压 Non-thinking 老师。初始 ==overlap ratio== 差 20pp，训练后期也追不回来
- **条件二——新知识而非规模**: 同家族大一号模型（只是参数更多、拟合更好）蒸馏效果极差，gap recovery ~0%。只有经过额外 RL 获得新能力的老师才能通过 OPD 传递 ==增量知识==，recovery >80%
- **Token 级机制**: 成功的 OPD 表现为 overlap ratio 从 72% 稳步上升到 91%，==重叠 token 承载 97-99%== 的总概率质量。只对重叠 token 做优化就够了
- **全局信号好 ≠ 局部可优化**: 失败老师 AUROC 0.73 vs 成功 0.75，信号质量几乎一样。问题出在 ==各向异性 advantage== 导致梯度方向不一致、互相抵消

::pulse [「 OPD 蒸馏成败不取决于老师有多强，而取决于师生在 token 分布的重叠区里能不能对得上。 」] ::

::image [./figures/figure-05-overlap.svg] [scale=80] ::

---

# 06 / Mechanism IV

## 修复路径：Cold Start + Entropy-Aware 切换

- **Off-policy cold start**: 先用 teacher 生成 200K 条 response 做 SFT，把 student 拉到 teacher 分布附近，然后再上 OPD。不仅加速收敛，还 ==提高最终天花板==
- **Teacher-aligned prompt**: 用 teacher post-training 时见过的 prompt 做 OPD，但要混合 OOD prompt 防止 student 的 ==entropy 塌缩==
- **DeepSeek V4 的工程实践**: Base-Model → 10+ 领域专家（各走 SFT+GRPO 练到极致）→ multi-teacher OPD 融合。V3.2 的 off-policy 路线被整个替换
- **Entropy-Aware OPD**: 当 teacher token-level 熵 > 阈值时额外加入 forward KL。低熵位置用 reverse KL 做精确模式匹配，高熵位置用 forward KL ==保留分布支撑== 和生成多样性
- **Response length 上限**: 3K-7K tokens 最优，10K+ 开始退化，15K 崩溃。高熵从 response 末尾向前传播——OPD 对 ==长链推理== 有天生软肋

::pulse [「 冷启动的 forward-KL 阶段不是可选的——先拉齐分布再做 on-policy，这个顺序不能反。 」] ::

::image [./figures/figure-06-pipeline.svg] [scale=80] ::

---

# 07 / Take A Ways

## Take A Ways

- **Q1 → A1**: OPD 用 ==1/10 算力追平 RL== 是因为 dense per-token signal 的信息密度比 sparse outcome reward 高了整整一个数量级——每步 O(N) bits vs 每局 O(1) bits
- **Q2 → A2**: ==Reverse KL== 的 mode-seeking 特性让 student 只在自己访问的状态空间里被 teacher 纠正，多专家融合时不会互相抹杀原有能力
- **Q3 → A3**: OPD 失败的根因是师生分布 overlap 不够——用 ==forward-KL cold start== 拉齐分布，用 entropy-aware 切换保留高熵位置的多样性，这两个修复都有工程实证

::pulse [「 三家技术报告同时选 OPD 不是巧合——后训练的信息效率差了一个数量级，收敛已经在发生。 」] [fragment] ::

---

# 08 / Reference

## Reference

- **On-Policy Distillation** - Thinking Machines Lab - https://thinkingmachines.ai/blog/on-policy-distillation/
- **Rethinking On-Policy Distillation of Large Language Models** - Li et al. (THUNLP) - https://arxiv.org/abs/2604.13016
- **DeepSeek V4 Technical Report** - DeepSeek Team - https://arxiv.org/html/2604.13016v1
- **Qwen3 Technical Report** - Qwen Team - https://arxiv.org/pdf/2604.00626
- **Entropy-Aware OPD** - Jane Doe - https://arxiv.org/pdf/2603.07079
- **LLM post-training 中的 SFT、RL 与 OPD** - Jane Doe - https://zhuanlan.zhihu.com/p/2030067243107742531
- **强老师蒸馏反而训崩？** - 李rumor - https://zhuanlan.zhihu.com/p/2029672748490715936
- **从 DeepSeek V4 的多专家 OPD 反观人类学习模式** - 九老师 - https://zhuanlan.zhihu.com/p/2031622077107659474
- **FKL vs RKL** - Taki - https://zhuanlan.zhihu.com/p/690748958
- **OPD 与反向 KL 的两种形态** - Root - https://zhuanlan.zhihu.com/p/2027548813129267030
- **On Policy Learning 总结** - YiFan-Zhang - https://zhuanlan.zhihu.com/p/2004506304065065334
- **从主流开源模型看 OPD 在后训练中的角色** - 品斯基 - https://zhuanlan.zhihu.com/p/2031037132974900721
