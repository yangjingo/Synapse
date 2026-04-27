"""Toy DeepSeek-V4 mHC block for torchvista.

Dependencies:
- Python 3.11
- torch==2.5.1+cpu
- torchvista==0.2.11

This file is intentionally not a faithful reproduction of the upstream model.
It is a CPU-only structural sketch used to visualize the major composition:

- Hyper-Connection pre/post mixing
- Attention sublayer
- MoE-style FFN sublayer
"""

import torch
import torch.nn as nn


class RMSNorm(nn.Module):
    def __init__(self, dim: int, eps: float = 1e-6):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(dim))
        self.eps = eps

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        rms = torch.rsqrt(x.pow(2).mean(dim=-1, keepdim=True) + self.eps)
        return x * rms * self.weight


class ToyHyperConnectionPre(nn.Module):
    def __init__(self, dim: int, hc_mult: int):
        super().__init__()
        self.mix = nn.Linear(dim * hc_mult, hc_mult * (2 + hc_mult))
        self.hc_mult = hc_mult

    def forward(self, x: torch.Tensor):
        # Collapse the hyper-connection branch axis into features so a single
        # projection can emit the pre-mix, post-scale, and residual-combine terms.
        flat = x.flatten(2)
        mixes = self.mix(flat)
        pre = torch.softmax(mixes[..., : self.hc_mult], dim=-1)
        post = torch.sigmoid(mixes[..., self.hc_mult : 2 * self.hc_mult])
        comb = torch.softmax(
            mixes[..., 2 * self.hc_mult :].view(*x.shape[:2], self.hc_mult, self.hc_mult),
            dim=-1,
        )
        reduced = torch.sum(pre.unsqueeze(-1) * x, dim=2)
        return reduced, post, comb


class ToyHyperConnectionPost(nn.Module):
    def forward(self, x: torch.Tensor, residual: torch.Tensor, post: torch.Tensor, comb: torch.Tensor):
        expanded = post.unsqueeze(-1) * x.unsqueeze(2)
        mixed_residual = torch.sum(comb.unsqueeze(-1) * residual.unsqueeze(2), dim=3)
        return expanded + mixed_residual


class ToyAttention(nn.Module):
    def __init__(self, dim: int):
        super().__init__()
        self.norm = RMSNorm(dim)
        self.q = nn.Linear(dim, dim)
        self.k = nn.Linear(dim, dim)
        self.v = nn.Linear(dim, dim)
        self.o = nn.Linear(dim, dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Keep the attention path minimal: normalize, project q/k/v, attend, project out.
        x = self.norm(x)
        q = self.q(x)
        k = self.k(x)
        v = self.v(x)
        attn = torch.softmax(q @ k.transpose(-1, -2) / (x.size(-1) ** 0.5), dim=-1)
        return self.o(attn @ v)


class ToyMoE(nn.Module):
    def __init__(self, dim: int, inter_dim: int, n_experts: int = 4):
        super().__init__()
        self.gate = nn.Linear(dim, n_experts)
        self.experts = nn.ModuleList(
            [
                nn.Sequential(
                    RMSNorm(dim),
                    nn.Linear(dim, inter_dim),
                    nn.SiLU(),
                    nn.Linear(inter_dim, dim),
                )
                for _ in range(n_experts)
            ]
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # This is a dense weighted blend of experts, not a production sparse router.
        probs = torch.softmax(self.gate(x), dim=-1)
        expert_outs = torch.stack([expert(x) for expert in self.experts], dim=-2)
        return torch.sum(probs.unsqueeze(-1) * expert_outs, dim=-2)


class ToyDeepSeekV4mHCBlock(nn.Module):
    def __init__(self, dim: int = 128, inter_dim: int = 256, hc_mult: int = 4):
        super().__init__()
        self.hc_pre_attn = ToyHyperConnectionPre(dim, hc_mult)
        self.attn = ToyAttention(dim)
        self.hc_post_attn = ToyHyperConnectionPost()
        self.hc_pre_ffn = ToyHyperConnectionPre(dim, hc_mult)
        self.ffn = ToyMoE(dim, inter_dim)
        self.hc_post_ffn = ToyHyperConnectionPost()

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # The block is arranged as:
        # mHC-pre -> Attention -> mHC-post -> mHC-pre -> MoE -> mHC-post
        residual = x
        x_reduced, post, comb = self.hc_pre_attn(x)
        x_attn = self.attn(x_reduced)
        x = self.hc_post_attn(x_attn, residual, post, comb)

        residual = x
        x_reduced, post, comb = self.hc_pre_ffn(x)
        x_ffn = self.ffn(x_reduced)
        x = self.hc_post_ffn(x_ffn, residual, post, comb)
        return x


def build_model():
    return ToyDeepSeekV4mHCBlock()


def build_inputs(model):
    # Shape: batch, sequence, hyper-connection branches, hidden dim
    return torch.randn(2, 16, 4, 128)
