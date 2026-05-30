# **论文解读：Self-Improving Language Models with Bidirectional Evolutionary Search (BES)**

author： 周均扬

date： 2026.05.30

---

## 0. 基本信息 

论文名称： Self-Improving Language Models with Bidirectional Evolutionary Search

作者： Guowei Xu 等（Harvard、MIT）

时间： 2026年5月

核心关键词： Self-Improvement、Search、Evolutionary Search、Agent、Test-Time Scaling、Post-Training

链接： https://huggingface.co/papers/2605.28814

---

### 1. 核心问题与动机
现有LLM自改进（self-improving）和推理（inference）中的搜索方法（如Best-of-N采样、Tree Search / MCTS / ToT等）存在**两个根本局限**：

- 1. **验证信号稀疏（Sparse Verification Signals）**：Verifier（如正确性检查器）通常只在最终答案给出二元或粗粒度反馈，中间过程缺乏密集指导。

- 2. **候选生成受限（Confined Candidate Generation）**：主要通过**自回归扩展（autoregressive expansion）**生成候选，候选始终在模型自身概率分布的高概率质量区域（narrow entropy shell）。难以探索低概率但正确的解空间，尤其在 frontier 难题上。

这些限制导致在困难的后训练任务中，主流方法（如GRPO、Tree-GRPO）难以找到足够高质量样本，模型无法有效提升；在推理时也难以稳定解决开放性问题。

**BES 的解决方案**：提出 **Bidirectional Evolutionary Search (BES)**，将**前向候选进化**与**后向目标分解**耦合，模拟进化生物学中的“有性生殖”（基因重组）来突破限制。

---

### 2. 提出的方法：Bidirectional Evolutionary Search (BES)

#### 1.  BES（Bidirectional Evolutionary Search）

即：
```
Forward Search + Backward Search
```
双向搜索。 ([Hugging Face][^1])


整体结构：
```text
             Goal
              ↑
         Backward Decompose
              ↓
Subgoal1  Subgoal2  Subgoal3
      ↘      ↓      ↙
      Forward Evolution
              ↓
     Candidate Solutions
```

BES 在前向搜索和后向搜索之间交替进行（通常每若干前向步进行一次后向步）。

#### 2.  **前向搜索（Forward Search）：扩展可达解空间**
- **表示**：每个候选是部分轨迹（partial trajectory）的节点。
- **操作符**（Operators）：
  - **Expansion（扩展）**：标准自回归采样新步骤（类似现有方法）。
  - **Evolution Operators（进化操作符，核心创新）**：从不同轨迹中**重组（recombine）**部分，生成单次rollout难以得到的候选：
    - **Combination**：共享前缀的不同轨迹，后缀拼接。
    - **Deletion**：删除最不合理的内部步骤。
    - **Translocation**：用另一轨迹的步骤替换当前轨迹中的某一步。
    - **Crossover**：在某点切割一条轨迹，用另一条的后半部分替换（类似基因交叉）。

**理论动机**：仅用扩展生成的候选被限制在窄“entropy shell”内；进化操作符能跳出该壳，探索更广阔空间（论文有Theorem证明）。

#### 3. **后向搜索（Backward Search）：提供密集反馈**
- 递归将原任务分解成**可检查的子目标（checkable sub-goals）**树。
- 用这些子目标评估前向节点：满足越多子目标，得分越高。
- 提供**密集、中间反馈**，即使没有完全解决最终问题，也能有效指导搜索。
- 理论优势：将“一击必中”的低概率问题转化为收集多个子目标的更容易问题，实现**指数级样本效率提升**（Theorem 4.5）。


#### 4. 为什么叫 Bidirectional？

因为 Forward 从初始状态向前生成:
```text
Problem -> Step1 -> Step2 -> Answer
```

Backward则从目标反推:
```text
Answer <- Subgoal3 <- Subgoal2 <- Subgoal1
```

最终：
```text
Forward Search
      ↘
       Meet
      ↗
Backward Search
```

类似：

* A*
* Goal Directed Planning
* AlphaGo Value Guidance

但这里用于 LLM 推理。 ([HyperAI][^2])


整体框架像“进化 + 分治”：前向产生多样/创新候选，后向提供细粒度指导，二者相互促进。


---

