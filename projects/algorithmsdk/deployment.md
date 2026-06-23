# AlgorithmSDK 交付文档

> **版本**: 1.0.0 (commit 7bde9b2)
> **交付日期**: 2026-06-23
> **适用范围**: Windows 10+ / Visual Studio 2026 / Python 3.14

---

## 目录

1. [概述](#1-概述)
   - 1.1 [项目简介](#11-项目简介)
   - 1.2 [交付版本](#12-交付版本)
   - 1.3 [交付清单](#13-交付清单)
   - 1.4 [功能矩阵](#14-功能矩阵)
2. [快速入门](#2-快速入门)
   - 2.1 [环境要求](#21-环境要求)
   - 2.2 [安装](#22-安装)
   - 2.3 [5分钟体验](#23-5分钟体验)
3. [架构总览](#3-架构总览)
   - 3.1 [分层架构](#31-分层架构)
   - 3.2 [模块关系](#32-模块关系)
   - 3.3 [VisionFrame 数据流](#33-visionframe-数据流)
   - 3.4 [单例模式](#34-单例模式)
4. [功能模块详解](#4-功能模块详解)
   - 4.1 [CVToolkit 传统视觉](#41-cvtoolkit-传统视觉)
   - 4.2 [Measurement 工业测量](#42-measurement-工业测量)
   - 4.3 [Calibration 标定](#43-calibration-标定)
   - 4.4 [3DToolkit 3D视觉](#44-3dtoolkit-3d视觉)
   - 4.5 [AIToolkit AI推理](#45-aitoolkit-ai推理)
   - 4.6 [VLMToolkit](#46-vlmtoolkit)
5. [部署指南](#5-部署指南)
   - 5.1 [依赖清单](#51-依赖清单)
   - 5.2 [编译构建](#52-编译构建)
   - 5.3 [Python 包安装](#53-python-包安装)
   - 5.4 [部署文件](#54-部署文件)
   - 5.5 [常见问题](#55-常见问题)
6. [附录](#6-附录)
   - A.1 [配置文件参考](#a1-配置文件参考)
   - A.2 [模型训练与导出](#a2-模型训练与导出)
   - A.3 [坐标与单位约定](#a3-坐标与单位约定)
   - A.4 [术语表](#a4-术语表)
   - A.5 [已知限制与路线图](#a5-已知限制与路线图)

---

## 1. 概述

### 1.1 项目简介

AlgorithmSDK 是一套**工业视觉算法软件开发工具包**，覆盖传统计算机视觉、AI 深度学习推理和 3D 视觉三大领域。SDK 以 C++ 为核心，通过 pybind11 提供 Python 接口，面向工业检测、测量、标定、机器人视觉等场景。

**核心能力：**

- **传统 CV**：图像增强、边缘检测、轮廓/斑点分析、模板匹配、几何计算
- **工业测量**：距离、直径、角度、面积、高度、体积、位姿、GD&T 公差、轮廓度
- **标定**：单目/双目标定、手眼标定、外参估计、ICP 点云精配准
- **3D 视觉**：点云生成、深度图处理、结构光、ICP 配准
- **AI 推理**：YOLO 检测/分割（ONNX Runtime 后端）、ByteTrack 多目标跟踪
- **VLM**：视觉语言模型接口预留

### 1.2 交付版本

| 项目 | 值 |
|------|-----|
| 版本号 | 1.0.0 |
| Git Commit | `7bde9b2` |
| 分支 | master |
| 交付日期 | 2026-06-23 |
| C++ 标准 | C++17 |
| CMake 最低版本 | 3.22 |

### 1.3 交付清单

#### C++ 核心库

| 库文件 | 说明 |
|--------|------|
| `algorithm_vision.dll` | 全量 SDK（包含所有模块） |
| `algorithm_vision_cvtoolkit.dll` | CVToolkit 独立子库 |
| `algorithm_vision_measurement.dll` | Measurement 独立子库 |
| `algorithm_vision_calibration.dll` | Calibration 独立子库 |
| `algorithm_vision_3dtoolkit.dll` | 3DToolkit 独立子库 |
| `algorithm_vision_aitoolkit.dll` | AIToolkit 独立子库 |

#### Python 包

| 文件 | 说明 |
|------|------|
| `industrial_sdk_core.*.pyd` | pybind11 绑定模块 |
| `python/industrial_sdk/` | Python 包目录（`pip install -e .`） |

#### 示例程序

| 文件 | 说明 |
|------|------|
| `examples/cvtoolkit_demo.cpp` | CVToolkit 功能演示 |
| `examples/calibration_demo.cpp` | 标定功能演示 |
| `examples/hand_eye_demo.cpp` | 手眼标定演示 |
| `examples/measurement_demo.cpp` | 测量功能演示 |
| `examples/3dtoolkit_demo.cpp` | 3D 功能演示 |
| `detect_yolo.py` | YOLO 检测脚本 |
| `segment_yolo.py` | YOLO 分割脚本 |

#### 模型文件

| 文件 | 说明 |
|------|------|
| `assets/yolo26n.onnx` | YOLO26n 检测模型 (~10MB) |
| `assets/yolo26n-seg.onnx` | YOLO26n 分割模型 (~11MB) |

#### 第三方依赖

| 依赖 | 版本 | 类型 |
|------|------|------|
| OpenCV | （系统安装） | 必需 |
| pybind11 | （系统安装） | 必需 |
| ONNX Runtime | 1.26.0 | AI 推理必需 |
| Eigen3 | 3.4+ (bundled) | 标定必需 |
| spdlog | （bundled） | 日志 |
| yaml-cpp | （bundled） | 配置解析 |
| PCL | （可选） | ICP 加速 |
| MPI | （可选） | 并行加速 |

### 1.4 功能矩阵

#### CVToolkit

| 功能 | 状态 | 类 |
|------|------|-----|
| 图像增强 | ✅ | `ImageEnhance` |
| 边缘检测 | ✅ | `EdgeDetector` |
| 轮廓分析 | ✅ | `ContourAnalyzer` |
| 斑点分析 | ✅ | `BlobAnalyzer` |
| 模板匹配 | ✅ | `TemplateMatcher` |
| 几何工具 | ✅ | `GeometryUtils` |

#### Measurement

| 功能 | 状态 | 类 |
|------|------|-----|
| 距离测量 | ✅ | `DistanceMeasurement` |
| 直径测量 | ✅ | `DiameterMeasurement` |
| 半径测量 | ✅ | `RadiusMeasurement` |
| 角度测量 | ✅ | `AngleMeasurement` |
| 面积测量 | ✅ | `AreaMeasurement` |
| 高度测量 | ✅ | `HeightMeasurement` |
| 体积测量 | ✅ | `VolumeMeasurement` |
| 位姿测量 | ✅ | `PoseMeasurement` |
| GD&T 公差 | ✅ | `GDTMeasurement` |
| 轮廓度 | ✅ | `ProfileMeasurement` |
| 测量管理器 | ✅ | `MeasurementManager` |

#### Calibration

| 功能 | 状态 | 类 |
|------|------|-----|
| 内参标定 | ✅ | `IntrinsicCalibrator` |
| 外参标定 | ✅ | `ExtrinsicCalibrator` |
| 立体标定 | ✅ | `StereoCalibrator` |
| 手眼标定 | ✅ | `HandEyeCalibrator` |
| ICP 精配准 | ✅ | `ICPRefiner`（PCL加速+OpenCV回退） |
| 标定入口 | ✅ | `CalibrationToolkit` |

#### 3DToolkit

| 功能 | 状态 | 类 |
|------|------|-----|
| 点云处理 | ✅ | `PointCloud` |
| 深度图处理 | ✅ | `DepthMap` |
| 结构光 | ✅ | `StructLightProcessor` |
| ICP 配准 | ✅ | `ICPRegistration` |

#### AIToolkit

| 功能 | 状态 | 类/说明 |
|------|------|---------|
| YOLO 目标检测 | ✅ | ONNX 后端完整支持 |
| YOLO 实例分割 | ✅ | 含掩码重建，ONNX 后端 |
| YOLO 分类 | ⚠️ | 枚举已定义，适配器未实现 |
| YOLO 姿态估计 | ⚠️ | 枚举已定义，适配器未实现 |
| YOLO 旋转框(OBB) | ⚠️ | 枚举已定义，适配器未实现 |
| YOLOE 开放词汇 | ✅ | 提示嵌入+检测+分割 |
| ByteTrack 跟踪 | ✅ | GMC 全局运动补偿 |
| TensorRT 后端 | ⚠️ | 适配器已编写，待启用 |
| 模型配置化 | ✅ | YAML 配置文件 |

#### VLMToolkit

| 功能 | 状态 | 说明 |
|------|------|-----|
| VLM 推理接口 | 🔲 | `IVLMEngine` 纯虚接口已定义，预留 |

---

## 2. 快速入门

### 2.1 环境要求

| 项目 | 要求 |
|------|------|
| 操作系统 | Windows 10/11 (64-bit) |
| Python | 3.14 |
| OpenCV | 安装于 `D:/opencv` |
| ONNX Runtime | 安装于 `D:/onnxruntime`（需 AI 推理时） |
| Visual Studio | 2026 (v143 工具集) |
| CMake | 3.22+ |

### 2.2 安装

```bash
cd D:\nnd\AlgorithmSDK

# 方式一：pip 安装 Python 包（自动触发 CMake 编译）
cd python
pip install -e .

# 方式二：手动 CMake 编译
mkdir build && cd build
cmake .. -G "Visual Studio 18 2026" -DCMAKE_BUILD_TYPE=Release
cmake --build . --config Release -j4
```

编译产物自动拷贝至 `python/industrial_sdk/`，包括所有 DLL 和 `.pyd` 绑定模块。

验证安装：

```python
from industrial_sdk import AIToolkit, cv
print("AlgorithmSDK 安装成功")
```

### 2.3 5分钟体验

```python
import cv2
from industrial_sdk import AIToolkit, MeasurementManager

# ── 1. 加载图片 ──
img = cv2.imread("data/image/test.jpg")

# ── 2. AI 检测 ──
ai = AIToolkit.instance()
ai.loadModel("assets/yolo26n.onnx", "detect", "onnx")

result = ai.detectEx(img)
for box in result.boxes:
    print(f"检测到: {box.class_name}, 置信度: {box.confidence:.2f}")
    cv2.rectangle(img, (box.x1, box.y1), (box.x2, box.y2), (0, 255, 0), 2)

# ── 3. 测量 ──
mgr = MeasurementManager.instance()

# 获取第一个检测框的中心点用于测量
if result.boxes:
    b = result.boxes[0]
    cx, cy = (b.x1 + b.x2) // 2, (b.y1 + b.y2) // 2
    print(f"目标中心: ({cx}, {cy})")

# ── 4. 保存结果 ──
cv2.imwrite("output.jpg", img)
print("结果已保存到 output.jpg")
```

---

## 3. 架构总览

### 3.1 分层架构

```
┌──────────────────────────────────────────────┐
│             Python API                        │
│    from industrial_sdk import AIToolkit, ...  │
└──────────────────┬───────────────────────────┘
                   │ import
                   ▼
┌──────────────────────────────────────────────┐
│         pybind11 绑定层                        │
│    industrial_sdk_core.*.pyd                  │
│    (bindings/algorithm_sdk_core.cpp)          │
└──────────────────┬───────────────────────────┘
                   │ C++ ABI
                   ▼
┌──────────────────────────────────────────────┐
│         C++ SDK Core                          │
│    algorithm_vision.dll (全量库)              │
│    ┌──────────────────────────────────────┐  │
│    │ CVToolkit  │ Measurement│ Calibration │  │
│    │ 3DToolkit  │ AIToolkit  │ VLMToolkit  │  │
│    └──────────────────────────────────────┘  │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│          第三方依赖                             │
│    OpenCV  │ ONNX Runtime │ Eigen3 │ spdlog   │
│    yaml-cpp │ PCL (可选)  │ MPI (可选)         │
└──────────────────────────────────────────────┘
```

### 3.2 模块关系

SDK 提供两种构建产物：

- **全量库 `algorithm_vision.dll`**：包含全部 6 个模块，供 Python 绑定使用。
- **独立子库**：每个模块可单独编译链接，减少体积：

| 子库 | CMake Target |
|------|-------------|
| `algorithm_vision_cvtoolkit.dll` | `algorithm_vision_cvtoolkit` |
| `algorithm_vision_measurement.dll` | `algorithm_vision_measurement` |
| `algorithm_vision_calibration.dll` | `algorithm_vision_calibration` |
| `algorithm_vision_3dtoolkit.dll` | `algorithm_vision_3dtoolkit` |
| `algorithm_vision_aitoolkit.dll` | `algorithm_vision_aitoolkit` |

```
algorithm_vision (全量)
  ├── algorithm_vision_cvtoolkit
  ├── algorithm_vision_measurement
  ├── algorithm_vision_calibration
  ├── algorithm_vision_3dtoolkit
  ├── algorithm_vision_aitoolkit
  └── VLMToolkit (编译在全量库内)

各 demo 链接各自的独立子库。
```

### 3.3 VisionFrame 数据流

`VisionFrame` 是 SDK 的核心数据载体，封装图像及其元数据，贯穿整个流水线：

```
┌─────────────────────────────────────┐
│           VisionFrame               │
├─────────────────────────────────────┤
│  cv::Mat  image          // 图像数据 │
│  int      camera_id      // 相机ID  │
│  uint64_t timestamp      // 时间戳  │
│  vector<DetectionBox>    // 检测结果 │
│  vector<SegmentationBox> // 分割结果 │
│  Mat      depth_map      // 深度图  │
│  Mat      point_cloud    // 点云    │
└─────────────────────────────────────┘

CVToolkit → VisionFrame → Measurement → VisionFrame (含测量结果)
                         → AIToolkit   → VisionFrame (含检测/分割)
                         → 3DToolkit   → VisionFrame (含点云)
```

### 3.4 单例模式

以下类采用单例模式，通过 `.instance()` 获取全局唯一实例：

| 单例类 | 访问方式 (Python) |
|--------|------------------|
| `AIToolkit` | `AIToolkit.instance()` |
| `CalibrationToolkit` | `CalibrationToolkit.instance()` |
| `MeasurementManager` | `MeasurementManager.instance()` |

单例保证模型只加载一次、标定参数全局共享、测量配置一致。

---

## 4. 功能模块详解

### 4.1 CVToolkit 传统视觉

基于 OpenCV 封装的图像处理工具集，全部为静态方法类，无需实例化。

#### 能力概览

| 类 | 功能 | 核心方法 |
|----|------|---------|
| `ImageEnhance` | 图像增强 | 直方图均衡化、伽马校正、锐化、亮度/对比度调整 |
| `EdgeDetector` | 边缘检测 | Canny、Sobel、Laplacian，自适应阈值 |
| `ContourAnalyzer` | 轮廓分析 | 查找轮廓、面积/周长/矩、多边形逼近、凸包、最小外接矩形 |
| `BlobAnalyzer` | 斑点检测 | 基于面积/圆度/惯性比/凸度的多条件过滤 |
| `TemplateMatcher` | 模板匹配 | 多尺度匹配、旋转不变匹配、NCC/CCOEFF 方法 |
| `GeometryUtils` | 几何计算 | 点线距离、角度计算、仿射/透视变换、直线/圆拟合 |

#### Python 示例

```python
from industrial_sdk import cv
import cv2
import numpy as np

img = cv2.imread("part.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 边缘检测
edges = cv.EdgeDetector.Canny(gray, 50, 150)

# 轮廓分析
contours = cv.ContourAnalyzer.findContours(edges)
for cnt in contours:
    area = cv.ContourAnalyzer.contourArea(cnt)
    rect = cv.ContourAnalyzer.boundingRect(cnt)
    print(f"轮廓面积: {area}, 外接矩形: {rect}")

# 斑点分析
blobs = cv.BlobAnalyzer.detect(gray, min_area=100, max_area=5000)
for b in blobs:
    print(f"斑点中心: ({b.x}, {b.y}), 半径: {b.radius}")

# 模板匹配
template = cv2.imread("template.jpg", 0)
result = cv.TemplateMatcher.match(gray, template, method="CCOEFF_NORMED")
print(f"匹配得分: {result.score}, 位置: ({result.x}, {result.y})")
```

#### C++ 示例

```cpp
#include <IndustrialVisionSDK/CVToolkit/CVToolkit.h>
#include <opencv2/opencv.hpp>
using namespace IndustrialVisionSDK;

cv::Mat img = cv::imread("part.jpg");
cv::Mat gray;
cv::cvtColor(img, gray, cv::COLOR_BGR2GRAY);

// 边缘检测
cv::Mat edges = EdgeDetector::Canny(gray, 50, 150);

// 轮廓分析
auto contours = ContourAnalyzer::findContours(edges);
for (const auto& cnt : contours) {
    double area = ContourAnalyzer::contourArea(cnt);
    cv::Rect rect = ContourAnalyzer::boundingRect(cnt);
}

// 模板匹配
cv::Mat tpl = cv::imread("template.jpg", 0);
auto result = TemplateMatcher::match(gray, tpl);
```

---

### 4.2 Measurement 工业测量

工厂模式架构，由 `MeasurementManager` 统一管理测量任务。

#### 架构

```
MeasurementManager (单例)
  ├── IMeasurement (纯虚接口)
  │     └── measure(frame) → MeasurementResult
  ├── MeasurementFactory (按类型创建)
  └── 具体测量类
        ├── DistanceMeasurement
        ├── DiameterMeasurement
        ├── RadiusMeasurement
        ├── AngleMeasurement
        ├── AreaMeasurement
        ├── HeightMeasurement
        ├── VolumeMeasurement
        ├── PoseMeasurement
        ├── GDTMeasurement
        └── ProfileMeasurement
```

#### MeasurementResult 结构

```cpp
struct MeasurementResult {
    bool   success;     // 测量是否成功
    string name;        // 测量项名称
    double value;       // 测量值
    string unit;        // 单位 (mm, px, deg, mm², mm³)
    double confidence;  // 置信度 [0.0, 1.0]
};
```

#### 能力概览

| 类 | 测量内容 | 单位 |
|----|---------|------|
| `DistanceMeasurement` | 点到点距离、线到线距离 | mm / px |
| `DiameterMeasurement` | 圆孔/圆柱直径 | mm |
| `RadiusMeasurement` | 圆角/圆弧半径 | mm |
| `AngleMeasurement` | 两线夹角 | 度 (°) |
| `AreaMeasurement` | 轮廓面积 | mm² / px² |
| `HeightMeasurement` | 基于标定的高度差 | mm |
| `VolumeMeasurement` | 基于标定的体积 | mm³ |
| `PoseMeasurement` | 目标 6D 位姿 | mm + 度 |
| `GDTMeasurement` | 平面度、平行度、垂直度、位置度 | mm |
| `ProfileMeasurement` | 轮廓度偏差分析 | mm |

#### Python 示例

```python
from industrial_sdk import MeasurementManager

mgr = MeasurementManager.instance()

# 执行距离测量
result = mgr.measure("distance", frame, {
    "point1": (100, 200),
    "point2": (300, 400),
    "pixel_size": 0.05  # mm/pixel
})

if result.success:
    print(f"距离: {result.value:.3f} {result.unit}")
    print(f"置信度: {result.confidence:.2f}")

# 批量测量
results = mgr.measureAll(frame, ["distance", "diameter", "angle"])
for r in results:
    if r.success:
        print(f"{r.name}: {r.value:.3f} {r.unit}")
```

#### C++ 示例

```cpp
#include <IndustrialVisionSDK/Measurement/MeasurementManager.h>
using namespace IndustrialVisionSDK;

auto& mgr = MeasurementManager::instance();

// 注册测量任务
mgr.registerMeasurement("dist", make_unique<DistanceMeasurement>());

// 执行测量
VisionFrame frame(img);
auto result = mgr.measure("dist", frame);

if (result.success) {
    std::cout << result.name << ": " << result.value
              << " " << result.unit << std::endl;
}
```

---

### 4.3 Calibration 标定

支持单目/双目标定、手眼标定、ICP 点云精配准。`CalibrationToolkit` 为单例入口。

#### 架构

```
CalibrationToolkit (单例)
  ├── IntrinsicCalibrator   — 内参标定（棋盘格/圆格/AprilTag）
  ├── ExtrinsicCalibrator   — 外参标定（PnP 求解）
  ├── StereoCalibrator      — 双目标定（R, T, 基础矩阵）
  ├── HandEyeCalibrator     — 手眼标定（眼在手/眼在外）
  └── ICPRefiner            — ICP 点云精配准 (PCL+OpenCV)
```

#### 标定板类型

| 类型 | 说明 |
|------|------|
| `CHESSBOARD` | 棋盘格（默认） |
| `CIRCLE_GRID` | 圆点网格 |
| `APRILTAG` | AprilTag 标记板 |

#### 手眼标定模式

| 模式 | 说明 |
|------|------|
| `EYE_TO_HAND` | 眼在手外（相机固定，标定板在机器人末端） |
| `EYE_IN_HAND` | 眼在手上（相机在机器人末端，标定板固定） |

#### Python 示例

```python
from industrial_sdk import CalibrationToolkit
import cv2

calib = CalibrationToolkit.instance()

# ── 内参标定 ──
images = [cv2.imread(f"chess_{i:02d}.jpg") for i in range(20)]
result = calib.calibrateIntrinsic(images, board_type="CHESSBOARD",
                                   board_size=(9, 6), square_size=25.0)
print(f"内参矩阵:\n{result.camera_matrix}")
print(f"畸变系数: {result.dist_coeffs}")
print(f"重投影误差: {result.reprojection_error:.4f} px")

# ── 手眼标定 ──
# 机器人位姿列表 (4x4 变换矩阵)
robot_poses = [...]  # 每次拍照时机器人的末端位姿
hand_eye_result = calib.calibrateHandEye(
    images, robot_poses,
    mode="EYE_TO_HAND",
    board_type="CHESSBOARD",
    board_size=(9, 6),
    square_size=25.0
)
print(f"相机到基座变换:\n{hand_eye_result.transform}")
```

#### C++ 示例

```cpp
#include <IndustrialVisionSDK/Calibration/CalibrationToolkit.h>
using namespace IndustrialVisionSDK;

auto& calib = CalibrationToolkit::instance();

// 内参标定
CalibrationResult result = calib.calibrateIntrinsic(
    images, BoardType::CHESSBOARD, cv::Size(9, 6), 25.0f
);
std::cout << "RMSE: " << result.reprojection_error << std::endl;

// 手眼标定
auto he_result = calib.calibrateHandEye(
    images, robot_poses, HandEyeMode::EYE_TO_HAND
);
```

---

### 4.4 3DToolkit 3D视觉

处理点云、深度图、结构光和 ICP 配准。

#### 能力概览

| 类 | 功能 | 核心方法 |
|----|------|---------|
| `PointCloud` | 点云处理 | 生成、滤波（体素/统计/半径）、下采样、法线估计、可视化 |
| `DepthMap` | 深度图 | 深度图转点云、深度值滤波、孔洞填充 |
| `StructLightProcessor` | 结构光 | Gray Code 编解码、相位展开、重建 |
| `ICPRegistration` | ICP 配准 | 点对点/点对面 ICP（OpenCV 实现 + PCL 加速路径） |

#### Python 示例

```python
from industrial_sdk import Toolkit3D
import cv2

toolkit3d = Toolkit3D()

# 深度图转点云
depth = cv2.imread("depth.png", cv2.IMREAD_UNCHANGED)
rgb = cv2.imread("rgb.jpg")
K = [[fx, 0, cx], [0, fy, cy], [0, 0, 1]]  # 相机内参

cloud = toolkit3d.depthToPointCloud(depth, rgb, K)
print(f"点云点数: {cloud.size()}")

# 点云滤波
filtered = toolkit3d.filterPointCloud(cloud,
    voxel_size=0.01,
    statistical_k=20,
    statistical_stddev=2.0
)

# ICP 配准
transform = toolkit3d.icpRegister(source_cloud, target_cloud,
    max_iterations=50, tolerance=1e-6)
print(f"ICP 变换矩阵:\n{transform}")
```

#### C++ 示例

```cpp
#include <IndustrialVisionSDK/3DToolkit.h>
using namespace IndustrialVisionSDK;

Toolkit3D toolkit;

// 深度图转点云
auto cloud = toolkit.depthToPointCloud(depth, rgb, K);

// 点云滤波
auto filtered = toolkit.filterPointCloud(cloud,
    VoxelSize{0.01f},
    StatisticalOutlier{20, 2.0f}
);

// ICP 配准
auto T = toolkit.icpRegister(source, target,
    ICPParams{50, 1e-6f}
);
```

---

### 4.5 AIToolkit AI推理

SDK 的 AI 推理核心模块，基于插件架构，支持 YOLO 检测/分割/跟踪。

#### 架构

```
AIToolkit (单例入口)
  ├── InferenceManager
  │     └── map<string, IInferenceEngine>  // 按名称管理多个引擎
  ├── EngineFactory
  │     └── create(backend, task) → IInferenceEngine
  ├── IInferenceEngine (接口)
  │     ├── ONNXAdapter     (ONNX Runtime 后端)
  │     └── TensorRTAdapter (TensorRT 后端, 可选)
  └── BYTETracker (多目标跟踪, GMC)
```

#### 推理流程 (ONNXAdapter)

```
输入 cv::Mat BGR
  → letterbox (等比缩放+填充至640×640)
  → blobFromImage (BGR→RGB, HWC→CHW, ÷255)
  → ONNX Runtime 推理
  → 后处理 (NMS + 逆letterbox + clamp)
  → 结果 (BBox/SegmentBox 列表)
```

**检测输出**: `[1, 300, 6]` — x1, y1, x2, y2, confidence, class_id
**分割输出**: `[1, 300, 38]` (6基础 + 32个mask系数) + `[1, 32, 160, 160]` (原型掩码)

#### 任务类型 (TaskType)

| 枚举值 | 说明 | 状态 |
|--------|------|------|
| `DETECT` | 目标检测 | ✅ 完整支持 |
| `SEGMENT` | 实例分割（含掩码） | ✅ 完整支持 |
| `CLASSIFY` | 图像分类 | ⚠️ 适配器待实现 |
| `POSE` | 姿态估计 | ⚠️ 适配器待实现 |
| `OBB` | 旋转框检测 | ⚠️ 适配器待实现 |

#### 推理常量

| 常量 | 值 | 含义 |
|------|-----|------|
| `kInputW/kInputH` | 640 | 模型输入尺寸 |
| `kMaxDet` | 300 | 最大检测数 |
| `kOutputDim` | 6 | 检测输出维度 |
| `kOutputDimSeg` | 38 | 分割输出维度 (6 + 32个mask系数) |
| `kMaskProtoC` | 32 | 掩码原型通道数 |
| `kMaskProtoH/W` | 160 | 掩码原型空间尺寸 |
| `kMaskThreshold` | 0.5 | 掩码二值化阈值 |

#### 配置文件 (config/models.yaml)

```yaml
inference:
  backend: onnx           # onnx | tensorrt
  conf: 0.5               # 置信度阈值
  iou: 0.45               # NMS IoU 阈值
  imgsz: 640              # 推理尺寸
  device: "cpu"           # cpu | cuda:0

models:
  detect:
    onnx: "models/yolo26n.onnx"
  segment:
    onnx: "models/yolo26n-seg.onnx"
  classify:
    onnx: "models/yolo26n-cls.onnx"
  pose:
    onnx: "models/yolo26n-pose.onnx"
  obb:
    onnx: "models/yolo26n-obb.onnx"
```

#### YOLOE (开放词汇检测/分割)

YOLOE 在 YOLO 基础上增加了开放词汇能力，通过文本/图像提示进行检测和分割。C++ 核心已实现 `YOLOE_Detect` 和 `YOLOE_Segment` 任务装饰器，支持通过提示词（Prompt）进行开放词汇检测和分割。Python 绑定层待后续版本暴露。

#### Python 示例

```python
from industrial_sdk import AIToolkit

ai = AIToolkit.instance()

# ── 加载模型 ──
ai.loadModel("assets/yolo26n.onnx", "detect", "onnx")
ai.setConfidenceThreshold(0.5)
ai.setIouThreshold(0.45)

# ── 单图检测 ──
import cv2
img = cv2.imread("test.jpg")
result = ai.detectEx(img)

for box in result.boxes:
    print(f"{box.class_name}: {box.confidence:.2f} "
          f"@ ({box.x1},{box.y1})-({box.x2},{box.y2})")

# ── 实例分割 ──
ai.loadModel("assets/yolo26n-seg.onnx", "segment", "onnx")
seg_result = ai.segmentEx(img)

for box in seg_result.boxes:
    # box.mask 是 numpy array (CV_8UC1, 二值掩码)
    print(f"{box.class_name}, 掩码尺寸: {box.mask.shape}")
    cv2.imwrite(f"mask_{box.class_name}.png", box.mask * 255)

# ── 批量推理 ──
results = ai.detectBatch([img1, img2, img3])

# ── 性能测试 ──
import time
t0 = time.time()
for _ in range(100):
    ai.detectEx(img)
print(f"平均推理时间: {(time.time()-t0)/100*1000:.1f}ms")
```

#### 命令行使用

```bash
# 检测
python detect_yolo.py test.jpg
python detect_yolo.py --conf 0.3   # 调整置信度

# 分割
python segment_yolo.py test.jpg
python segment_yolo.py --conf 0.3

# 性能基准
python detect_yolo.py --bench 100  # 100次取平均
```

#### C++ 示例

```cpp
#include <IndustrialVisionSDK/AIToolkit/AIToolkit.h>
using namespace IndustrialVisionSDK;

auto& ai = AIToolkit::instance();
ai.loadModel("assets/yolo26n.onnx", "detect", "onnx");
ai.setConfidenceThreshold(0.5f);

cv::Mat img = cv::imread("test.jpg");
auto result = ai.detectEx(img);  // 自动释放 GIL

for (const auto& box : result.boxes) {
    std::cout << box.className << ": "
              << box.confidence << std::endl;
}
```

#### ByteTrack 跟踪

ByteTrack 跟踪功能集成在 AIToolkit 中，通过 `enableTracking` 启用：

```python
# 启用跟踪
ai.enableTracking(frame_rate=30, track_buffer=30)

# 逐帧跟踪
for frame_img in video_frames:
    detections = ai.detectEx(frame_img)
    # 对检测结果应用跟踪，返回 track_ids
    track_ids = ai.applyTracking(detections.boxes, frame_img)
    for i, box in enumerate(detections.boxes):
        if i < len(track_ids):
            print(f"Track ID: {track_ids[i]}, {box.class_name}")

# 关闭跟踪
ai.disableTracking()
```

---

### 4.6 VLMToolkit

| 状态 | 🔲 接口预留 |
|------|------------|

`IVLMEngine` 纯虚接口已定义，支持视觉语言模型推理的场景预留。接口定义了模型加载和文本生成的基本契约，具体实现待后续版本。

```cpp
// 接口定义（已存在）
class IVLMEngine {
public:
    virtual ~IVLMEngine() = default;
    virtual bool loadModel(const std::string& path) = 0;
    virtual std::string generate(const cv::Mat& image,
                                  const std::string& prompt) = 0;
};
```

---

## 5. 部署指南

### 5.1 依赖清单

| 依赖 | 版本要求 | 安装路径 | 必需 | 说明 |
|------|---------|---------|------|------|
| OpenCV | 4.x | `D:/opencv` | ✅ | 计算机视觉核心 |
| pybind11 | 2.11+ | 系统安装 | ✅ | Python 绑定 |
| ONNX Runtime | 1.26.0 | `D:/onnxruntime` | AI必需 | ONNX 模型推理 |
| Eigen3 | 3.4+ | `third_party/eigen/` | 标定必需 | 线性代数（bundled） |
| spdlog | 1.x | `third_party/spdlog/` | ✅ | 日志库（bundled） |
| yaml-cpp | 0.8+ | `third_party/yaml-cpp/` | ✅ | YAML 解析（bundled） |
| PCL | 1.12+ | 系统安装 | 可选 | ICP 加速、点云高级处理 |
| MPI | — | 系统安装 | 可选 | 并行计算加速 |
| CUDA Toolkit | 12.x | 系统安装 | TensorRT必需 | GPU 推理 |

### 5.2 编译构建

#### 基础构建

```bash
mkdir build && cd build
cmake .. -G "Visual Studio 18 2026" \
  -DOpenCV_DIR=D:/opencv/build \
  -Dpybind11_DIR=D:/pybind11/share/cmake/pybind11
cmake --build . --config Release -j4
```

#### CMake 选项

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `BUILD_EXAMPLES` | ON | 编译 C++ demo 可执行文件 |
| `BUILD_CALIBRATION` | ON | 编译标定模块 |
| `BUILD_PYTHON` | ON | 生成 pybind11 Python 扩展 |
| `ENABLE_ONNX` | ON | ONNX Runtime 推理后端 |
| `ENABLE_TENSORRT` | OFF | TensorRT 推理后端（需 CUDA） |
| `BUILD_TESTS` | OFF | C++ 单元测试 |

#### 产物位置

| 产物 | 路径 |
|------|------|
| C++ DLL | `build/Release/*.dll` |
| C++ Demo | `build/Release/*.exe` |
| Python .pyd | `build/Release/industrial_sdk_core.*.pyd` |
| Python 包 | `python/industrial_sdk/` (自动拷贝) |

### 5.3 Python 包安装

```bash
cd python
pip install -e .
```

此命令自动执行 CMake 编译，并将所有 DLL 和 `.pyd` 拷贝到 `python/industrial_sdk/`。

安装后：

```python
from industrial_sdk import (
    AIToolkit,          # AI 推理
    CalibrationToolkit, # 标定
    MeasurementManager, # 测量
    Toolkit3D,          # 3D 视觉
    VisionFrame,        # 数据载体
    BYTETracker,        # 目标跟踪
    cv,                 # OpenCV 引用
)
```

### 5.4 部署文件

运行时需确保以下文件在可搜索路径中（`PATH` 或程序同级目录）：

```
algorithm_vision.dll             # 全量库 (或按需选择的子库)
algorithm_vision_aitoolkit.dll
algorithm_vision_cvtoolkit.dll
algorithm_vision_measurement.dll
algorithm_vision_calibration.dll
algorithm_vision_3dtoolkit.dll
onnxruntime.dll                  # ONNX Runtime (AI 推理必需)
opencv_world4xxx.dll             # OpenCV 运行时
industrial_sdk_core.cp314-win_amd64.pyd  # Python 绑定
```

模型文件需拷贝到可访问路径（推荐 `assets/` 目录）：

```
assets/yolo26n.onnx       # 检测模型
assets/yolo26n-seg.onnx   # 分割模型
```

### 5.5 常见问题

**Q: ImportError: DLL load failed while importing industrial_sdk_core**

确保所有依赖 DLL（`onnxruntime.dll`, `opencv_world*.dll`, 各 `algorithm_vision_*.dll`）与 `.pyd` 文件在同一目录，或已添加到系统 `PATH`。

```bash
# 检查缺失的 DLL 依赖
dumpbin /dependents industrial_sdk_core.cp314-win_amd64.pyd
```

**Q: ONNX Runtime 初始化失败**

确认 `D:/onnxruntime/lib/onnxruntime.dll` 存在且版本为 1.26.0。可通过 `where onnxruntime.dll` 检查路径。

**Q: 模型加载失败 "Cannot open model file"**

确保模型文件路径正确。推荐使用相对于项目根目录的路径（如 `assets/yolo26n.onnx`），或提供绝对路径。

**Q: Python 版本不匹配**

当前 SDK 基于 Python 3.14 编译。`.pyd` 文件名中的 `cp314` 表示 CPython 3.14 ABI。若使用其他 Python 版本，需重新编译。

---

## 6. 附录

### A.1 配置文件参考

#### config/models.yaml

```yaml
inference:
  backend: onnx           # 推理后端: onnx | tensorrt | pytorch | openvino
  conf: 0.5               # 默认置信度阈值 [0.0, 1.0]
  iou: 0.45               # NMS IoU 阈值 [0.0, 1.0]
  imgsz: 640              # 模型输入图像尺寸
  device: "cpu"           # 推理设备: cpu | cuda:0 | auto

models:
  detect:                 # 目标检测
    onnx: "models/yolo26n.onnx"
    tensorrt: "models/yolo26n.engine"
    pytorch: "models/yolo26n.pt"

  segment:                # 实例分割
    onnx: "models/yolo26n-seg.onnx"

  classify:               # 图像分类
    onnx: "models/yolo26n-cls.onnx"

  pose:                   # 姿态估计
    onnx: "models/yolo26n-pose.onnx"

  obb:                    # 旋转框检测
    onnx: "models/yolo26n-obb.onnx"
```

### A.2 模型训练与导出

自定义模型完整流程：

**Step 1: 训练** (在 Ultralytics 环境中)

```bash
# 目标检测
yolo train model=yolo26n.pt data=my_task.yaml epochs=100 imgsz=640 name=my_detect

# 实例分割
yolo train model=yolo26n-seg.pt data=my_task.yaml epochs=100 imgsz=640 name=my_segment
```

**Step 2: 导出 ONNX**

```bash
yolo export model=runs/detect/my_detect/weights/best.pt format=onnx imgsz=640 opset=12
```

**Step 3: 部署到 SDK**

```bash
cp best.onnx D:/nnd/AlgorithmSDK/assets/my_model.onnx
```

**Step 4: 推理**

```python
ai = AIToolkit.instance()
ai.loadModel("assets/my_model.onnx", "detect", "onnx")
result = ai.detectEx(img)
```

> **注意**: 当前类名硬编码在 `ONNXAdapter.cpp:21` 的 `kClassNames` 中。若自定义模型使用不同类名，需修改后重新编译。类名从 YAML 动态读取的功能在规划中。

更详细说明参见 [docs/YOLO_Inference_Guide.md](docs/YOLO_Inference_Guide.md)。

### A.3 坐标与单位约定

| 约定 | 说明 |
|------|------|
| 图像坐标系 | 原点在**左上角**，X 轴向右，Y 轴向下，单位：像素 (px) |
| 世界坐标系 | 右手系，由标定板定义原点 |
| 像素尺寸 | `pixel_size` (mm/px) 用于 px ↔ mm 转换 |
| 角度 | 度 (°)，逆时针为正 |
| 相机内参格式 | `[fx, 0, cx; 0, fy, cy; 0, 0, 1]` |
| 变换矩阵 | 4×4 齐次矩阵 `[R t; 0 1]` |

### A.4 术语表

| 术语 | 全称 | 说明 |
|------|------|------|
| SDK | Software Development Kit | 软件开发工具包 |
| CV | Computer Vision | 计算机视觉 |
| VLM | Vision Language Model | 视觉语言模型 |
| ONNX | Open Neural Network Exchange | 开放神经网络交换格式 |
| NMS | Non-Maximum Suppression | 非极大值抑制 |
| IoU | Intersection over Union | 交并比 |
| GMC | Global Motion Compensation | 全局运动补偿 |
| GD&T | Geometric Dimensioning and Tolerancing | 几何尺寸与公差 |
| PnP | Perspective-n-Point | 透视 N 点（外参估计算法） |
| ICP | Iterative Closest Point | 迭代最近点（点云配准） |
| OBB | Oriented Bounding Box | 有向包围盒（旋转框） |
| GIL | Global Interpreter Lock | Python 全局解释器锁 |

### A.5 已知限制与路线图

#### 当前限制

| 限制 | 说明 |
|------|------|
| 类名硬编码 | 自定义模型类名需修改 `ONNXAdapter.cpp` 并重编译 |
| 仅 Windows 验证 | macOS/Linux 未充分测试 |
| 单 GPU | TensorRT 后端仅支持单 GPU |
| CLASSIFY/POSE/OBB | 枚举已定义，ONNX 适配器尚未实现 |
| VLM | 仅为接口预留，无可运行实现 |

#### 路线图

| 优先级 | 计划 |
|--------|------|
| P0 | 类名从 YAML 动态读取，无需重编译 |
| P1 | ONNX 适配器支持 CLASSIFY/POSE/OBB 任务 |
| P1 | macOS/Linux 编译和测试 |
| P2 | VLM 引擎实现（计划集成 LLaVA 或 Qwen-VL） |
| P2 | TensorRT 后端完善和性能基准 |
| P3 | C++ 单元测试框架集成到 CMake |

---

> **文档版本**: 1.0 | **生成日期**: 2026-06-23 | **适用范围**: AlgorithmSDK v1.0.0 (commit 7bde9b2)
