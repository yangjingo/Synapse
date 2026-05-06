# 00 / Cover

## OPD (On-Policy Distillation) 

从DeepSeekV4中的后训练方法，学到的心得体会

Version: Synapse v1.0.0(git@github.com:yangjingo/Synapse.git) | Author: YangJing | Date: 2026/05/08

---

# 01 / Context

## 现状分析：后训练路线正在从 SFT+RL 收敛到 SFT-OPD-RL

- **事实 1**: === DeepSeekV4 === 的技术报告之中，重点介绍的是arch变化和Infra的细节，对于训练算法没有过多介绍。==关于训练算法和数据，仅重点介绍了OPD的内容 ==；
- **事实 2**: 不仅仅是==V4==，在这之前==Qwen3==、==GLM-5==、==MiMo-V2-Flash== 三家技术报告同时将 OPD 列为后训练标配环节，并不是DeepSeek团队的私有技术（不再是当初的R1+GRPO的那种独家震撼）；
- **事实 3**：如今模型的迭代的速度越来越快 ==半年为一个代际的更新， 版本以月度来进行发布 == ，如何借鉴模型的迭代方法和知识更新的速度越来越快；

::pulse [「 V4 的 OPD 的地位 vs R1 的 GRPO 的地位，可能会把各家后训练的工序添加一个标准件，衍生出各种变体 」] ::
::image [./figure/figure1.png] [scale=80] ::
::image [./figure/figure2.png] [scale=80] ::

---

# 02 / Agenda

## 从 DeepSeekV4 学习 OPD 想分享的几个问题

- **Q1**: 重读 DeepSeek R1/V3 到 V4 的技术报告，从一个模型训练角度来看，从 R1/V3 到 V4的变化是什么？
- **Q2**: 后训练方向选择——为什么 26 年发布的模型（GLM/Qwen/Mimo/DeepSeek）报告里都提到了 OPD，OPD 的具体的工作流程是什么？
- **Q3**: OPD 的失败模式与冷启动——OPD的本质是什么，做好 OPD 需要注意哪些方面？
- **Q4**: 一点题外话——V4 的 OPD 训练范式，这对个人训练/学习有何启发？

---

# 03 / Mechanism I

## 从传统蒸馏到 OPD：Student 自己先推理，Teacher 逐 token 纠正

- **V3 的 off-policy 蒸馏**：老师提前写好标准答案，学生死记硬背。Teacher 生成固定 response，Student 照着拟合——本质是 ==Forward KL==，期望在教师分布上计算
- **V4 的 On-Policy 蒸馏**：Student 先自己 rollout 推理一次，Teacher 对轨迹上每个 token 给 log-prob 反馈——本质是 ==Reverse KL==，期望在学生分布上计算

::pulse [「 传统蒸馏是老师让学生硬背解题思路，OPD 是老师顺着学生的解题思路一步步纠正（token-level  dense reward）。 」] ::

::image [./figure/figure3.png] [scale=120] ::

---

# 04 / OPD 的本质

## OPD 是 SFT 的拓展，也是 RLVR 的补充——承上启下

- **OPD 对 SFT 的拓展**：充分利用已有模型的能力，借助多个已有专家（DeepSeek-Prover/Math2/Coder/V3）==集百家之长==，分阶段有节奏地训练，而且不是死记硬背，有 mode-seeking 的效果
- **OPD 对 RLVR 的补充**：提供了 token-level 的 dense reward，但训练过程==不需要更新 policy model 的权重==，模型训练更加稳定，对 infra 也更加友好
- **各家共识**：GLM-5 / DeepSeekV4 / MiMo / Qwen 现在透露出来的方案都是 ==SFT → OPD → RL== 的多阶段方案，OPD 放在两者中间，起到承上启下的作用，后续纯 RL 的过程训练会更加稳定

::pulse [「 OPD 的优点会在 26 年产生更多衍生工作，尤其是对中小团队——能获得比 SFT 更强、比 RL 更稳定易用的算法。 」] ::

::image [./figure/figure6.png] [scale=120] ::

---

# 05 / Mechanism II

## OPD 是 SFT 的拓展，也是 RLVR 的补充——Cont


::image [./figure/figure5.png] [scale=100] ::


# 06 / Mechanism II

## OPD 是 SFT 的拓展，也是 RLVR 的补充——Cont


::image [./figure/figure4.png] [scale=100] ::



---

# 07 / Mechanism III

## 失败模式与修复：overlap 不够 → Cold Start + Entropy-Aware

OPD成功的条件

