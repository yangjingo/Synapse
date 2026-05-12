# 00 / Cover

## Team Vibe Coding 404

反向版：如何快速用 Vibe Coding 把你的项目给搞烂？
延展：OPC 一人公司版 — 21 条反模式 × 1 人

Version: Synapse v6.0 | Author: Why.J | Date: 2026/05/12

---

# 01 / Context

## 现状分析：21 条措施，一个根因

- **事实 1**: AI 生成代码重复率是人工代码的 ==8 倍==，技术债务增加 ==32.45 issues/KLOC==，BLOCKER 级漏洞检出率高 2.3 倍。
- **事实 2**: 长期依赖 AI 的程序员认知能力比独立编程者低 ==17%==，Debug 全线崩盘，22 名开发者承认变得懒惰冷漠。
- **事实 3**: ==70%== 的 AI 项目失败归因于组织就绪度不足，40% 员工每月收到 AI 低质量产出，团队信任全面崩盘。

::pulse [「 AI 不制造混乱，它加速混乱。大模型不是问题，治不好的管理病才是。 」] ::

::visual {🍌 nano-banana prompt: An amplifier icon. Left: small bugs labeled "management disease". Right: same bugs 10x larger labeled "amplified dysfunction". Below: three cracked icons "code quality" "team cognition" "knowledge". Hand-drawn, black ink, white background, Morardi palette.} ::

---

# 02 / Agenda

## 从 21 条到 7 个角色 + OPC 延展

- **Q1**: CEO/CTO（1-3）——==削编增效 + 追风口 + AI 裁员==，决策者用工具替代判断？
- **Q2**: PM + 项目经理（4-9）——==AI代写需求 + 压缩时间 + 不复盘==，流程全面投降？
- **Q3**: Dev（10-15）——==认知退化 17% + 漏洞 2.3x + 删库 + 知识消亡==，六连击？
- **Q4**: QA + Ops + 全团队（16-21）——==不验收 + Workslop + 只学咒语==，终点是 AI 降神会？
- **Q5**: 延展——如果以上发生在==OPC 一人公司==，后果是什么？如何避免？

---

# 03 / CEO / CTO（1-3）

## 用工具替代判断

- **1. 削编增效**: 两人配 50 个 Agent 干十人的活——连"好"都定义不了，AI 也救不了你。
- **2. 追风口**: 这周 DeepSeek 下周 Claude——不做调研就拍板，不是果敢，是==赌博==。
- **3. AI 裁员**: 代码量扔进大模型输出末位淘汰名单——==算法的输入带着组织偏见==。

::pulse [「 不应该用AI替代管理判断，而应该用AI增强管理判断——先定义"效"是什么，再谈"增效"。 」] ::

::visual {🍌 nano-banana prompt: Three arrows from CEO desk. "cut headcount" hitting team. "chase trends" spinning. "AI layoff" hitting resume. Label: "replace judgment". Hand-drawn, Morandi.} ::

---

# 04 / 产品经理 + 项目经理（4-9）

## 用速度替代思考，流程全面投降

- **4. AI 代写需求**: 德勤 237 页报告引用学者全是 AI 编的——==集体盲飞==。
- **5. 全塞 P0**: AI 给 400 个方向全塞——战略是取舍，你要砍掉 ==399 个==。
- **6. 享受幻觉**: 三个方案差值 200%——AI 放大的是你的==混乱==。
- **7-9**: 压缩时间到 1 天、AI 站会纪要、三句话挡住复盘——==流程全面投降==。

::pulse [「 不应该让AI替代用户调研，而应该用AI整理调研结果——AI能帮你写文档，不能帮你理解用户。 」] ::

::visual {🍌 nano-banana prompt: A funnel with 400 items all labeled "P0" crushing a developer. A clock shrinking next to a debt pile growing. Hand-drawn, Morandi.} ::

---

# 05 / 开发人员 I（10-12）

## 认知外包 + 质量崩盘

- **10. Vibe Coding**: AI 代码重复率 8 倍、技术债 +32.45 issues/KLOC——那不是债，是==遗产==。
- **11. 认知外包**: 认知能力低 17%，Debug 全线崩盘——你不是在用 AI，你在给 ==AI 当乙方==。
- **12. 不做 CR**: 67% 认为 AI 代码"更安全"，实际 BLOCKER 漏洞高 ==2.3 倍==。

::pulse [「 不应该Vibe Coding全盘接受，而应该把AI当副驾驶审查每一行——AI写的代码比人写的更需要Review。 」] ::

::visual {🍌 nano-banana prompt: A brain fading to ghost. Arrow to robot glowing. "cognitive outsourcing". Below brain: "yours — fading". Below robot: "AI's". Hand-drawn, Morandi.} ::

