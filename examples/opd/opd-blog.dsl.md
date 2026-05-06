# Metadata
Category: 后训练
Date/Author: 2026/05/08 · yangjing
Page title: OPD 不是 DeepSeek 的私有技术，它是 26 年后训练的标准件

# TITLE
OPD 不是 DeepSeek 的私有技术，它是 26 年后训练的标准件

## LEAD
DeepSeekV4 的技术报告重点讲的是 arch 和 infra，训练算法只介绍了 OPD。但不仅仅 V4——Qwen3、GLM-5、MiMo-V2-Flash 三家同时把 OPD 列为后训练标配。这不再是 R1+GRPO 那种独家震撼，而是行业收敛。OPD 做的事情很直觉：让学生先自己推理，老师顺着学生的思路逐 token 纠正。本质是从 Forward KL 切到 Reverse KL，信号密度从 O(1) 跳到 O(N)。

## SECTIONS

### Section 1: 事实：26 年发布的模型，后训练路线同时收敛到 SFT→OPD→RL
Type: text
Body: DeepSeekV4 技术报告里，训练算法和数据部分只重点介绍了 OPD。在此之前，Qwen3、GLM-5、MiMo-V2-Flash 三家的技术报告也同时将 OPD 列为后训练标配环节。这不是某一家团队的私有技术，而是 26 年模型迭代速度加快（半年代际更新、月度版本发布）背景下，后训练路线的自然收敛。
Callout: V4 的 OPD 的地位，类似于 R1 的 GRPO 的地位——可能会把各家后训练的工序添加一个标准件，衍生出各种变体。

### Section 2: 从传统蒸馏到 OPD：Forward KL → Reverse KL
Type: text
Body: V3 的 off-policy 蒸馏是老师提前写好标准答案，学生死记硬背。Teacher 生成固定 response，Student 照着拟合——本质是 Forward KL，期望在教师分布上计算。V4 的 On-Policy 蒸馏换了个方向：Student 先自己 rollout 推理一次，Teacher 对轨迹上每个 token 给 log-prob 反馈——本质是 Reverse KL，期望在学生分布上计算。
Callout: 传统蒸馏是老师让学生硬背解题思路，OPD 是老师顺着学生的解题思路一步步纠正。信号密度从 O(1) bits/episode 跳到 O(N) bits/episode。

### Section 3: Forward KL vs Reverse KL 的直观对比
Type: figure
Image: ./figure/figure3.png
Caption: Figure 1: 传统蒸馏（Forward KL）vs OPD（Reverse KL）的分布匹配差异

### Section 4: OPD 的定位：SFT 的拓展，RLVR 的补充
Type: text
Body: OPD 对 SFT 的拓展在于充分利用已有模型的能力——借助多个已有专家（DeepSeek-Prover/Math2/Coder/V3）集百家之长，分阶段有节奏地训练，有 mode-seeking 的效果。OPD 对 RLVR 的补充在于提供了 token-level 的 dense reward，但训练过程不需要更新 policy model 的权重，模型训练更加稳定，对 infra 也更友好。各家共识是 SFT→OPD→RL 的多阶段方案，OPD 放在中间承上启下。
Callout: OPD 的优点会在 26 年产生更多衍生工作，尤其是对中小团队——能获得比 SFT 更强、比 RL 更稳定易用的算法。

### Section 5: OPD 在后训练流程中的位置
Type: figure
Image: ./figure/figure6.png
Caption: Figure 2: SFT→OPD→RL 多阶段方案——OPD 承上启下

### Section 6: OPD 的信号密度对比
Type: figure
Image: ./figure/figure5.png
Caption: Figure 3: OPD vs 传统蒸馏 vs RL 的信号密度对比

### Section 7: OPD 的补充说明
Type: figure
Image: ./figure/figure4.png
Caption: Figure 4: Multi-Teacher OPD 的工作流程

### Section 8: OPD 成功的条件：思维模式一致性 + 增量知识
Type: text
Body: 同一个学生从两个分数差不多的老师蒸馏，GRPO 老师（base 出身，与学生思维模式兼容）效果碾压 Non-thinking 老师。初始 overlap ratio 差 20pp，训练后期也追不回来。同家族大一号模型（只是参数更多、拟合更好）蒸馏效果极差，gap recovery ~0%。只有经过额外 RL 获得新能力的老师才能通过 OPD 传递增量知识，recovery >80%。

### Section 9: OPD 成功的经验：Cold Start + Entropy-Aware
Type: text
Body: 先用 teacher 生成 200K 条 response 做 SFT，把 student 拉到 teacher 分布附近，然后再上 OPD——不仅加速收敛，还提高最终天花板。用 teacher post-training 时见过的 prompt 做 OPD，但要混合 OOD prompt 防止 entropy 塌缩。DeepSeek V4 的工程实践是 Base-Model → 10+ 领域专家（各走 SFT+GRPO 练到极致）→ multi-teacher OPD 融合，V3 系列的 off-policy 路线被整个替换。
Callout: 冷启动的 forward-KL 阶段不是可选的——先拉齐分布再做 on-policy，这个顺序不能反。

### Section 10: 失败模式与修复流程
Type: figure
Image: ./figure/figure7.png
Caption: Figure 5: OPD 失败模式诊断与修复——overlap→cold start→entropy-aware

### Section 11: 对个人和团队的启发
Type: text
Body: 对个人学习的启发：从要我学到我要学——面对新的问题，应该优先自己先进行 Rollout 推理，然后再找专家指导 COT 哪里有问题，而不是被动接受。分阶段的学习——好的模型从来不是一蹴而就的，通过先思考再分别找不同的专家进行指导，学起来更加稳定和丝滑。对团队的启发：分数越强的老师未必能教出最好的学生，关键在于 thinking pattern consistency。提高团队 thinking pattern consistency 的方法是多分享（论文/技术解读，甚至书籍和电影）和多交流，分享原始的一手输入信息。

### Section 12: Reference
Type: reference
- **DeepSeek V4 Technical Report** - DeepSeek Team - https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro/blob/main/DeepSeek_V4.pdf
- **Rethinking On-Policy Distillation of Large Language Models** - Li et al. (THUNLP) - https://arxiv.org/abs/2604.13016
- **Qwen3 Technical Report** - Qwen Team - https://arxiv.org/pdf/2604.00626
- **GLM-5: from Vibe Coding to Agentic Engineering** - https://arxiv.org/abs/2602.15763
- **MiMo-V2-Flash Technical Report** - https://arxiv.org/abs/2601.02780
- **On-Policy Distillation** - Thinking Machines Lab - https://thinkingmachines.ai/blog/on-policy-distillation/
- **The Illustrated DeepSeek-R1** - Jay Alammar - https://newsletter.languagemodels.co/p/the-illustrated-deepseek-r1
- **万字长文总结 RL/on policy distillation 的一些进展** - YiFan-Zhang - https://zhuanlan.zhihu.com/p/2004506304065065334
- **从 DeepSeek V4 的多专家 OPD 反观人类学习模式** - 九老师 - https://zhuanlan.zhihu.com/p/2031622077107659474

## PULSE
26 年 OPD 已经变成后训练的基本标配，我们也要像训练 LLM/Agent 一样来训练自己。
