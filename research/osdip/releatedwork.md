# **II. Related Work**

## A. Optimal Stopping Theory and Stochastic Decision Processes

Optimal stopping is a classical problem in stochastic control and sequential decision theory, where the objective is to determine a stopping time that maximizes expected cumulative reward under uncertainty. Early foundational work established the theoretical basis through martingale theory, Snell envelope formulations, and variational inequalities, linking optimal stopping problems to free-boundary partial differential equations (PDEs).

In this formulation, the value function satisfies a recursive optimality principle:

V_t = \esssup_{\tau \ge t} \mathbb{E}[X_\tau | \mathcal{F}_t]

and can be equivalently expressed as a variational inequality:

\max(\mathcal{L}V(x),\ g(x)-V(x))=0

This formulation has been widely applied in financial engineering (e.g., American option pricing), maintenance scheduling, and sequential hypothesis testing.

**Limitation:**
Despite its strong theoretical foundation, classical optimal stopping theory assumes low-dimensional or analytically tractable state spaces, making it difficult to apply directly to high-dimensional perception problems such as industrial vision.

---

## B. Partially Observable Markov Decision Processes (POMDPs)

POMDPs extend Markov decision processes to scenarios where the system state is not directly observable, and decisions must be made based on belief states derived from observation histories.

A standard belief update is given by:

B_t \propto P(X_t\mid S_t)B_{t-1}

A comprehensive survey of POMDP frameworks demonstrates their applicability in quality control, robotics, and sequential decision-making under uncertainty.

POMDPs provide a principled way to model uncertainty in perception systems; however, exact solutions are intractable due to the continuous and high-dimensional belief space.

**Limitation:**
Existing POMDP formulations rarely scale to real-time industrial vision systems due to:

* exponential belief-space complexity
* lack of efficient stopping-time learning mechanisms
* weak integration with deep perception models

---

## C. Deep Reinforcement Learning for Visual Sequential Decision Making

Deep reinforcement learning (DRL) has achieved significant success in computer vision and robotics, enabling end-to-end learning of perception-action policies. A comprehensive survey of DRL in vision highlights applications including object detection, tracking, segmentation, and robotic control tasks, where visual inputs are directly mapped to actions via deep neural networks.

Recent DRL formulations treat visual decision problems as Markov decision processes, where agents learn policies of the form:

[
\pi_\theta(a_t | X_t)
]

and optimize expected cumulative reward via policy gradient or value-based methods.

In practical systems, DRL has been used for:

* object tracking with sequential action decisions
* robotic manipulation with visual feedback
* medical image-guided navigation

**Limitation:**
Most DRL-based vision systems assume:

* fixed inference budgets (constant frame processing)
* no explicit stopping decision
* no adaptive computation control

Thus, they do not explicitly address computation-efficient perception.

---

## D. Optimal Stopping in Reinforcement Learning

Recent works have begun integrating optimal stopping with reinforcement learning, particularly in financial engineering, cybersecurity, and maintenance systems. These studies formulate stopping as a binary decision within an MDP or POMDP framework, where the agent learns threshold-like policies.

Representative formulations model intrusion prevention or option exercise as stopping problems:

* learned threshold-based stopping policies
* RL approximations of Bellman optimal stopping equations
* stochastic approximation methods for policy learning

Empirical studies demonstrate that learned policies often converge to interpretable threshold structures, confirming theoretical insights from classical optimal stopping theory.

**Limitation:**
Existing approaches are primarily domain-specific and do not generalize to high-dimensional perception systems such as industrial vision or multi-sensor environments.

---

## E. Anytime Inference and Adaptive Computation in Deep Networks

A closely related research direction is anytime inference, where neural networks are designed to produce valid outputs at intermediate computation stages. Techniques include early-exit networks, adaptive computation time (ACT), and dynamic depth models.

These methods aim to reduce latency by allowing early termination when confidence is sufficient.

However, current approaches are mainly heuristic and rely on:

* confidence thresholds
* entropy-based stopping
* layer-wise exit heads

**Limitation:**
They lack a principled decision-theoretic foundation and do not explicitly model:

* sequential observation value
* belief-state evolution
* cost-aware optimal stopping

---

## F. Multi-Sensor and Multi-View Perception Systems

Industrial perception systems often rely on multi-camera or multi-sensor fusion, including RGB cameras, depth sensors, and LiDAR. Existing approaches focus on feature-level or decision-level fusion for improving detection accuracy.

However, most fusion strategies are static and do not consider:

* asynchronous sensor reliability
* dynamic observation value
* stopping coordination across sensors

**Limitation:**
There is no unified optimal stopping formulation for multi-sensor perception systems, leading to redundant computation and suboptimal resource allocation.

---

## G. Summary of Research Gaps

Despite extensive progress in stochastic control, POMDPs, deep reinforcement learning, and adaptive inference, several fundamental gaps remain for industrial perception systems:

1. Classical optimal stopping theory is not directly applicable to high-dimensional visual perception spaces.
2. POMDP frameworks are theoretically sound but computationally intractable for real-time industrial vision.
3. Deep reinforcement learning methods for vision lack explicit computation-aware stopping mechanisms.
4. Existing optimal stopping RL formulations are domain-specific and not generalized to perception systems.
5. Anytime inference methods rely on heuristic thresholds rather than principled decision theory.
6. Multi-sensor perception systems lack unified stopping-time coordination frameworks.

---

## H. Position of This Work

Motivated by these limitations, this paper proposes a unified **Optimal Stopping-driven Industrial Perception Framework**, which:

* models industrial vision as a POMDP-based belief process
* integrates Bayesian belief updates with deep perception models
* learns stopping policies via data-driven decision networks
* optimizes the trade-off between accuracy, latency, and computation cost
* enables real-time deployment in industrial edge systems

This establishes a principled bridge between stochastic optimal stopping theory and modern industrial perception systems.

---