### 3. 实验结果
- **后训练（Post-training）**：
  - 在困难的逻辑推理（Knights-and-Knaves）和多跳QA任务上，GRPO / Tree-GRPO 等主流方法几乎无法提升甚至退化。
  - BES 能稳定发现高质量训练样本，实现显著提升（e.g., Llama-3.1-8B 上多跳QA准确率从基线~6-7%提升到10.4%）。

- **推理时（Inference）**：
  - 在三个开放问题求解基准（Circle Packing 正方形/矩形、Heilbronn问题）上，BES 在平均和最佳性能上优于 OpenEvolve、GEPA、ShinkaEvolve 等开源框架。
  - 能发现更稳定、高质量的解（接近或超过某些人类/AlphaEvolve 参考值）。

- **消融与分析**：验证了每个组件（进化操作符、后向分解）的贡献；提供了搜索过程可视化、成本分析（时间/API开销）。

**代码与模型**：https://github.com/Embodied-Minds-Lab/BES

---

### 4. 创新点与意义
- **方法论创新**：将进化计算思想（重组而非仅变异/扩展）引入LLM搜索；双向搜索解决信号稀疏问题。
- **理论贡献**：证明了扩展-only 的局限性和双向搜索的指数优势。
- **实用价值**：为LLM自改进和测试时缩放（test-time scaling）提供了更强大的搜索框架，尤其适用于前沿/开放性难题。
- **局限**：计算成本高于简单Best-of-N（需权衡）；依赖Verifier质量和子目标分解能力（论文中用LLM辅助分解）。

**总结**：BES 是搜索-based self-improvement 的重要进展，它不满足于“更多采样”，而是通过**进化式多样性生成 + 分解式密集指导**，让模型能系统性地探索更优解空间。这对未来代理（agents）和长期自改进系统有启发意义。推荐阅读原论文的理论部分和附录案例研究以深入理解搜索动态。

---

### 5. 对 Agent 的意义

这篇论文实际上不是在解决LLM问题。而是在解决 Agent Search 问题。未来Agent大概率会采用："Planner + Evolution + Goal Decomposition + Verifier"结构。

即：

```text
             Goal
               │
      Goal Decomposition
               │
      ┌────────────┐
      │  Evolution │
      └────────────┘
               │
         Candidate Pool
               │
          Verifier
               │
            Update
```

---

### 6. 与工业机器人“大脑-小脑”架构的联系

对于工业机器人和工业视觉Agent方向，可以把 BES 映射为：

| BES模块                | 机器人对应   |
| -------------------- | ------- |
| Goal Decomposition   | 大脑任务规划  |
| Forward Evolution    | 行为生成    |
| Evolution Operator   | 动作组合与重组 |
| Subgoal Verification | 小脑反馈    |
| Verifier             | 世界模型    |
| Self-Improvement     | 经验学习    |

实际上已经非常接近：

* Google Gemini Robotics
* DeepMind AlphaEvolve
* OpenAI Agent Search
* Figure Helix

的发展方向。

---

### 7. 技术判断

这篇论文最大的价值并不是提出一个新的 Search Algorithm，而是提出了一个非常重要的趋势：
> **未来大模型的提升可能不再主要依赖更大的参数规模，而依赖更强的搜索（Search）、规划（Planning）、进化（Evolution）和目标分解（Goal Decomposition）能力。**

从演进路径看：

```text
Prompt Engineering
      ↓
Chain of Thought
      ↓
Tree Search
      ↓
MCTS
      ↓
Evolution Search
      ↓
Bidirectional Evolution Search
      ↓
Agentic Self-Improvement
```

而 BES 可以被视为：

```text
Tree-of-Thought
      +
Genetic Algorithm
      +
Hierarchical Planning
      +
Self-Improvement
```

的统一框架。

对于工业视觉 Agent、制造业 AI Agent、机器人大小脑系统而言，这篇论文的启发是：
> **未来的核心竞争力可能不是更大的 Vision-Language Model，而是“搜索+规划+进化”的 Agent 操作系统**。 


### 参考资料：

[^1]: "Self-Improving Language Models with Bidirectional Evolutionary Search", https://huggingface.co/papers/2605.28814
[^2]: "Self-Improving Language Models with Bidirectional Evolutionary Search | Papers | HyperAI", https://hyper.ai/en/papers/2605.28814






---





