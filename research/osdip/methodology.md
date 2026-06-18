# **Section X: Methodology**

## **Optimal Stopping Driven Industrial Perception Framework**

---

# 1. Problem Formulation

在工业视觉环境感知任务中，系统在时间序列观测下进行决策：

```text
X₁, X₂, …, X_t  →  Decision (Stop / Continue / Act)
```

其中：

* (X_t \in \mathbb{R}^d)：第 (t) 帧多模态感知状态（图像、深度、特征、置信度等）
* 决策空间：
  [
  a_t \in { \text{continue}, \text{stop} }
  ]

系统目标是在保证感知精度的前提下，最小化延迟与计算成本：

[
\max_{\tau} \mathbb{E}[R(X_{\tau}) - \lambda \cdot C(\tau)]
]

其中：

* (\tau)：停止时间（stopping time）
* (R(\cdot))：感知决策收益函数（accuracy / reliability）
* (C(\tau))：时间与计算成本
* (\lambda)：权衡系数

---

# 2. Industrial Perception State Space Modeling

定义工业感知状态为：

[
X_t = { I_t, F_t, O_t, U_t }
]

其中：

* (I_t)：图像观测（image observation）
* (F_t)：特征嵌入（deep features）
* (O_t)：检测输出（object detection / tracking）
* (U_t)：不确定性估计（uncertainty / entropy）

进一步定义 belief state：

[
B_t = P(S_t | X_{1:t})
]

其中：

* (S_t)：真实世界状态（defect / object / scene condition）

该建模将视觉问题转化为 **Partially Observable Markov Decision Process (POMDP)**：

[
(\mathcal{S}, \mathcal{A}, \mathcal{O}, P, R)
]

---

# 3. Optimal Stopping Decision Formulation

## 3.1 Value Function Definition

定义价值函数：

V(B_t)=\max\left{g(B_t),\ \mathbb{E}[V(B_{t+1})\mid B_t]\right}

其中：

* (g(B_t))：立即停止收益（instant decision reward）
* 第二项：继续观测的期望收益

---

## 3.2 Optimal Stopping Rule

最优停止时间定义为：

[
\tau^* = \inf { t \ge 0 : g(B_t) \ge V(B_t) }
]

即：

> 当“立即决策收益”大于“继续观测期望收益”时停止。

---

## 3.3 Stopping Boundary Interpretation

状态空间被划分为：

* **Stop Region**：
  [
  \mathcal{S}_s = { B_t : g(B_t) \ge V(B_t) }
  ]

* **Continue Region**：
  [
  \mathcal{S}_c = { B_t : g(B_t) < V(B_t) }
  ]

该边界为高维非线性函数：

[
\partial \mathcal{S}
]

---

# 4. Bayesian Perception Update

系统采用递推贝叶斯更新：

B_t \propto P(X_t\mid S_t),B_{t-1}

其中：

* (P(X_t|S_t))：视觉观测模型
* (B_{t-1})：历史信念状态

该机制实现：

* 多帧信息融合
* 噪声鲁棒性增强
* 动态置信度校准

---

# 5. Reward Design for Industrial Perception

定义工业视觉收益函数：

[
R(B_t) = R_{acc}(B_t) - \lambda_1 R_{delay}(t) - \lambda_2 R_{risk}(B_t)
]

其中：

### (1) Accuracy reward

[
R_{acc} = \mathbb{I}(\hat{y}_t = y)
]

### (2) Delay penalty

[
R_{delay} = t
]

### (3) Risk penalty

[
R_{risk} = \mathrm{Var}(B_t)
]

---

# 6. Deep Optimal Stopping Policy Network

为避免解析解求解困难，引入神经策略函数：

[
\pi_{\theta}(B_t) \rightarrow [0,1]
]

输出：

* (p_{stop})：停止概率

决策规则：

[
a_t =
\begin{cases}
\text{stop}, & p_{stop} > \delta \
\text{continue}, & \text{otherwise}
\end{cases}
]

---

## 6.1 Network Architecture

输入：

* multi-frame feature stack
* uncertainty map
* temporal embeddings

结构：

* CNN / ViT encoder
* Temporal Transformer
* Policy Head (MLP)

---

## 6.2 Loss Function

强化学习目标：

[
\mathcal{L} = -\mathbb{E}[R] + \beta \cdot \mathcal{H}(\pi_{\theta})
]

其中：

* (\mathcal{H})：策略熵（exploration）

---

# 7. System-Level Industrial Integration

提出工业视觉闭环系统：

```text
CameraSDK
   ↓
Feature Extraction (AlgorithmSDK)
   ↓
Belief State Update (PerceptionSDK)
   ↓
Optimal Stopping Policy (DecisionSDK)
   ↓
Actuation (PLC / Robot / MES)
```

---

## 7.1 Real-Time Streaming Formulation

对于视频流：

[
{X_t}_{t=1}^{\infty}
]

系统执行在线决策：

[
a_t = \pi(B_t)
]

满足：

* O(1) per-frame inference
* bounded memory complexity

---

# 8. Complexity Analysis

## Time complexity

每帧：

[
\mathcal{O}(f_{encoder} + f_{policy})
]

通常：

* CNN encoder：O(n)
* Transformer：O(n²)（可优化）

---

## Memory complexity

仅维护：

* belief state (B_t)
* sliding window features

[
\mathcal{O}(k)
]

---

## Latency reduction

相比固定帧策略：

[
\text{Speedup} = \frac{T_{fixed}}{\mathbb{E}[\tau^*]}
]

---

# 9. Key Insight (Method Contribution)

本方法核心贡献在于：

### (1) 将工业视觉从“单帧推理”转为“序贯决策问题”

> Frame-level → Process-level

---

### (2) 引入 optimal stopping 替代固定阈值策略

> Static threshold → Adaptive stopping boundary

---

### (3) 建立 perception-belief-decision 三层统一模型

```text
Perception → Belief → Optimal Decision
```

---

### (4) 支持实时工业系统部署

* edge AI compatible
* streaming inference
* multi-camera scalable

---

# 10. Summary of Method

本文提出一种：

> **基于最优停时理论的工业环境感知决策框架**

其核心为：

* POMDP建模感知系统
* Bayesian belief state update
* Deep optimal stopping policy network
* reward-driven stopping boundary learning

最终实现：

> 在保证检测精度的同时，自适应优化推理时机，实现工业视觉系统的“动态决策智能化”。

---
