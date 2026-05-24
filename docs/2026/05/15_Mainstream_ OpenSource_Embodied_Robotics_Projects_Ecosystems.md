# **主流的开源具身机器人项目与生态**

author: 周均扬

date： 2026.05.24

---

## 1. 开源硬件机器人平台

### 1. **OpenARM 经济型开源人形机械臂**

**描述**：国产完全开源的双臂机械臂平台，包含完整 CAD、固件、控制代码、仿真支持和社区生态。适合真实场景的抓取、物流、工业自动化任务开发。([OpenArm][^1])

**优点**

* 硬件+软件完整开源，可自由修改与二次开发。([OpenArm][^1])
* 兼容 MuJoCo / Isaac Sim 仿真，有利于训练策略和Sim2Real调试。([OpenArm][^1])
* 支持多底盘类型和高自由度抓取任务。([OpenArm][^1])

**限制**

* 作为机械臂平台，对全身动态平衡与移动性支持不足。([OpenArm][^1])
* 社区规模尚在成长阶段，资源相对较少。([OpenArm][^1])


### 2. **ReBot-DevArm（开源机械臂）**

GitHub 项目，提供机械臂的完整硬件设计、BOM 及 ROS/仿真集成方案（支持 Python SDK、ROS1/2、Isaac Sim、LeRobot 等）。([MemeData][^2])

**优点**

* 真正开放硬件设计 + 软件实现，适合快速构建物理机器人原型。([MemeData][^2])
* 与 ROS1/2、Isaac Sim 和 LeRobot 集成，便于快速部署策略学习和视觉集成。([MemeData][^2])
* 有社区教程和教程计划，加速上手。([MemeData][^2])

**限制**

* 负载能力较为有限（适合桌面级任务）。([MemeData][^2])
* 对全身机器人（例如双足或移动抓取机器人）扩展性受限。([MemeData][^2])



### 3. **Barkour Robot（DeepMind 四足机器人开源项目）**

DeepMind 开源的四足机器人设计文件、仿真模型、嵌入式代码和硬件 CAD，在动态运动研究与高自由度平台上具有价值。([东海gc][^3])

**优点**

* 全开源的四足动态机器人平台，适合平衡、跳跃、规划等核心研究。([东海gc][^3])
* 提供 MuJoCo 仿真和底层控制器设计，有助于强化学习训练整合。([东海gc][^3])

**限制**

* 硬件搭建难度高，对电机驱动和嵌入式控制要求严格。([东海gc][^3])
* 社区成熟度和扩展文档较少。([东海gc][^3])



### 4. **iCub（开放源代码的人形机器人）**

学术界经典的开源人形机器人平台，可用于认知机器人、控制算法、仿真与学习研究。([维基百科][^4])

**优点**

* 专注研究用途，社区历史悠久，生态丰富。([维基百科][^4])
* 支持高级控制与学术实验，是许多大学与研究机构的首选平台。([维基百科][^4])

**限制**

* 本体构造复杂，成本和搭建难度较高。([维基百科][^4])


### 5. **InMoov（3D打印开源人形平台）**

利用 3D 打印组件和 Arduino 控制器构建的开源机器人，适合教育和原型开发。([维基百科][^5])

**优点**

* 低成本、易制造、社区活跃。([维基百科][^5])
* 适合初学者理解机器人形体与控制。([维基百科][^5])

**限制**

* 机械强度与精度一般，不适合高性能感知与控制任务。([维基百科][^5])



## 2. 机器人软件与生态项目

这些项目不直接包含硬件，但对于具身智能算法开发、训练流程、仿真或集成非常关键。

### 1. **Intern Robotics 平台**

开源工具链用于具身 AI 感知、导航、操作与全身控制研究，包含仿真、模型和 benchmark。([GitHub][^6])

**适用场景**

* 机器人导航、操作和强化学习训练平台集成。([GitHub][^6])



### 2. **Stretch（Embodied AI）社区与资源**

OpenStretch 是一个模块化的机器人研究平台，配合社区开源模型、数据和任务框架（例如 OK-Robot、Teach a Robot to Fish、ForceSight）。([Hello Robot][^7])

**优点**

* 提供开源策略与实际任务数据，有助于端到端学习。([Hello Robot][^7])

**限制**

* 通常需结合特定硬件或底盘来实际部署。([Hello Robot][^7])


### 3. **Every-Embodied（datawhalechina）**

教育型具身智能项目，讲解如何从零搭建具身机器人和决策系统，可作为入门学习资源。([GitFind][^8])

**优点**

* 低门槛、侧重概念与实操教学。([GitFind][^8])

**限制**

* 不包含高级控制算法或复杂机器人平台实现。([GitFind][^8])

---

## 3. 选型建议（按用途分类）

| **用途**    | **推荐项目**                    | **说明**     |
| --------- | --------------------------- | ---------- |
| 入门与教学     | InMoov、Every-Embodied       | 低门槛理解硬件与控制 |
| 工业 / 应用原型 | OpenARM、ReBot-DevArm        | 可部署真实任务    |
| 平衡与动态控制研究 | Barkour                     | 高自由度运动平台   |
| 学术级全身机器人  | iCub                        | 全面实验支撑     |
| 软件与生态     | Intern Robotics、Stretch、ROS | 算法训练与集成基础  |

---

## 4. 工程实施注意事项

1. **仿真优先**：建议先用 MuJoCo / Isaac Sim 等仿真平台验证控制策略，再迁移到真机。([Hello Robot][7])
2. **ROS/ROS2 生态**：几乎所有项目都基于 ROS，建议掌握 ROS 与 Gazebo/RVIZ 集成。([reddit.com][9])
3. **数据集与模型**：利用社区数据集（OpenLET 等）可以提升模型训练效果。([openlet.openatom.tech][10])
4. **模块化分层控制**：将感知、规划和低级控制分层，实现大小脑式架构，提高鲁棒性。

---


## 5. 参考资料
[^1]: "OpenARM 官方中文社区 -经济型开源人形机械臂,国产供应链驱动下的开源软硬件DIY机器人解决方案双臂半人形机器人 -OpenArm开源仿人形机械臂", https://www.openarm.cn/?utm_source=chatgpt.com 

[^2]: "ReBot-DevArm：开源机械臂", https://memedata.com/post/113632?utm_source=chatgpt.com 

[^3]: "barkour_robot - Google DeepMind四足机器人开源项目 - 懂AI", https://www.dongaigc.com/p/google-deepmind/barkour_robot?utm_source=chatgpt.com 

[^4]: "ICub", https://en.wikipedia.org/wiki/ICub?utm_source=chatgpt.com 

[^5]: "InMoov", https://en.wikipedia.org/wiki/InMoov?utm_source=chatgpt.com 

[^6]: "Intern Robotics · GitHub", https://git.hubp.de/InternRobotics?utm_source=chatgpt.com 

[^7]: "Embodied AI — Hello Robot", https://hello-robot.com/stretch-embodied-ai?utm_source=chatgpt.com 

[^8]: "datawhalechina/every-embodied — GitFind", https://gitfind.ai/project/datawhalechina/every-embodied?utm_source=chatgpt.com 

[^9]: "Trying to understand why everyone stick to ROS 2", https://www.reddit.com/r/robotics/comments/1m38m5c/trying_to_understand_why_everyone_stick_to_ros_2/?utm_source=chatgpt.com 

[^10]: "OpenLET具身智能开源数据集社区", https://openlet.openatom.tech/?utm_source=chatgpt.com 




