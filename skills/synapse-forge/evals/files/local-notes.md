# MoE Routing Notes (Internal)

## Key Observations

- DeepSeek-V4 uses 256 routed experts with top-8 selection per token
- Shared experts (2) are always active, providing base capacity
- Load balancing loss: auxiliary coefficient 0.01, applied per token
- Expert parallelism: EP across 8 nodes, all-to-all communication via IB

## Performance Numbers

- Throughput: 14.2k tokens/sec per node (prefill)
- Latency overhead from expert routing: < 2ms P99
- KV cache sharing across experts: reduces memory by ~30%

## Open Questions

- How does the routing function handle tokens at domain boundaries?
- Is there gradient accumulation across expert groups?
