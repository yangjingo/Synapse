# Metadata
Category: 后训练
Date/Author: 2026/05/08 · yangjing
Page title: OPD (On-Policy Distillation) 从DeepSeekV4中的后训练方法，学到的心得体会

# TITLE
OPD (On-Policy Distillation)

从DeepSeekV4中的后训练方法，学到的心得体会

## LEAD
DeepSeekV4 技术报告重点在讲架构和基础设施，训练算法只提了一个东西——OPD。但不止 V4，Qwen3、GLM-5、MiMo-V2-Flash 也都把 OPD 列为标配。这不是哪家独有的招，是行业在收敛。OPD 的思路很直觉：先让学生自己做题，老师再沿着学生的思路逐 token 纠正。核心就是从 Forward KL 换成 Reverse KL，信号密度直接从 O(1) 跳到 O(N)。

## SECTIONS

### Section 1: 现状：后训练路线正在从 SFT+RL 收敛到 SFT-OPD-RL
Type: text
Body: V4 的技术报告大部分在讲架构变化和基础设施，训练算法几乎没展开。唯一重点提的就是 OPD。不只是 V4，[Qwen3](https://arxiv.org/pdf/2604.00626)、[GLM-5](https://arxiv.org/abs/2602.15763)、[MiMo-V2-Flash](https://arxiv.org/abs/2601.02780) 的技术报告里也都把 OPD 列为后训练标配。不是 DeepSeek 一家的私房菜。现在模型迭代太快了，半年一代，版本月月发。怎么跟上这个节奏，是每个团队都要想的问题。要理解 OPD 为什么重要，先得回到 R1 时代，看看后训练的路线是怎么一步步走到今天的。
Callout: R1 当年让 GRPO 变成后训练标配，V4 现在让 OPD 走了同样的路——后训练流水线多了一道标准工序，各家在这个基础上各显神通。

### Section 2: Context 图表
Type: figure
Image: ./figure/figure1.png
Caption: Figure 1: R1 的训练流水线——先用 RL 激活推理能力，再用 SFT 稳定输出格式，最后再上 RL 精调。这个 RL→SFT→RL 的三段式，定义了后训练的基本骨架

### Section 3: Context 图表 II
Type: figure
Image: ./figure/figure2.png
Caption: Figure 2: R1 系列的演进路线——从 V3 Base 到 R1-Zero（纯 RL，无 SFT），再到 R1（加入冷启动 SFT），最后 Distill 到各个小模型。这个路线图说明：后训练不是一步到位的，是多阶段的接力赛

### Section 4: 从传统蒸馏到 OPD：Forward KL → Reverse KL
Type: text
Body: 看完 R1 的路线，核心问题来了：V4 的后训练到底改了什么？答案就一个——把蒸馏的 KL 方向反过来了。

V3 那套 off-policy 蒸馏，说白了就是老师提前写好标准答案，学生照着背。Teacher 生成固定的 response，Student 去拟合它。这是 Forward KL，期望算在教师分布上。V4 的做法反过来：Student 先自己做一遍推理，Teacher 再对着学生的回答，逐 token 给 log-prob 反馈。这是 Reverse KL，期望算在学生分布上。[THUNLP 的论文](https://arxiv.org/abs/2604.13016)把这个区别讲得很透彻——这一换，信号密度直接从 O(1) 跳到 O(N)。下面这张图就是 V4 用这个思路整合多专家的流程。
Callout: 传统蒸馏是老师让学生硬背解题思路，OPD 是老师顺着学生的解题思路一步步纠正（token-level dense reward）。

### Section 5: Mechanism I 图示
Type: figure
Image: ./figure/figure3.png
Caption: Figure 3: V4 的多专家 OPD 整合——10+ 领域专家（Prover/Math2/Coder 等）各自练到极致，再通过 multi-teacher OPD 融合成统一模型。32T tokens 的规模，V3 的 off-policy 路线被整个替换

### Section 6: OPD 的本质：SFT 的拓展，RLVR 的补充
Type: text
Body: 理解了 KL 方向的区别，OPD 在整个后训练流程里的定位就清楚了。它不是替代 SFT 或 RL，而是夹在中间，承上启下。

对 SFT 来说，OPD 是一种拓展。V4 报告里列了好几个专家模型——DeepSeek-Prover、Math2、Coder、V3——集百家之长，分阶段训练，有 mode-seeking 效果。不会死记硬背。对 RLVR 来说，OPD 是补充。[Thinking Machines Lab 的解读](https://thinkingmachines.ai/blog/on-policy-distillation/)也提到了：OPD 提供 token 级别的 dense reward，但不需要更新 policy model 的权重。训练更稳定，对基础设施也友好。

各家现在的共识是 SFT → OPD → RL。[Qwen3](https://arxiv.org/pdf/2604.00626) 和 [MiMo](https://arxiv.org/abs/2601.02780) 的技术报告都验证了这个路线。OPD 放中间，先学会走再学跑。下面几张图分别展示了 Forward KL 和 Reverse KL 的区别、MiMo 的三阶段做法、以及 V4 的多专家 OPD 整合。
Callout: OPD 的优点会在 26 年产生更多衍生工作，尤其是对中小团队——能获得比 SFT 更强、比 RL 更稳定易用的算法。

### Section 7: OPD 定位图
Type: figure
Image: ./figure/figure6.png
Caption: Figure 4: Forward KL 和 Reverse KL 的根本区别——Forward KL 是老师出题学生背，期望在教师分布上计算，容易出现 mode collapsing；Reverse KL 是学生先做题老师再逐 token 纠正，期望在学生分布上计算，信号更密、分布匹配更准

### Section 8: Mechanism II 图示
Type: figure
Image: ./figure/figure5.png
Caption: Figure 5: MiMo-V2-Flash 的三阶段后训练——先 SFT 打底，再分领域训练专家（Search/Code/Math 等），最后用 MOPD 做 token-level + seq-level 的双重复蒸馏。这是各家 SFT→OPD→RL 路线的一个具体实例

### Section 9: Mechanism II 图示 II
Type: figure
Image: ./figure/figure4.png
Caption: Figure 6: V4 多专家 OPD 的完整流程（82T tokens 版本）——Base Model 训练多个领域专家，每个专家独立走 SFT+GRPO 练到极致，最后 multi-teacher OPD 把所有专家的知识融合到一个模型里

### Section 10: OPD 成功的条件：思维模式一致性 + 增量知识
Type: text
Body: OPD 听起来很好用，但不是拿过来就能跑的。[THUNLP 的论文](https://arxiv.org/abs/2604.13016)做了两组对比实验，[YiFan-Zhang 的总结](https://zhuanlan.zhihu.com/p/2004506304065065334)也梳理过，说清楚了两件事。

第一个条件是思维模式要一致。同一个学生，从两个分数差不多的老师蒸馏。GRPO 老师（跟学生同源，思维模式兼容）效果碾压 Non-thinking 老师。初始 overlap ratio 就差了 20pp，训练到后面也追不回来。师生之间得先有共同语言，OPD 才能发挥作用。

第二个条件是老师得有新知识，而不只是参数更大。同家族大一号的模型蒸馏效果极差，gap recovery 接近 0%。只有经过额外 RL 训练、获得了新能力的老师，才能通过 OPD 传递增量知识，recovery 超过 80%。光靠大没用，得靠"会的东西不一样"。

### Section 11: OPD 成功的经验：Cold Start + Entropy-Aware
Type: text
Body: 知道坑在哪了，下一个问题是：怎么避坑？各家积累了几条实战经验。

先说 cold start。用 teacher 生成 200K 条 response 做 SFT，把 student 拉到 teacher 附近。然后再上 OPD。[THUNLP 的论文](https://arxiv.org/abs/2604.13016)验证了这一步的效果：不仅收敛更快，最终天花板也更高。这一步不能跳过——先拉齐分布再做 on-policy，顺序反了就废了。

再说 prompt 选择。用 teacher 训练时见过的 prompt 做 OPD，但要混一些 OOD prompt，防止 student 的 entropy 塌缩。

V4 报告里写了实际做法：Base-Model → 10+ 领域专家（各自练到极致）→ multi-teacher OPD 融合。V3 那套 off-policy 路线被整个替换掉了。下面这张图把 Forward KL 和 Reverse KL 的优化过程画得很清楚。
Callout: 冷启动的 forward-KL 阶段不是可选的——先拉齐分布再做 on-policy，这个顺序不能反。

### Section 12: 失败模式图示
Type: figure
Image: ./figure/figure7.png
Caption: Figure 7: 两种蒸馏范式的优化过程对比——左侧 Forward KL (SFT) 中 Student 被动学习 Teacher 的输出分布，右侧 Reverse KL (OPD) 中 Student 主动 rollout、Teacher 逐 token 评估。方向不同，信号密度差了一个数量级

### Section 13: 对个人和团队的启发
Type: text
Body: 技术聊完了，最后说点题外话。[九老师](https://zhuanlan.zhihu.com/p/2031622077107659474)有一篇文章，标题就叫"从 DeepSeek V4 的多专家 OPD 反观人类学习模式"，把 OPD 的训练范式跟人和人之间的学习做了类比，我觉得很有道理。

个人方面——从"要我学"变成"我要学"。碰到新问题，先自己想一遍，想完再找专家看自己的推理链哪里有问题。别被动等着喂。学习也要分阶段。从 SFT 到 RL 一步到位太难了。借鉴 OPD 的思路：先自己思考，再分别找不同专家指导，学起来更稳。

团队方面——OPD 有个反直觉的结论：分数越高的老师，不一定教得最好。关键是 thinking pattern consistency，大家得有相同的思维模式。怎么做到？多分享、多交流。论文、技术解读、甚至书籍和电影都行。关键是分享原始的、一手的信息。

### Section 14: Reference
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
26 年 OPD 已经变成后训练的基本标配，我们也要训练 LLM/Agent 一样来训练自己。
