---

# 00 / Cover

## On-Policy Distillation
### 不是"廉价 RL"，而是一套完全不同的训练几何

whyj + OPD + 2026/04/29

---

# 01 / Context

## 后训练的三体问题

- SFT 统治了 2023，RL 在 2024 崛起，OPD 在 2025-26 成为第三极
- Qwen3、GLM-5、MiMo-V2-Flash 均将 OPD 列为核心管线
- 工业界天天用，但 ==没人彻底搞懂它的边界条件==

::pulse [OPD 不是 SFT 和 RL 的折中——它是第三种几何。] ::

---

# 02 / Agenda

## 四个问题

1. **三种范式到底在优化什么？** — SFT / RL / OPD 的目标函数差异
2. **KL 方向为什么决定一切？** — Forward KL vs Reverse KL 的投影几何
3. **OPD 什么时候有效？** — 9-30x 的效率从哪来
4. **OPD 什么时候崩？** — 强老师悖论与 thinking pattern 对齐

::pulse [搞懂 KL 几何，就搞懂了 OPD 的全部。] ::

---

# 03 / Mechanism I

## 三种后训练，三种学习问题

- **SFT**: 在外部给定轨迹上做条件密度拟合 → Forward KL 投影 → 监督最稠密，但 train/inference 分布不一致
- **RL**: 在自身策略轨迹上最大化期望奖励 → Reverse KL 约束 → 反馈最稀疏，但优化的是解集合
- **OPD**: 在学生生成轨迹上用教师做 token 级稠密对齐 → ==On-policy + Dense signal==

::math [\mathcal{L}_{\text{OPD}}(\theta) = \mathbb{E}_{x \sim D,\; y \sim \pi_\theta} \left[ \sum_{t=1}^{T} \mathcal{D}\big( p_T(\cdot|x,y_{<t}),\; \pi_\theta(\cdot|x,y_{<t}) \big) \right]] ::

::pulse [SFT 记忆轨迹，RL 搜索策略，OPD 对齐分布。] ::

---

# 04 / Mechanism II

## Forward KL vs Reverse KL：投影几何决定泛化

- **Forward KL** (SFT): `D_KL(q || π_θ)` → Mass-covering → 不允许遗漏教师概率质量 → 但窄监督下退化为拟合单条轨迹
- **Reverse KL** (RL/OPD): `D_KL(π_θ || p_T)` → Mode-seeking → 允许忽略教师尾部，只要自己不放出多余质量 → ==多最优解时偏向 KL-minimal solution==

::math [\pi^*(y|x) = \frac{1}{Z(x)}\, \pi_{\text{ref}}(y|x) \exp\!\Big(\frac{r(x,y)}{\beta}\Big)] ::

