# OPD Internal Summary

## Core Findings from Experiments

1. On-policy distillation with Qwen-72B teacher → Qwen-7B student achieves 92% of teacher performance
2. Forward KL pretraining is essential: skipping it drops OPD effectiveness by 35%
3. Self-distillation (same model as teacher and student) shows no degradation over 5 iterations
4. The "strong teacher paradox": using GPT-4 as teacher for a 7B model performs worse than using a 72B model trained in the same pipeline

## Data

- Training compute: 1,800 GPU hours (vs 17,920 for equivalent RL)
- AIME'24 score: 74.4% (OPD) vs 67.6% (RL) vs 70% (SFT)
- Effective for math and code reasoning tasks; less impact on creative writing

## Key Constraint

OPD requires the student's on-policy samples — offline datasets don't work. This means you need inference compute during training.
