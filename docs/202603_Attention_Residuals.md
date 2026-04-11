# Attention Residuals, 注意力旋转90度

**《Attention Residuals》（简称 AttnRes）** 是 Kimi 团队（Moonshot AI）于 2026 年 3 月 16 日发布的最新技术报告，arXiv 编号为 2603.15031。

这篇论文针对 Transformer 架构中**标准残差连接（Residual Connections）**长期未被优化的痛点，提出了一种全新的“深度维度注意力”机制，把残差从“固定累加”升级为“输入依赖的选择性聚合”。它本质上是把序列注意力（Attention）的思想“移植”到网络深度（depth）维度上，被称为“深度残差的注意力化”。

### 1. 标准残差连接到底有什么问题？
现代 LLM 几乎都用 **PreNorm + Residual**（先 LayerNorm/ RMSNorm，再 Attention/MLP，再加回输入）。但论文指出，这种“固定单位权重累加”会导致 **PreNorm Dilution**（预归一化稀释）问题：

- 隐藏状态幅度随层数 L 线性增长（≈ O(L)），每个早期层贡献被不断“稀释”。
- 每层只能拿到前一层的压缩状态 h_{l-1}，无法选择性地“回忆”更早的有用表示。
- 后期层必须输出越来越大的信号才能影响最终残差，导致训练不稳定、梯度分布不均。
- 实验发现：很多层其实可以直接剪枝，性能损失很小，说明深度信息聚合是低效的。

这和 RNN 在序列维度上的局限性高度相似——固定累加无法实现“选择性记忆”。

### 2. 核心创新：Attention Residuals（AttnRes）
论文的核心贡献是把残差替换为**深度维度的 softmax Attention**：

标准残差：
\[
h_l = h_{l-1} + f_l(h_{l-1})
\]
（实际是所有前层输出的均匀累加）

AttnRes（Full 版）：
\[
h_l = \sum_{i=0}^{l-1} \alpha_{i \to l} \cdot v_i
\]
其中注意力权重：
\[
\alpha_{i \to l} = \frac{\exp(w_l^\top \text{RMSNorm}(k_i))}{\sum_j \exp(w_l^\top \text{RMSNorm}(k_j))}
\]

- 每层只学一个**伪查询向量** \(w_l \in \mathbb{R}^d\)（非常轻量）。
- Key/Value 直接用前面各层的输出 \(v_i\)（和反向传播需要的激活重叠，额外开销极小）。
- 用 RMSNorm 防止幅度偏差。

**理论洞见**：论文用结构化矩阵分析证明，传统残差（包括 Highway、mHC 等变体）其实都是“深度线性注意力”（固定权重），而 AttnRes 是“深度 softmax 注意力”。这完成了深度维度上从“线性”到“softmax”的跃迁，和序列维度上 Transformer 取代 RNN 的路径完全一致。

### 3. 实用版：Block AttnRes（解决大规模开销）
Full AttnRes 在小模型或单机训练时几乎零成本，但在大规模 pipeline 并行下，激活通信和内存会变成 O(L d)。论文提出 **Block AttnRes**：

- 把 L 层分成 N 个块（推荐 N≈8，块内用标准残差）。
- 块间只做注意力（每个块总结成一个表示 b_n）。
- 内存/通信从 O(L d) 降到 O(N d)，计算从 O(L² d) 降到 O(N² d)。
- 性能几乎保留 Full 版的全部收益。

论文还配套了 pipeline 并行下的**跨阶段缓存** + **两阶段计算策略**，训练额外开销 <4%，推理延迟 <2%，真正做到“drop-in replacement”（即插即用）。

### 4. 实验结果
- **缩放律**：在 194M~528M 激活参数规模下，AttnRes（Block 版）在相同 compute 下始终优于 baseline，相当于 baseline 多用 1.25× 计算量才能达到相同 loss。
- **大规模验证**：集成到 Kimi Linear 架构（总参数 48B，激活 3B MoE），用 1.4T tokens 预训练。
  - 输出幅度不再随深度增长，而是块内周期性有界。
  - 梯度分布更均匀（不再集中在早期层）。
  - 下游任务全面提升：GPQA +7.5、Math +3.6、HumanEval +3.1、MMLU +1.1 等（中英文任务均有收益）。
- **消融**：输入依赖的 query、RMSNorm、合适的块大小（S=2~8）都是关键；换成 sigmoid 或固定权重会明显变差。

### 5. 为什么说这是“残差连接十年未变后的突破”？
- **概念层面**：第一次把“选择性记忆”机制系统性地引入深度维度，解决了 PreNorm 最根本的稀释问题。
- **工程层面**：Block 设计 + 系统优化让它在大模型训练/推理中几乎无感，但效果显著。
- **理论层面**：统一了残差、RNN、线性注意力等框架，提供了全新的视角。

官方 GitHub（MoonshotAI/Attention-Residuals）已经开源了论文 PDF 和 PyTorch 风格的 Block AttnRes 伪代码，方便社区快速集成。

**一句话总结**：  
Kimi 团队把“注意力”从序列维度推广到深度维度，让每一层都能“聪明地挑选”前面所有层最有用的信息，而不是盲目相加。这可能是 Transformer 残差结构自 2017 年以来最重要的一次架构级革新之一，值得所有大模型开发者关注和实验。
