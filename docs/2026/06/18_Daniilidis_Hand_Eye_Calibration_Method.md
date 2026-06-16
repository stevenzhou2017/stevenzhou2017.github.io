# Daniilidis 手眼标定方法

author： 周均扬

date: 2026.06.16


---

Daniilidis 方法（由 Konstantinos Daniilidis 于 1999 年提出）是机器人视觉领域中一种经典的手眼标定（Hand-Eye Calibration）算法。它的核心作用是求解出安装在机器人上的相机（眼）与机器人末端执行器（手）之间的相对位置和姿态关系。

**核心亮点**

该方法被广泛应用于工业机器人与机械臂的视觉引导系统中，主要包含以下特性：

* 数学表达：它首次将摄像机的位姿和平移运动统一建模为“旋量（Screw）”，并使用对偶四元数（Dual Quaternions）来进行数学表示。
* 同时求解：与传统的先解旋转、再代入求解平移的“分离法（Separable Methods）”不同，Daniilidis 方法能够将旋转和平移合并在同一个方程 $A*X = X*B$ 中进行同步求解。
* 闭式解（Closed-form Solution）：通过奇异值分解（SVD），该方法能够直接解析出最优解，避免了传统非线性优化可能陷入局部最优的问题。


Daniilidis 手眼标定方法，本质上是将经典的手眼标定问题 $A*X = X*B$ 转化到**对偶四元数（Dual Quaternion）李代数空间**中求解，从而获得更稳定、更统一的闭式解（尤其适合旋转+平移耦合强的情况）。


## 1. 问题定义（Hand–Eye Calibration）

标准形式：

$$A_i * X = X * B_i$$

其中：

* $A_i \in SE(3)$：机器人末端在两次运动间的相对位姿
* $B_i \in SE(3)$：相机在两次观测间的相对位姿
* $X \in SE(3)$：手（机器人末端）到眼（相机）的固定变换

目标：求 $X = (R_X, t_X)$


## 2. Daniilidis 方法核心思想

传统方法（Tsai-Lenz）将旋转和平移分开求解，而 Daniilidis 方法： 将 (SE(3)) 映射为 **单位对偶四元数（Dual Quaternion）**，统一表达旋转+平移。


### 2.1 SE(3) → Dual Quaternion

一个刚体变换：$T = (R, t)$

对应对偶四元数：$\hat{q} = q_r + \epsilon q_d$

其中：

* $q_r$：表示旋转的单位四元数
* $q_d$：表示平移信息： $q_d = \frac{1}{2} t \cdot q_r$
* $\epsilon^2 = 0$


### 2.2 手眼方程变换

原方程：$A*X = X*B$


转成 dual quaternion： $\hat{A} \otimes \hat{X} = \hat{X} \otimes \hat{B}$

展开后变为线性约束形式。


## 3. Daniilidis 解法步骤

### Step 1：构造相对运动

对每一帧：

* $A_i = T_{i}^{-1} T_{i+1}$
* $B_i = C_{i}^{-1} C_{i+1}$

转换为 dual quaternion：$\hat{A}_i, \hat{B}_i$


### Step 2：旋转部分求解

旋转满足：$q_{A_i} \otimes q_R = q_R \otimes q_{B_i}$

转化为：$(q_{A_i} - q_{B_i}) q_R = 0$

堆叠所有样本得到：$M * q_R = 0$

用 **SVD 求最小奇异值对应特征向量**，得到 $q_R$


### Step 3：平移部分求解

利用 dual quaternion 的虚部关系：

$$q_{A_i}^d \otimes q_R + q_{A_i}^r \otimes q_t = q_R \otimes q_{B_i}^d + q_t \otimes q_{B_i}^r$$

整理为线性形式：$M_t * t = b$

用最小二乘解：$t = (M_t^T M_t)^{-1} M_t^T b$


## 4. 方法优势

  - 旋转+平移统一建模: 避免 Tsai-Lenz 的“先旋转后平移误差传播”

  - 数值稳定性强: SVD + 线性结构 → 对噪声更鲁棒

  - 无需迭代优化: 适合工业实时标定

  - SO(3) 约束自然保持: 四元数天然单位约束

---

## 5. 与 Tsai-Lenz、Lie Algebra方法对比

| 方法          | 结构              | 求解方式     | 稳定性 |
| ----------- | --------------- | -------- | --- |
| Tsai-Lenz   | 分离 R / t        | 线性+迭代    | 中等  |
| Daniilidis  | Dual Quaternion | SVD + LS | 更高  |
| Park-Martin | Lie algebra     | 非线性优化    | 高但慢 |

---

## 6. 工程实现要点

在工业视觉系统中实现（比如 CameraSDK + Robot SDK）：

### 输入：

* robot poses: $T_{base\to hand}$
* camera poses: $T_{target\to cam}$

### 输出：

* $X_{hand\to camera}$


### 实现建议：

* 使用 Eigen + Sophus 或自定义 dual quaternion
* SVD 使用 Eigen::JacobiSVD
* 数据要求 ≥ 10–20 帧不同运动姿态
* 运动必须“激励充分”（rotation + translation 都要变化）

---

## 7. 常见问题

   - 纯平移或纯旋转数据 → 矩阵秩不足，解不唯一

   - quaternion 未归一化 → 旋转漂移

   - 右乘/左乘约定混乱 → AX=XB 方向错误

---

## 8. 一句话总结

Daniilidis 方法的本质是： 用对偶四元数把 SE(3) 的“旋转 + 平移耦合问题”变成一个统一的线性代数问题，然后用 SVD 一步解出最优手眼变换。

---