---

# 06 / 开发人员 II（13-15）

## Agent 失控 + 知识消亡

- **13. 多 Agent 并行**: Cursor Agent 删库——"我猜会作用在 Staging 环境，我没有==验证=="。
- **14. 知识消亡**: 没有架构文档指望大模型"一锅炖"——你投喂的是=="数据泔水"==，团队名存实亡。
- **15. 必上 SFT**: 模型升级旧 SFT 失效——你永远叫不醒一个正在攒=="SFT落地经验"简历==的人。

::pulse [「 不应该消灭知识工程，而应该先建好文档和知识库——没有骨架的AI投喂只是数据泔水。 」] ::

::visual {🍌 nano-banana prompt: A blender labeled "LLM". Trash in: "legacy code" "OneNote" "no docs". Output: same trash smoother. Label: "data swill". Hand-drawn, Morandi.} ::

---

# 07 / QA + 运营 + 全团队（16-21）

## 质量防线瓦解 + 釜底抽薪

- **16-18**: AI 写测试覆盖 95% 但 P0 频发；不验收；Bug 归因"模型局限"——==甩锅话语权越大==。
- **19**: 1400 个智能体铺全公司——PPT 上"AI赋能"比落地重要，1400 让==老板高潮==。
- **20**: Workslop——40% 员工收到 AI 垃圾，每人花 2 小时善后，==创新力和信任崩盘==。
- **21**: 只学咒语——你分不清自己在管理技术团队还是 ==AI 降神会现场==。

::pulse [「 不应该只学AI咒语，而应该先搞懂基础原理——第6个原因藏在你的私域业务规则中。 」] ::

::visual {🍌 nano-banana prompt: Inverted pyramid: "CEO" "PM" "Dev" "QA" "Ops". Each has AI chip. Base cracking. Label: "bypass, don't fix". Hand-drawn, Morandi.} ::

---

# 08 / Take A Ways

## TL;DR — 7 个角色的不应该 / 应该

- **CEO/CTO**: 不应该用AI替代管理判断，而应该用AI ==增强管理判断==——先定义"效"是什么，再谈"增效"。
- **产品经理**: 不应该让AI替代用户调研，而应该用AI ==整理调研结果==——AI能帮你写文档，但不能帮你理解用户。
- **项目经理**: 不应该压缩研发时间到AI生成时间，而应该用AI ==提效去提升质量==而非压缩周期。
- **开发人员**: 不应该Vibe Coding全盘接受，而应该把AI当 ==副驾驶审查每一行==——AI写的代码比人写的更需要Review。
- **QA**: 不应该把Bug归因"模型局限"，而应该 ==复盘整个质量流程==——大模型的局限是已知的，你的流程缺失才是真正的P0。
- **运营**: 不应该用数量证明AI价值，而应该用 ==实际业务成果==——1400个智能体里有多少在真正创造价值？
- **全团队**: 不应该只学"AI咒语"，而应该先 ==搞懂基础原理==——Prompt工程救不了你，当系统延迟飙到40秒，全团队唯一能做的就是换个Prompt再问一遍AI。

::pulse [「 **大模型不是问题，治好的管理病才是。先把管理基础设施搞对，再上AI。** 」] ::

---

# 09 / OPC Context

## OPC 毒性倍率：不是团队崩了，是你崩了

- **倍率 1**: 团队里每条反模式伤害一个角色；OPC 里你==同时扮演全部 7 个角色==，每一条都直接砍在你唯一的产出能力上。
- **倍率 2**: 团队有扩散缓冲——有人离职、有人质疑；OPC 的死亡螺旋是==连续的、静默的==，直到公司突然死亡。
- **倍率 3**: 一人公司的品牌 = 你个人信誉。团队可以说"这是模型的问题"，客户对你说：<mark>"我付钱给你，不是给 OpenAI"</mark>。

::pulse [「 团队里 AI 加速混乱，至少混乱是可见的；OPC 里 AI 加速混乱，混乱是隐形的——直到你发现自己在给 AI 打工。 」] ::

::visual {🍌 nano-banana prompt: A single figure at center wearing 7 stacked hats: CEO, PM, Dev, QA, Ops. Each hat has a small crack. The figure stands on thin ice cracking. Label: "one person, seven roles, zero buffer". Hand-drawn, black ink, white background, Morandi palette.} ::

---

# 10 / Death Spiral

## OPC 特有的静默死亡螺旋

- ==追风口(换工具) → 学习成本吃时间 → 产出延迟 → 现金流压力 → 压缩时间赶工 → Vibe Coding 应付 → 质量崩 → 客户流失 → 更焦虑 → 更依赖 AI → 认知退化 → 死循环==

