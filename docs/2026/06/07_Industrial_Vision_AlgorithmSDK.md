# 工业视觉算法层(AlgorithmSDK)设计方案

author： 周均扬

date： 2026.06.06

---

针对算法层（IndustrialVisionSDK）进行了详细设计。


## 1. 设计原则

1. **模块化**：每个功能模块独立，支持插件式扩展。
2. **统一接口**：所有算法输入输出统一使用`VisionFrame`数据对象，方便跨线程、跨语言调用。
3. **多语言支持**：C++核心实现 + Python绑定。
4. **硬件加速**：GPU/CPU可切换，支持TensorRT、ONNX Runtime。
5. **AI与CV融合**：传统视觉算法和AI算法协同工作，可在同一流程中组合。
6. **未来可扩展**：预留VLM/VLA接口，实现视觉大模型工业智能体。

---

## 2. 核心模块

| 模块                      | 功能                         | 技术/实现                              |
| ----------------------- | ---------------------------------- | -------------------------------------- |
| **CV Toolkit**          | 图像增强、几何变换、边缘检测、Blob分析、轮廓检测 | OpenCV算法封装                  |
| **Measurement Toolkit** | 卡尺、圆检测、线检测、亚像素精度测量         | 高精度亚像素算法                           |
| **Calibration Toolkit** | 相机标定、手眼标定、多相机标定、3D标定       | OpenCV + 自研优化                      |
| **3D Toolkit**          | 点云滤波、平面拟合、ICP配准、结构光处理      | PCL/自研算法                           |
| **AI Toolkit**          | 目标检测、分割、分类、OCR、异常检测        | PyTorch/TensorFlow + ONNX/TensorRT |
| **VLM Toolkit**         | 视觉大模型接入、工业智能体、自动报告生成       | Qwen-VL、InternVL、GPT-4o等           |
| **数据对象统一**              | VisionFrame                | 支持零拷贝、多线程、跨语言、带元数据（时间戳、相机ID）       |

---

## 3. VisionFrame示例设计

```cpp
//VisionFrame.h

#pragma once
#include <opencv2/opencv.hpp>

#include <string>
#include <map>
#include <memory>
#include <any>

enum class PixelFormat
{
    RGB,
    BGR,
    GRAY,
    NV12
};

struct VisionFrame
{
    cv::Mat image;

    PixelFormat format = PixelFormat::BGR;

    std::string camera_id;

    double timestamp = 0.0;

    std::map<std::string, std::any> metadata;

    int width() const
    {
        return image.cols;
    }

    int height() const
    {
        return image.rows;
    }

    bool empty() const
    {
        return image.empty();
    }
};

```

* 支持零拷贝传递
* 可同时被多个模块处理
* 支持AI推理/传统CV算法输入

---

## 4. 算法流程设计

工业视觉平台典型流程：

1. **CameraSDK采集 → VisionFrame**：CameraSDK -> (Adapter Layer) -> UnifiedFrame -> (Adapter Layer) -> AlgorithmSDK：VisionFrame
2. **CV Toolkit预处理**（去噪、增强、ROI裁切）
3. **Measurement/Calibration/3D Toolkit**（尺寸测量、位置校正、点云处理）
4. **AI Toolkit推理**（目标检测/缺陷检测/分割）
5. **VLM Toolkit智能分析**（视觉问答、自动生成检测报告）
6. **Workflow Engine流程编排**（组合多个算法模块）
7. **输出结果**（Web监控、MES/ERP集成、数据库存储）

---

## 5. 分布式与边缘部署

* **边缘部署**：工业PC、GPU加速器、本地推理
* **分布式部署**：支持多台设备协同采集和AI推理
* **推理优化**：ONNX/TensorRT模型加速
* **任务调度**：Workflow Engine自动管理各模块计算资源

---

## **总结**：

* AlgorithmSDK作为算法核心，融合传统CV与AI
* 统一数据对象（VisionFrame）保证跨模块通信和零拷贝
* 分布式部署与边缘计算保证工业落地能力

---
