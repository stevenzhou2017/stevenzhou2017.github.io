# AI Agent驱动智能物流平台设计

author：周均扬

date：2026.06.13

---

采用传统的直接调用模式： CameraSDK -> Algorithm，只能支撑：单机视觉、单相机、单算法；而无法支撑：多相机、多Agent、多机器人、数字孪生、环境感知。

---

## 1. 架构

```text
┌───────────────────────────┐
│ CameraSDK Layer           │
└────────────┬──────────────┘
             │
             ▼
┌───────────────────────────┐
│ Vision Runtime            │
│ Frame Pipeline            │
└────────────┬──────────────┘
             │
             ▼
┌───────────────────────────┐
│ AlgorithmSDK Service         │
│ CV Toolkit                │
│ AI Toolkit                │
└────────────┬──────────────┘
             │
             ▼
┌───────────────────────────┐
│ Vision Agent             │
└────────────┬──────────────┘
             │
             ▼
         Event Bus
```

---

## 2. 职责划分

### 1. CameraSDK

- 只负责：发现相机、打开相机、配置参数、采集图像、时间同步、Buffer管理
- 不负责：目标检测、OCR、测量、AI推理

### 2. AlgorithmSDK

- 负责：图像增强、测量、OCR、目标检测、分割、跟踪、3D视觉

### 3. Vision Agent

- 负责：感知理解、场景分析、事件生成、向Planner Agent汇报

## 3. 数据契约 VisionFrame

### VisionFrame

统一输入

```cpp
#pragma once

#include <memory>
#include <string>
#include <cstdint>

namespace VisionOS
{

enum class PixelFormat
{
    RGB8,
    BGR8,
    GRAY8,
    NV12
};

struct VisionFrame
{
    std::shared_ptr<uint8_t> data;

    uint32_t width;
    uint32_t height;

    uint32_t stride;

    PixelFormat format;

    uint64_t timestamp;

    std::string cameraId;

    uint64_t frameId;
};

}
```

CameraSDK输出：

```cpp
VisionFrame
```

---

## 4. CameraSDK回调

### CameraManager

```cpp
class CameraManager
{
public:

    using FrameCallback =
        std::function<void(const VisionFrame&)>;

    void setFrameCallback(FrameCallback cb);

};
```


采集：

```cpp
camera->setFrameCallback(
[](const VisionFrame& frame)
{
    ...
});
```

---

## 5. AlgorithmSDK调用

传统：Camera -> Algorithm

升级：Camera -> Frame Pipeline -> Algorithm Service


### Algorithm接口

```cpp
class IAlgorithm
{
public:

    virtual AlgorithmResult
    process(
        const VisionFrame& frame)=0;
};
```

例如：

```cpp
class YOLODetector :
    public IAlgorithm
{
public:

    AlgorithmResult process(
        const VisionFrame& frame) override;
};
```

---

## 6. 完整调用流程

Camera -> CameraSDK -> VisionFrame -> AlgorithmSDK -> DetectionResult -> VisionAgent -> EventBus


## 7. 异步架构

Camera Thread -> Frame Queue -> Inference ThreadPool -> Result Queue -> Vision Agent

代码：

```cpp
camera->setFrameCallback(
[this](const VisionFrame& frame)
{
    frameQueue.push(frame);
});
```


推理线程：

```cpp
void worker()
{
    while(true)
    {
        VisionFrame frame;

        frameQueue.pop(frame);

        auto result =
            detector.process(frame);

        resultQueue.push(result);
    }
}
```

---

## 8. 事件模型

算法不要直接控制机器人。

- 错误：YOLO -> Robot

- 正确：YOLO -> Event -> Planner Agent -> Scheduler Agent -> Robot Agent

### DetectionEvent

```cpp
struct DetectionEvent
{
    std::string type;
    std::string source;
    double confidence;
    uint64_t timestamp;
};
```

例如：

```cpp
DetectionEvent event;
event.type = "PalletDetected";
```

---

## 9. Vision Agent

负责理解算法结果。


例如，算法输出：
```text
Person
Forklift
Pallet
```

Vision Agent理解：人员进入危险区

代码：

```cpp
if(personInDangerZone)
{
    publish(
    {
        "HumanInDangerArea"
    });
}
```

---

## 10. Kafka通信

Vision Agent：

```cpp
publish(
{
    "event":"HumanInDangerArea",
    "zone":"A01"
});
```

发送：Kafka

Scheduler Agent：

```cpp
subscribe(
    "HumanInDangerArea");
```

---

## 11. 控制链路

控制链路与视频链路分离。

- 数据链路：Camera -> VisionFrame -> Algorithm -> Vision Agent
- 控制链路：Vision Agent -> Planner Agent -> Scheduler Agent -> Robot Agent -> Robot

## 12. 零拷贝架构

推荐：

```cpp
VisionFrame
{
    std::shared_ptr<uint8_t> data;
}
```

算法：

```cpp
Algorithm::process(
    const VisionFrame&)
```

避免：

```cpp
cv::Mat clone()
```

实现：CameraSDK -> Zero Copy Buffer -> CUDA Tensor -> TensorRT -> Vision Agent

---

## 13. 最终架构

```text
Industrial Camera
       │
 GenICam/GigEVision
       │
       ▼
 CameraSDK
       │
 VisionFrame
       │
       ▼
 Frame Pipeline
       │
       ▼
 AlgorithmSDK
(CV/Calibration/Measurement/AI)
       │
 DetectionResult
       │
       ▼
 Vision Agent
       │
 Kafka Event
       │
       ▼
 Planner Agent
       │
       ▼
 Scheduler Agent
       │
       ▼
 Robot Agent
       │
       ▼
 AGV / AMR / PLC
```

**CameraSDK → AlgorithmSDK → AI Agent → Digital Twin → Robot Runtime** 能够自然扩展到：

* 多相机（100+ Camera）
* 多算法（CV + OCR + Measurement + AI）
* 多Agent协同
* ROS2机器人集群
* Kafka事件总线
* 数字孪生仓库
* 具身智能物流平台

同时保持 **CameraSDK 与 AlgorithmSDK 解耦、数据链路与控制链路解耦、感知与决策解耦**，支持系统长期演进。
