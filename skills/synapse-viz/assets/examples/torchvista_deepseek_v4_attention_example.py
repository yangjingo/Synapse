"""Toy DeepSeek-V4 hybrid attention stack for torchvista.

Dependencies:
- Python 3.11
- torch==2.5.1+cpu
- torchvista==0.2.11

This is a CPU-only structural sketch of the Hugging Face inference-side
attention path. It focuses on module relationships, not exact math parity.
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


class ToyCompressor(nn.Module):
    def __init__(self, dim: int, compress_ratio: int = 4):
        super().__init__()
        self.compress_ratio = compress_ratio
        self.wkv = nn.Linear(dim, dim)
        self.wgate = nn.Linear(dim, dim)
        self.norm = RMSNorm(dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Group tokens into fixed-size chunks, compute gated pooled KV states,
        # then normalize the compressed memory bank.
        b, s, d = x.shape
        cutoff = s - (s % self.compress_ratio)
        x = x[:, :cutoff]
        kv = self.wkv(x).view(b, cutoff // self.compress_ratio, self.compress_ratio, d)
        gate = self.wgate(x).view(b, cutoff // self.compress_ratio, self.compress_ratio, d)
        pooled = torch.sum(kv * torch.softmax(gate, dim=2), dim=2)
        return self.norm(pooled)


class ToyIndexer(nn.Module):
    def __init__(self, dim: int, topk: int = 8):
        super().__init__()
        self.q_proj = nn.Linear(dim, dim)
        self.score_proj = nn.Linear(dim, 1)
        self.topk = topk

    def forward(self, x: torch.Tensor, compressed_kv: torch.Tensor):
        # Score each token against compressed memory slots and keep top-k indices.
        q = self.q_proj(x)
        scores = torch.matmul(q, compressed_kv.transpose(-1, -2))
        weights = torch.sigmoid(self.score_proj(x))
        scored = scores * weights
        return torch.topk(scored, k=min(self.topk, compressed_kv.size(1)), dim=-1).indices


class ToySlidingWindowAttention(nn.Module):
    def __init__(self, dim: int, window_size: int = 8):
        super().__init__()
        self.window_size = window_size
        self.q = nn.Linear(dim, dim)
        self.k = nn.Linear(dim, dim)
        self.v = nn.Linear(dim, dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # This keeps the local-attention path obvious for torchvista rendering.
        q = self.q(x)
        k = self.k(x)
        v = self.v(x)
        attn = torch.softmax(q @ k.transpose(-1, -2) / (x.size(-1) ** 0.5), dim=-1)
        return attn @ v


class ToyHybridAttention(nn.Module):
    def __init__(self, dim: int = 128, compress_ratio: int = 4, window_size: int = 8):
        super().__init__()
        self.q_norm = RMSNorm(dim)
        self.kv_norm = RMSNorm(dim)
        self.window_attn = ToySlidingWindowAttention(dim, window_size)
        self.compressor = ToyCompressor(dim, compress_ratio)
        self.indexer = ToyIndexer(dim)
        self.out = nn.Linear(dim * 2, dim)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Hybrid path:
        # 1. local sliding-window attention
        # 2. compressed KV memory
        # 3. learned index selection into compressed memory
        # 4. concatenate local + retrieved context
        x = self.q_norm(x)
        local = self.window_attn(x)
        compressed_kv = self.compressor(self.kv_norm(x))
        selected = self.indexer(x, compressed_kv)

        gather_idx = selected[..., 0].unsqueeze(-1).expand(-1, -1, compressed_kv.size(-1))
        gathered = torch.gather(
            compressed_kv.unsqueeze(1).expand(-1, x.size(1), -1, -1),
            2,
            gather_idx.unsqueeze(2),
        ).squeeze(2)
        return self.out(torch.cat([local, gathered], dim=-1))


def build_model():
    return ToyHybridAttention()


def build_inputs(model):
    # Shape: batch, sequence, hidden dim
    return torch.randn(2, 16, 128)
