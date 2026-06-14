# 环境视觉 (Environment-Centric Vision)

author: 周均扬

date：2026.06.14

---

Object-Centric Vision（目标视觉）的视觉链路主要关注: 目标检测、货物识别、托盘识别、OCR、缺陷检测等。

而实现 Agent 自主决策，需要增加：Environment-Centric Vision（环境视觉），即让 Agent 理解：
```text
我在哪？环境是什么状态？周围发生了什么？未来会发生什么？
```

---

## 1. 环境视觉的位置

升级 L7 Perception Intelligence 为Perception Intelligence Layer： 
```text
┌──────────────────────────────────────────┐
│        Perception Intelligence Layer     │
├──────────────────────────────────────────┤
│ Vision Agent                             │
│ LiDAR Agent                              │
│ Sensor Agent                             │
│ Environment Agent                        │
│ Fusion Agent                             │
│ World Model Agent                        │
└──────────────────────────────────────────┘
```

---

## 2. 环境视觉感知对象

### 1 空间环境
    - 识别：通道、货架、工作站、装卸口、充电桩、危险区域
    - 形成：Semantic Map

### 2 动态环境
    - 识别：人、叉车、AGV、AMR、托盘车
    - 形成：Dynamic Occupancy Map

### 3 环境状态
    - 识别：拥堵、堵塞、空闲、异常占用、逆行
    - 形成：Environment State

---

## 3. 环境视觉协议体系

环境视觉通常不是单一协议。

而是：Video + 3D + Localization + Semantic 融合。

---

## 4. 环境摄像头协议

### IPC摄像头
    - 适合：园区监控、仓库监控、人员识别
    - 协议：RTSP、RTMP、WebRTC、ONVIF
    - 推荐：RTSP + ONVIF 组合。

实际上：ONVIF 是环境视觉核心协议。

作用：发现摄像头、控制PTZ、获取状态、事件通知

架构： Camera --- ONVIF --- Camera Manager

---

##  5.环境3D感知协议

LiDAR: 
    - 推荐ROS2 DDS
    - 点云：/points
    - 定位：/odom
    - 地图：/map

---

## 6. VSLAM协议体系

环境理解需要：Visual SLAM

数据来源：RGB、Depth、IMU等

协议：ROS2 DDS

输出：Pose + Map + Trajectory

---

## 7. 数字地图协议

环境视觉最终生成：World Model

需要地图协议。

推荐：OpenDRIVE 或者 Lanelet2

适合：仓储、园区、物流中心

---

## 八、环境事件协议

环境Agent不传视频，传事件。

例如：
```json
{
  "event":"AISLE_BLOCKED",
  "zone":"A03"
}
```

```json 
{
  "event":"HUMAN_ENTER"
}
```

```json 
{
  "event":"FORKLIFT_APPROACHING"
}
```

进入：Kafka


---

## 9. 环境视觉推荐协议栈

   - 仓储物流：IPC Camera -- RTSP -- Vision Agent -- Kafka -- LiDAR -- ROS2 DDS -- Fusion Agent -- Environment Agent -- Kafka -- Scheduler Agent。
   - 数字孪生仓库：Camera -- ONVIF + RTSP -- LiDAR -- ROS2 DDS -- IMU -- ROS2 DDS -- Fusion Agent -- World Model Agent -- Digital Twin。
   - 未来具身智能： Vision/LiDAR/Audio/RFID/IoT -> Environment Agent -> World Model Agent -> Planner Agent。

---

## 10. 完整感知协议架构

```text 
┌─────────────────────────────────────────┐
│          Environment Vision Layer        │
├─────────────────────────────────────────┤
│ IPC Camera                               │
│    RTSP + ONVIF                          │
├─────────────────────────────────────────┤
│ Industrial Camera                        │
│    GenICam + GigE Vision                 │
├─────────────────────────────────────────┤
│ LiDAR                                    │
│    ROS2 DDS                              │
├─────────────────────────────────────────┤
│ IMU                                      │
│    ROS2 DDS                              │
├─────────────────────────────────────────┤
│ RFID                                     │
│    MQTT                                  │
├─────────────────────────────────────────┤
│ PLC                                      │
│    OPC UA                               │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          Fusion / World Model Agent      │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          Kafka Event Bus                 │
└─────────────────────────────────────────┘
                 │
                 ▼
      Planner Agent
                 │
                 ▼
      Scheduler Agent
                 │
                 ▼
         Robot Agent
```

变化是：从 传统视觉 -> 识别目标 升级为: 环境视觉 -> 构建世界模型 -> 驱动Agent决策。

最终形成：Physical World -> Perception Layer -> World Model Agent -> Planner Agent -> Scheduler Agent -> Robot Agent -> Physical World

接近当前具身智能（Embodied AI）、仓储机器人群体智能和 Agentic Logistics Platform 的主流演进方向。
