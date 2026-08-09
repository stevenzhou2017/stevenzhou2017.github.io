---
layout: page
title: "AI安全与工业安全操作系统（AI Safety & Industrial Safety OS）"
description: "面向工业场景的AI安全、工业空间安全、安全操作系统、Safety Supervisor、功能安全、验证验证与Safety Case研究方向。"
permalink: /research/ai-safety-safety-os-cn/
category: research
graph_type: research
sitemap_priority: 0.95
---

# AI安全与工业安全操作系统

（AI Safety & Industrial Safety OS）

---

# 1. 研究概述

随着人工智能技术从数据分析、预测建模逐渐进入物理世界，
AI正在参与越来越多的工业生产决策过程：

- 感知现场环境；
- 理解人员、设备和机器状态；
- 预测潜在风险；
- 辅助或驱动工业设备执行动作。

这带来了一个核心工程问题：

> **如何让AI提升工业安全能力，同时避免AI自身成为新的安全风险来源？**

我的研究方向聚焦于：

**AI Safety（AI安全） + Industrial Safety OS（工业安全操作系统）**

探索如何将：

- 人工智能感知；
- 多模态模型；
- 空间智能；
- 风险推理；
- 功能安全；
- 确定性控制；
- 失效降级；
- V&V验证；
- Safety Case安全论证；

融合到下一代工业安全系统中。

---

# 2. 核心研究理念

## AI系统不仅需要知道“看到了什么”

传统AI视觉系统通常输出：

- 检测目标；
- 分类结果；
- 位置坐标；
- 预测结果。

但是工业安全系统需要进一步回答：

> 当前信息是否足够支持安全决策？

因此，安全型AI系统必须具备：

- 感知能力；
- 不确定性评估能力；
- 自我认知能力；
- 风险判断能力；
- 主动降级能力。

核心理念：

> **安全AI系统必须知道自己不知道什么。**

当系统无法确定当前状态是否安全时：

不是继续输出高风险决策，

而应该：

```

正常运行
↓
风险增加
↓
降低能力
↓
安全状态

```

---

# 3. Safety OS

## 面向工业空间安全的操作系统

Safety OS 是面向工业生产场景的人、车、机、料空间安全操作系统。

目标：

构建一个：

> 可感知、可理解、可推理、可控制、可验证、可追溯的工业安全智能基础设施。


系统连接：

- 立体安全传感器；
- 3D camera；
- AGV
- Robot；
- PLC；
- 工业设备；
- MES；
- 数字孪生系统。

实现：

```

物理工业世界

```
    ↓
```

LT / 3D ToF / AGV / Robot / PLC

```
    ↓
```

设备接入层 Adapter

```
    ↓
```

统一工业数据模型

```
    ↓
```

空间理解 Spatial Intelligence

```
    ↓
```

AI感知与融合

```
    ↓
```

AI Risk Engine 风险推理

```
    ↓
```

Safety Supervisor 安全监督

```
    ↓
```

PLC / Robot / AGV控制

```
    ↓
```

安全动作执行

```
    ↓
```

事件追踪 / 回放 / Safety Case

```

---

# 4. Safety OS总体架构


## 六层架构


## 4.1 安全感知层 Safety Perception


输入包括：

### 立体空间传感器

- 安全传感器；
- 3D ToF；
- RGB-D；
- 深度相机；
- 雷达。


### 工业设备状态

- AGV位置；
- AGV速度；
- Robot状态；
- PLC状态；
- 安全门；
- 急停按钮；
- 设备运行状态。


输出：

统一安全感知数据。


---

## 4.2 空间智能层 Spatial Intelligence


传统安全系统关注：

> 单个传感器是否触发。


Safety OS关注：

> 当前工业空间是否处于安全状态。


空间模型包括：

- 工厂地图；
- 工位模型；
- 危险区域；
- 虚拟围栏；
- 人员位置；
- AGV轨迹；
- Robot工作空间；
- 安全距离模型。


实现：

```

Sensor Data

```
  ↓
```

3D Spatial Model

```
  ↓
```

Risk-aware Environment Understanding

```

---

# 4.3 AI风险引擎 AI Risk Engine


AI Risk Engine负责：

综合：

- 人员位置；
- 设备状态；
- 运动趋势；
- 距离；
- 时间到碰撞；
- 环境状态；
- 传感器可信度。


输出：

```

Risk Level

Low
Medium
High
Critical

```

同时提供：

- 风险原因；
- 置信度；
- 建议动作；
- 降级策略。


---

# 4.4 Safety Supervisor 安全监督器


Safety Supervisor 是 Safety OS 的核心运行时。


作用：

连接：

```

AI风险判断

```
    +
```

功能安全逻辑

```
    +
```

设备控制

```


实现确定性的安全决策。


典型状态：

```

Normal
正常

↓

Warning
警告

↓

Slowdown
减速

↓

Pause
暂停

↓

E-Stop Request
急停请求

```