::reference [Chan et al. - On the Reverse KL and Forward KL] [https://arxiv.org/pdf/2603.25562] ::

::pulse [Forward KL 覆盖，Reverse KL 收缩。方向选错，泛化就崩。] ::

---

# 05 / Mechanism III

## OPD 为什么有效：Dense Signal + On-Policy

**效率证据 (Thinking Machines Lab / Qwen3):**
- SFT-2M 外推到 70% AIME'24 ≈ 3.4×10²¹ teacher FLOPs
- RL 达到 67.6% ≈ 17,920 GPU hours
- OPD 达到 ==74.4% 仅需 1,800 GPU hours==（RL 的 1/10）

**为什么快？**
- RL 每 episode 只教 O(1) bits（末端奖励）
- OPD 每 episode 教 O(N) bits（每个 token 的 KL 教师信号）
- Self-distillation 实验：OPD 用 7-10x 更少的梯度步数复制 RL 策略 → 累计 50-100x 计算效率

::pulse [OPD 不是在压缩 RL 的结果，而是在抄捷径学会 RL 搜索到的策略。] ::

---

# 06 / Mechanism IV

## OPD 为什么会崩：强老师悖论

**反直觉现象：** 更大、更强的老师 → 蒸馏效果反而更差，甚至回退到 pre-RL 水平

**根本原因 (Rethinking OPD):**
1. **Thinking pattern 必须对齐** — 教师的推理风格与学生内部策略差距过大时，OPD 会覆盖学生的有效结构
2. **局部信息量决定成败** — 两个能力差距巨大的教师，如果在学生已访问状态上诱导出相似的局部分布，蒸馏效果几乎一样
3. **高熵 token 的 mode collapse** — 纯 Reverse KL 在教师高熵位置压缩多样性 → Entropy-Aware OPD 需要在高熵区引入 Forward KL

::pulse [决定蒸馏效果的，不是教师有多强，而是教师在学生真正到达的地方有多准。] ::

---

# 07 / Mechanism V

## OPD 的工程定位：胶水层

- **SFT** 打地基：注入领域知识，建立基础行为
- **RL** 精调策略：在解空间中搜索语义策略
- **OPD** 做桥接：用稠密信号将教师能力迁移给学生，成本仅为 RL 的 1/10

**Continual Learning 天然适配：**
- SFT 在模型自身样本上训练仍会退化
- OPD 教师固定、学生 on-policy → 自蒸馏场景下 ==不会退化==
- 新知识 mid-train → OPD 恢复行为 → 可循环迭代

::pulse [OPD 是后训练管线的胶水——连接知识注入与行为塑形。] ::

---

# 08 / Practice

## DeepSeek V4：多专家 OPD 替代 Mixed RL

- **V3.2**: 专家生成数据 → Student SFT → Mixed GRPO RL 补偿（off-policy）
- **V4**: 10+ 领域专家各自 SFT+GRPO → Student rollout → ==多教师在学生轨迹上逐 token 反馈==（on-policy）
- Reverse KL 保护学生已有能力：student 不采样到的 mode 不付代价 → ==领域特化不互相稀释==
- Rethinking OPD 实测：共享 base 的 teacher（overlap 高）效果远胜 benchmark 更高但 pattern 不匹配的 teacher

::pulse [V4 把 OPD 从"蒸馏工具"升级为"专家融合管线"——RL 退居上游专家训练，OPD 接管整合。] ::

---

# 09 / Insight

## 反观人类学习：学校就是多专家 OPD

- **学英语的比喻**: 跟带方言口音的老师学语法 — Forward KL 让你连口音一起学，Reverse KL 只在你开口后纠正语法
- **学霸模式 = Pre-train + OPD**: 先听课拉齐分布，再自己做题，带着卡点问老师 — 在自己生成的轨迹上拿反馈
- **OPD 的前提**: Forward KL 冷启动（认真预习）→ 把 student 拉到能听懂 teacher 反馈的位置 → 然后才能 on-policy
- **LLM 没有改写学习本质**: 它只是把 reverse KL 所需的"高质量专家反馈"从稀缺资源变成了随手可得

::pulse [先用 Forward KL 把自己拉到能听懂反馈的地方，再用 Reverse KL 在自己的轨迹上精修。] [rotate=-2deg] ::

---

# 10 / Takeaways

## 三条铁律

1. **KL 方向是 OPD 的命门** — Reverse KL 的 mode-seeking 在低熵位置是优势，在高熵位置是毒药
2. **教师强度 ≠ 蒸馏质量** — 成败取决于教师在 student-visited states 上的局部信息量，而非全局 benchmark 分数
3. **OPD 是 dense-constrained RL 的特例** — 不是"廉价 RL"，而是一个有独立理论结构和独立失效模式的方法

::pulse [把 OPD 当"便宜 RL"用，是你训崩的开始。] ::

---

# 11 / Reference

## Reference

- **LLM post-training 中的 SFT、RL 与 OPD** - Jane Doe - https://zhuanlan.zhihu.com/p/2030067243107742531
- **On-Policy Distillation** - Thinking Machines Lab - https://thinkingmachines.ai/blog/on-policy-distillation/
- **强老师救不了OPD？** - 李rumor - https://zhuanlan.zhihu.com/p/2029672748490715936
- **从主流开源模型看 OPD 在后训练中的角色** - 品斯基 - https://zhuanlan.zhihu.com/p/2031037132974900721
- **MiniLLM: Knowledge Distillation of LLMs** - Gu et al. - https://arxiv.org/pdf/2306.08543
- **Rethinking On-Policy Distillation** - https://arxiv.org/pdf/2604.06628
- **Entropy-Aware OPD (G-OPD)** - https://arxiv.org/pdf/2602.12125v1
- **RL's Razor** - Shenfeld et al. - https://arxiv.org/pdf/2603.07079
- **从 DeepSeek V4 的多专家 OPD 反观人类学习模式** - 九老师 - https://zhuanlan.zhihu.com/p/2031622077107659474
- **DeepSeek-V4 Technical Report** - https://arxiv.org/pdf/2505.09388
- **Rethinking OPD (Phenomenology, Mechanism, Recipe)** - https://arxiv.org/html/2604.13016v2