- 团队里这个螺旋至少有==断点==——有人离职、有人质疑、有人在 standup 上说"这不正常"。

- OPC 里这个螺旋是==连续的、静默的==。没有人会在你追风口时拉住你，没有人会在你 Vibe Coding 时说"等一下"。

::pulse [「 团队的死亡螺旋有人能踩刹车；OPC 的死亡螺旋只有一个刹车——你自己的自律。但你正在用 AI 替代那份自律。 」] ::

::visual {🍌 nano-banana prompt: A spiral staircase descending. Each step labeled: "chase trend" "rush" "vibe code" "quality drop" "client loss" "more AI". Bottom: a mirror showing the person as a prompt-only operator. Hand-drawn, Morandi.} ::

---

# 11 / Principle 1 + 2

## AI 加速已会之事 + 无 AI 时间

- **原则 1**: 只用 AI 做==你已经会做的事的加速器==，不做你不会做的事的替代品。
  - 不会手写正则？先学，再让 AI 加速。
  - 不会做架构设计？先学，再让 AI 辅助。
  - ==OPC 的竞争壁垒是你自己的能力深度，不是 AI 的速度。==

- **原则 2**: 每周至少==半天"无 AI 时间"==。
  - 手写代码、手写文档、手动测试。保持手感。
  - ==定期验证自己还能独立完成核心工作。==

::pulse [「 AI 是你已有能力的倍增器，不是缺失能力的替代品——如果你不会做，AI 的输出你连判断对错的能力都没有。 」] ::

::visual {🍌 nano-banana prompt: Left: person running with prosthetic "AI" leg, faster. Right: person with no legs asking AI to carry them, stuck. Label: "amplifier vs crutch". Hand-drawn, Morandi.} ::

---

# 12 / Principle 3

## 工具栈锁定：不追风口

- 选一个模型、一个框架、一套工作流，==至少用三个月再评估==。
- 每次切换必须计算：==切换成本 vs 一个月内能收回的收益==。
  - 学新工具 3 天 × 日薪换算 = 切换成本
  - 如果算不清楚，不切。
- 一人公司没有"技术选型委员会"，但你需要==比团队更严格的锁定纪律==——因为没有人帮你收场。

::pulse [「 不应该每周换一个新工具，而应该把一个工具用到极致——DeepSeek 好，Claude 好，但你来回换，每个都用不好的那个才是最贵的。 」] ::

::visual {🍌 nano-banana prompt: A calendar with 12 weeks. 8 weeks crossed out with different tool names. Only 4 weeks actually working. Math: "8 weeks cost / 4 weeks output = negative ROI". Hand-drawn, Morandi.} ::

---

# 13 / Principle 4

## 影子团队：一人也要有人 Review

- 一个人做不了 code review，但你可以：
  - 把关键决策写在公开场合（博客、社群），让==同行质疑==。
  - 找 2-3 个同频的独立开发者==互相 review==。
  - 用 git blame 自己：==一周后回头看自己的代码，当别人的代码 review==。
- 目标不是组建虚拟团队，是给自己装一个==外部刹车片==。

::pulse [「 不应该一个人闷头 Vibe Coding，而应该把关键产出暴露给同行——孤独是 OPC 最大的生产力杀手，也是质量杀手。 」] ::

::visual {🍌 nano-banana prompt: Three separate islands. Each island has one person. Bridges connecting them labeled "review" "feedback" "challenge". Center sign: "shadow team". Hand-drawn, Morandi.} ::

---

# 14 / Principle 5

## 客户触达频率 > AI 使用频率

- 一人公司最大的优势：==你离用户最近==。
- 每周至少一次==直接和用户对话==，不能用 AI 替代。
  - 你对自己的用户理解决定了 AI 建议哪些有用、哪些是垃圾。
  - ==没有用户直觉，你的 prompt 越写越精确，方向越来越偏。==
- AI 可以帮你整理用户反馈，但不能帮你==产生用户同理心==。

::pulse [「 不应该让 AI 替你和用户对话，而应该亲自对话后让 AI 帮你整理——你的一手用户认知，是 AI 永远无法从文档中推导出来的。 」] ::

::visual {🍌 nano-banana prompt: Two paths diverging. Left: person → AI → report → decision (long, filtered). Right: person → user → insight → decision (short, direct). Right path marked with heart. Label: "shortcut vs real path". Hand-drawn, Morandi.} ::

---

# 15 / Reference

## Reference

- **如何用大模型搞垮一个团队？** - 茹炳晟 - https://mp.weixin.qq.com/s/jwILxorZ4saMMR34WB5_kg
- **Team Vibe Coding 404** - Why.J - OPC 延展讨论