- **条件一——思维模式一致性**：同一个学生从两个分数差不多的老师蒸馏，GRPO 老师（base 出身，与学生思维模式兼容）效果碾压 Non-thinking 老师。初始 ==overlap ratio== 差 20pp，训练后期也追不回来
- **条件二——新知识而非规模**：同家族大一号模型（只是参数更多、拟合更好）蒸馏效果极差，gap recovery ~0%。只有经过额外 RL 获得新能力的老师才能通过 OPD 传递==增量知识==，recovery >80%


OPD成功的经验

- **Off-policy cold start**：先用 teacher 生成 200K 条 response 做 SFT，把 student 拉到 teacher 分布附近，然后再上 OPD。不仅加速收敛，还==提高最终天花板==
- **Teacher-aligned prompt**：用 teacher post-training 时见过的 prompt 做 OPD，但要混合 OOD prompt 防止 student 的==entropy 塌缩==
- **DeepSeek V4 的工程实践**：Base-Model → 10+ 领域专家（各走 SFT+GRPO 练到极致）→ multi-teacher OPD 融合。V3系列的 的 off-policy 路线被整个替换


::pulse [「 冷启动的 forward-KL 阶段不是可选的——先拉齐分布再做 on-policy，这个顺序不能反。 」] ::

::image [./figure/figure7.png] [scale=120] ::

---

# 07 / 心得体会

## 对于个人和团队的启发

对于个人的学习的启发

- 从 SFT到OPD 到RL ——" ==从要我学到我要学==， 面对新的问题，我们应该优先自己先进行Rollout推理之后，然后再去找专家的进行指导我的COT哪里有问题，而不仅仅是被动的接受"
- 分阶段的学习 —- "好的模型从来不是一蹴而就的，从SFT到RL的难度很大，一次训练一个全能的六边形战士（上中下）是很难的。但是借鉴OPD的思路，==通过先思考再分别找不同的专家进行指导，学起来更加稳定和丝滑=="

对于团队而言的启发

- OPD的一些反直觉的内容，分数越强的老师未必能够教出最好的学习，关键在于有一个好的 thinking pattern consistency（大家有相同的思维模式），如何提高团队的 thinking pattern consistency 就是多分享 （论文/技术解读，甚至书籍和电影）和多交流，分享原始的一手的输入信息；

---

# 08 / Take A Ways

## Take A Ways

- **Q1 → A1**: 从 V3 到 V4 的变化不在训练算法本身，而在 ==arch 变化（Hybrid Attention + mHC）== 和 Infra。训练算法方面仅引入了 OPD，替代 V3 的 off-policy 蒸馏路线
- **Q2 → A2**: 26 年各家同时选 OPD 不是巧合——OPD 用 ==1/10 算力追平 RL==（dense per-token signal vs sparse outcome reward），Reverse KL 的 mode-seeking 让多专家融合不互相抹杀，已成为后训练标配
- **Q3 → A3**: OPD 失败的根因是师生分布 ==overlap 不够==——用 forward-KL cold start 拉齐分布，用 entropy-aware 切换保留高熵位置的多样性，这两个修复都有工程实证
- **Q4 → A4**: 对个人学习的启发——不要纯 SFT 被动接受，也不要一步到位 RL，可以先==主动 OPD（自己先推理，再找专家指导）==，分领域找不同专家，更加稳定高效



::pulse [「 26 年 OPD 已经变成后训练的基本标配，我们也要训练LLM/Agent一样来训练自己; 」] [fragment] ::

---

# 09 / Reference

## Reference

- **DeepSeek V4 Technical Report** - DeepSeek Team - https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf
- **Rethinking On-Policy Distillation of Large Language Models** - Li et al. (THUNLP) - https://arxiv.org/abs/2604.13016
- **Qwen3 Technical Report** - Qwen Team - https://arxiv.org/pdf/2604.00626
- **GLM-5: from Vibe Coding to Agentic Engineering** - https://arxiv.org/abs/2602.15763
- **MiMo-V2-Flash Technical Report** - https://arxiv.org/abs/2601.02780
- **On-Policy Distillation** - Thinking Machines Lab - https://thinkingmachines.ai/blog/on-policy-distillation/
- **The Illustrated DeepSeek-R1** - Jay Alammar - https://newsletter.languagemodels.co/p/the-illustrated-deepseek-r1
- **万字长文总结 RL/on policy distillation 的一些进展** - YiFan-Zhang - https://zhuanlan.zhihu.com/p/2004506304065065334
- **从 DeepSeek V4 的多专家 OPD 反观人类学习模式** - 九老师 - https://zhuanlan.zhihu.com/p/2031622077107659474