扩展状态：

```

Degraded
降级

Recovery Check
恢复检查

Fault
故障

```


设计原则：

1. 更安全动作优先；
2. 关键数据丢失必须降级；
3. 通信超时必须处理；
4. 控制失败必须有安全回退；
5. 恢复必须经过验证。


---

# 5. 安全质量数据帧 Safety Quality Frame


传统传感器输出：

```

Depth Map

```

安全型传感器需要输出：

```

Safety Quality Frame

```

包括：


## 深度信息

- Depth Value
- Depth Confidence


## 数据有效性

- Data Validity
- Data Integrity


## 环境影响

- Occlusion Ratio
- Multipath Interference
- Ambient Light Interference


## 系统状态

- Time Synchronization Status
- Calibration Status


## 安全评价

- Safety Quality Level
- Recommended Degraded Action


核心思想：

> 传感器不仅告诉系统“看到了什么”，还需要告诉系统“这些信息是否足够支持安全决策”。

---

# 6. 功能安全与AI融合


Safety OS采用分层安全策略：


```

L0
固有安全
(Inherent Safety)

```
    ↓
```

L1
功能安全
(Functional Safety)

```
    ↓
```

L2
过程控制
(Process Control)

```
    ↓
```

L3
AI增强安全
(AI Enhanced Safety)

```
    ↓
```

L4
治理与证据链
(Governance & Evidence)

```


AI不是替代传统安全机制。

AI负责：

- 增强感知；
- 提前预测；
- 风险分析；
- 智能辅助。


功能安全负责：

- 确定性保护；
- 安全状态；
- 失效处理；
- 验证闭环。


---

# 7. Safety Case与V&V验证


Safety OS采用证据驱动开发方式。


完整链路：

```

Hazard
危险

↓

Safety Goal
安全目标

↓

Safety Requirement
安全需求

↓

Design Control
设计控制

↓

Test Case
测试用例

↓

Evidence
证据

↓

Residual Risk
残余风险

```


核心工程文档：

- Hazard Log；
- HARA；
- HAZOP；
- FMEA；
- SRS；
- ICD；
- RTM；
- V&V测试报告；
- Fault Injection结果；
- Evidence Manifest；
- Residual Risk Acceptance。


---

# 8. 工业应用场景


## 8.1 锂电产线工业空间安全


典型风险：

- AGV与人员混行；
- Robot协作区域；
- 高压测试区域；
- 重载搬运；
- 设备盲区；
- 节拍耦合风险。


Safety OS提供：

- 人员检测；
- AGV轨迹预测；
- 危险区域管理；
- 安全距离计算；
- 自动减速；
- 暂停；
- 联锁控制；
- 事件回溯。


---

## 8.2 工业设备安全


可复制到：

- 冷压机；
- 涂布；
- 辊压；
- 分切；
- 卷绕；
- 装配；
- EOL测试；
- 机器人生产单元。


---

# 9. AI Safety技术路线


```

Industrial Safety

```
    ↓
```

Spatial Safety

```
    ↓
```

AI Safety

```
    ↓
```

Safety OS

```
    ↓
```

Safety Agent

```
    ↓
```

Safety Foundation Model

```
    ↓
```

Autonomous Safety Engineering

```


未来目标：

构建面向工业世界的安全智能基础设施：

- 自动风险发现；
- 自动安全分析；
- 自动生成Safety Requirement；
- 自动V&V测试；
- 自动Safety Case生成；
- 全球工业安全知识图谱。


---

# 10. 相关研究方向


- Industrial AI 工业人工智能
- AI Safety 人工智能安全
- Safety OS 工业安全操作系统
- Industrial Spatial Safety 工业空间安全
- Vision Operating System 视觉操作系统
- Industrial AI Agent 工业智能体
- 3D + AI
- Embodied AI 具身智能
- Physical AI 物理智能
- Intelligent Manufacturing 智能制造


---

# 11. 参考标准体系


Safety OS设计参考：

- IEC 61508  
  Functional Safety

- ISO 13849  
  Safety of Machinery

- IEC 62061  
  Functional Safety of Machinery

- IEC 62443  
  Industrial Cybersecurity

- ISO/IEC 42001  
  AI Management System

- ISO/IEC TR 5469  
  Artificial Intelligence Functional Safety


---

# 12. 研究愿景


未来工业安全系统将从：

```

传统安全传感器

```
    ↓
```

智能安全系统

```
    ↓
```

AI增强安全系统

```
    ↓
```

Safety OS

```
    ↓
```

自主安全智能体

```

演进。


最终目标：

> 构建能够理解工业世界、识别风险、主动保护人和设备，并且具备工程可验证性的下一代工业安全智能操作系统。

```

Industrial AI
+
AI Safety
+
Functional Safety
+
Spatial Intelligence
+
Safety Engineering

```
    ↓
```

Industrial Safety OS


---
