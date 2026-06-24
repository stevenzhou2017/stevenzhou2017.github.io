# AlgorithmSDK 交付文档

> **版本**: 1.0.0 (commit e1629f5)
> **交付日期**: 2026-06-23
> **交付形式**: C++ 动态库 (.dll / .so) + Python 绑定模块 (.pyd / .so) + 头文件 + 模型文件
> **适用范围**: Windows 10+, Linux (Ubuntu 24.04), Python 3.12~3.14

---

## 目录

1. [概述](#1-概述)
2. [快速入门](#2-快速入门)
3. [架构总览](#3-架构总览)
4. [功能模块详解](#4-功能模块详解)
5. [部署指南](#5-部署指南)
6. [附录](#6-附录)

---

## 1. 概述

### 1.1 项目简介

AlgorithmSDK 是一套**工业视觉算法软件开发工具包**，覆盖传统计算机视觉、AI 深度学习推理和 3D 视觉三大领域。SDK 以 C++ 为核心，通过 pybind11 提供 Python 接口，面向工业检测、测量、标定、机器人视觉等场景。

**核心能力：**

- **传统 CV**：图像增强、边缘检测、轮廓/斑点分析、模板匹配、几何计算
- **工业测量**：距离、直径、角度、面积、高度、体积、位姿、GD&T 公差、轮廓度
- **标定**：单目/双目标定、手眼标定（Tsai/Daniilidis/LM）、外参估计、ICP 点云精配准
- **3D 视觉**：点云生成、深度图处理、结构光、ICP 配准
- **AI 推理**：YOLO 检测/分割（ONNX Runtime）、ByteTrack 多目标跟踪、YOLOE 开放词汇
- **VLM**：视觉语言模型接口预留

### 1.2 交付版本

| 项目 | 值 |
|------|-----|
| 版本号 | 1.0.0 |
| Git Commit | `e1629f5` |
| 分支 | master |
| 交付日期 | 2026-06-23 |
| 支持平台 | Windows 10/11, Linux (Ubuntu 24.04 验证通过) |
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
| `algorithm_sdk_core.*.pyd` | pybind11 绑定模块 |
| `python/industrial_sdk/` | Python 包（`from industrial_sdk import ...`） |

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

| 文件 | 大小 | 说明 |
|------|------|------|
| `assets/yolo26n.onnx` | ~10 MB | 检测模型 |
| `assets/yolo26n-seg.onnx` | ~11 MB | 分割模型 |
| `assets/yolo26s.onnx` | ~38 MB | 检测模型 (small) |
| `assets/yolo26s-seg.onnx` | ~42 MB | 分割模型 (small) |
| `assets/yolo26n.engine` | ~9 MB | TensorRT 引擎 |

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
| 手眼标定 | ✅ | `HandEyeCalibrator`（Tsai/Daniilidis/LM） |
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

| 功能 | 状态 | 说明 |
|------|------|------|
| YOLO 目标检测 | ✅ | ONNX 后端完整支持 |
| YOLO 实例分割 | ✅ | 含掩码重建，ONNX 后端 |
| YOLO 分类 | ⚠️ | 枚举已定义，适配器未实现 |
| YOLO 姿态估计 | ⚠️ | 枚举已定义，适配器未实现 |
| YOLO 旋转框(OBB) | ⚠️ | 枚举已定义，适配器未实现 |
| YOLOE 开放词汇 | ✅ | C++ 核心已实现，Python 绑定待暴露 |
| ByteTrack 跟踪 | ✅ | 集成于 AIToolkit，GMC 全局运动补偿 |
| 模型配置化 | ✅ | YAML 配置文件 |

#### VLMToolkit

| 功能 | 状态 | 说明 |
|------|------|-----|
| VLM 推理接口 | 🔲 | `IVLMEngine` 纯虚接口已定义，预留 |

---

## 2. 快速入门

### 2.1 环境要求

| 项目 | Windows | Linux |
|------|---------|-------|
| 操作系统 | Windows 10/11 (64-bit) | Ubuntu 24.04 LTS 或兼容发行版 |
| 编译器 | Visual Studio 2026 (v143) | GCC 13+ / Clang 18+ |
| CMake | 3.22+ | 3.22+ |
| Python | 3.14 | 3.12+ |
| OpenCV | `D:/opencv` | `apt install libopencv-dev` (4.6+) |
| pybind11 | pip 安装 | `apt install pybind11-dev` (2.11+) |
| Eigen3 | `third_party/eigen/` (bundled) | `apt install libeigen3-dev` 或 bundled |
| ONNX Runtime | `D:/onnxruntime` (AI 推理时) | 系统安装，通过 `-DONNXRUNTIME_ROOT` 指定 |

### 2.2 安装（使用交付产物）

交付包中已包含预编译的库文件和 Python 绑定模块，无需编译即可使用。

SDK 支持两种导入方式：
- **包方式（推荐）**：`from industrial_sdk import AIToolkit`，需保留 `industrial_sdk/` 目录结构
- **直调方式**：`import algorithm_sdk_core`，直接 import 编译产物，适合需要自行管理 DLL 路径的场景

#### Windows

交付包目录结构：

```
<交付包>/
├── industrial_sdk/                            # Python 包目录
│   ├── __init__.py                            # 包入口（from .algorithm_sdk_core import *）
│   ├── api.py                                 # 高层 API 封装
│   └── algorithm_sdk_core.cp314-win_amd64.pyd # C++ 编译产物
├── algorithm_vision.dll                       # 全量 SDK（含 C++ 运行时依赖）
├── algorithm_vision_aitoolkit.dll
├── algorithm_vision_cvtoolkit.dll
├── algorithm_vision_measurement.dll
├── algorithm_vision_calibration.dll
├── algorithm_vision_3dtoolkit.dll
├── onnxruntime.dll                            # ONNX Runtime
├── opencv_world4130.dll                       # OpenCV 运行时
└── assets/                                    # 模型文件
```

包方式使用：

```python
import sys; sys.path.insert(0, "<交付包>")
from industrial_sdk import AIToolkit, CalibrationToolkit, MeasurementManager
```

直调方式使用（CameraWeb 项目采用此方式）：

```python
import sys; sys.path.insert(0, "<交付包>/industrial_sdk")
import algorithm_sdk_core as algosdk
ai = algosdk.AIToolkit.instance()
```

#### Linux

```bash
export LD_LIBRARY_PATH=<交付包>/industrial_sdk:$LD_LIBRARY_PATH
export PYTHONPATH=<交付包>:$PYTHONPATH

python3 -c "from industrial_sdk import AIToolkit; print('OK')"
```

> 如需从源码编译，参见 [5.2 源码编译（可选）](#52-源码编译可选)。

验证安装：

```python
from industrial_sdk import AIToolkit, CalibrationToolkit, MeasurementManager
print("AlgorithmSDK 安装成功")
```

### 2.3 5分钟体验

```python
import cv2
from industrial_sdk import AIToolkit

# 加载模型
ai = AIToolkit.instance()
ai.loadModel("assets/yolo26n.onnx", "detect", "onnx")
ai.setConfidenceThreshold(0.5)

# 检测
img = cv2.imread("assets/bus.jpg")
result = ai.detectEx(img)

for box in result.boxes:
    print(f"{box.class_name}: {box.confidence:.2f} "
          f"@ ({box.x1},{box.y1})-({box.x2},{box.y2})")

# 分割（阈值通常需设得更低）
ai.loadModel("assets/yolo26n-seg.onnx", "segment", "onnx")
ai.setConfidenceThreshold(0.15)
seg_result = ai.segmentEx(img)
for box in seg_result.boxes:
    cv2.imwrite(f"mask_{box.class_name}.png", box.mask)
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
│    algorithm_sdk_core.*.pyd                  │
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

- **全量库 `algorithm_vision.dll`** — 包含全部 6 个模块，供 Python 绑定使用。
- **独立子库** — 每个模块可单独编译链接，减少体积：

| 子库 | CMake Target |
|------|-------------|
| `algorithm_vision_cvtoolkit.dll` | `algorithm_vision_cvtoolkit` |
| `algorithm_vision_measurement.dll` | `algorithm_vision_measurement` |
| `algorithm_vision_calibration.dll` | `algorithm_vision_calibration` |
| `algorithm_vision_3dtoolkit.dll` | `algorithm_vision_3dtoolkit` |
| `algorithm_vision_aitoolkit.dll` | `algorithm_vision_aitoolkit` |

各 C++ demo 链接各自的独立子库。

### 3.3 VisionFrame 数据流

`VisionFrame` 是 SDK 的核心数据载体，封装图像及其元数据，贯穿整个流水线：

| 字段 | 类型 | 说明 |
|------|------|------|
| `image` | `cv::Mat` | 图像数据 |
| `camera_id` | `int` | 相机 ID |
| `timestamp` | `uint64_t` | 时间戳 |
| `detections` | `vector<DetectionBox>` | 检测结果 |
| `segments` | `vector<SegmentationBox>` | 分割结果 |
| `depth_map` | `cv::Mat` | 深度图 |
| `point_cloud` | `cv::Mat` | 点云 |

```
CVToolkit → VisionFrame → Measurement (含测量结果)
                         → AIToolkit   (含检测/分割)
                         → 3DToolkit   (含点云)
```

### 3.4 单例模式

| 单例类 | Python 访问 |
|--------|-------------|
| `AIToolkit` | `AIToolkit.instance()` |
| `CalibrationToolkit` | `CalibrationToolkit.instance()` |
| `MeasurementManager` | `MeasurementManager.instance()` |

---

## 4. 功能模块详解

### 4.1 CVToolkit 传统视觉

基于 OpenCV 封装的图像处理工具集，全部为静态方法类。

| 类 | 功能 | 核心方法 |
|----|------|---------|
| `ImageEnhance` | 图像增强 | 直方图均衡化、伽马校正、锐化、亮度/对比度调整 |
| `EdgeDetector` | 边缘检测 | Canny、Sobel、Laplacian，自适应阈值 |
| `ContourAnalyzer` | 轮廓分析 | 查找轮廓、面积/周长/矩、多边形逼近、凸包、最小外接矩形 |
| `BlobAnalyzer` | 斑点检测 | 基于面积/圆度/惯性比/凸度的多条件过滤 |
| `TemplateMatcher` | 模板匹配 | 多尺度匹配、旋转不变匹配、NCC/CCOEFF |
| `GeometryUtils` | 几何计算 | 点线距离、角度计算、仿射/透视变换、直线/圆拟合 |

#### Python 示例

```python
from industrial_sdk import cv
import cv2, numpy as np

img = cv2.imread("part.jpg")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 边缘检测
edges = cv.EdgeDetector.canny(gray, 50, 150)

# 轮廓分析
contours = cv.ContourAnalyzer.find_contours(edges)
print(f"找到 {len(contours)} 个轮廓")

# 几何工具
d = cv.GeometryUtils.distance(0.0, 0.0, 100.0, 0.0)  # → 100.0

# 图像增强
enhanced = cv.ImageEnhance.hist_equalize(gray)
```

### 4.2 Measurement 工业测量

工厂模式架构，`MeasurementManager` 统一管理。

| 类 | 测量内容 | 单位 |
|----|---------|------|
| `DistanceMeasurement` | 点到点/线到线距离 | mm / px |
| `DiameterMeasurement` | 圆孔/圆柱直径 | mm |
| `RadiusMeasurement` | 圆角/圆弧半径 | mm |
| `AngleMeasurement` | 两线夹角 | 度 (°) |
| `AreaMeasurement` | 轮廓面积 | mm² / px² |
| `HeightMeasurement` | 基于标定的高度差 | mm |
| `VolumeMeasurement` | 基于标定的体积 | mm³ |
| `PoseMeasurement` | 目标 6D 位姿 | mm + 度 |
| `GDTMeasurement` | 平面度、平行度、垂直度、位置度 | mm |
| `ProfileMeasurement` | 轮廓度偏差分析 | mm |

`MeasurementResult` 结构：`{success, name, value, unit, confidence}`

#### Python 示例

```python
from industrial_sdk import MeasurementManager, DistanceMeasurement

mgr = MeasurementManager()
dist = DistanceMeasurement((100, 200), (300, 400), 0.05)
mgr.add(dist)
results = mgr.run(gray_image)  # gray_image 为 numpy uint8 数组
for r in results:
    print(f"{r.name}: {r.value:.3f} {r.unit}, 置信度: {r.confidence:.2f}")
```

### 4.3 Calibration 标定

| 类 | 功能 |
|----|------|
| `IntrinsicCalibrator` | 内参标定（棋盘格/圆格/AprilTag） |
| `ExtrinsicCalibrator` | 外参标定（PnP 求解） |
| `StereoCalibrator` | 双目标定（R, T, 基础矩阵） |
| `HandEyeCalibrator` | 手眼标定（Tsai-Lenz / Daniilidis / LM） |
| `ICPRefiner` | ICP 点云精配准 (PCL + OpenCV) |
| `CalibrationToolkit` | 单例入口，统一调度 |

#### 标定板类型

| 类型 | 说明 |
|------|------|
| `Chessboard` | 棋盘格（默认） |
| `CircleGrid` | 圆点网格 |
| `AprilTag` | AprilTag 标记板 |

#### 手眼标定模式

| 模式 | 说明 |
|------|------|
| `EYE_TO_HAND` | 眼在手外 |
| `EYE_IN_HAND` | 眼在手上 |

#### Python 示例

```python
from industrial_sdk import (CalibrationToolkit, HandEyeCalibrator,
                             IntrinsicCalibrator, BoardConfig, BoardType)

# 内参标定
calib = IntrinsicCalibrator()
board = BoardConfig()
board.type = BoardType.Chessboard
board.rows = 9
board.cols = 6
board.gridSize = 25.0
result = calib.calibrate(image_points, image_size, board)
print(f"重投影误差: {result['reprojectionError']:.4f} px")

# 手眼标定
he = HandEyeCalibrator()
he.addRobotPose(R_mat, t_vec)   # R_mat: 3x3, t_vec: 3x1 numpy array
he.addCameraPose(R_mat, t_vec)
T = he.calibrate()              # 返回 4x4 numpy array
```

### 4.4 3DToolkit 3D视觉

| 类 | 功能 | 核心方法 |
|----|------|---------|
| `PointCloud` | 点云处理 | 生成、滤波（体素/统计/半径）、下采样、法线估计 |
| `DepthMap` | 深度图 | 深度图转点云、深度值滤波、孔洞填充 |
| `StructLightProcessor` | 结构光 | Gray Code 编解码、相位展开、重建 |
| `ICPRegistration` | ICP 配准 | 点对点/点对面 ICP（OpenCV + PCL 双路径） |

#### Python 示例

```python
from industrial_sdk import Toolkit3D

toolkit3d = Toolkit3D()

# 点云配准
aligned = toolkit3d.alignPointClouds(source_cloud, target_cloud)
```

### 4.5 AIToolkit AI推理

插件架构，支持 ONNX Runtime / TensorRT 后端，YOLO 检测/分割/跟踪。

#### 推理流程

```
输入 cv::Mat BGR
  → letterbox（等比缩放+填充至 640×640）
  → blobFromImage（BGR→RGB, HWC→CHW, ÷255）
  → ONNX Runtime 推理
  → 后处理（NMS + 逆letterbox + clamp）
  → DetectionResult / SegmentationResult
```

#### 任务类型

| 枚举 | 说明 | 状态 |
|------|------|------|
| `DETECT` | 目标检测 | ✅ |
| `SEGMENT` | 实例分割（含掩码） | ✅ |
| `CLASSIFY` | 图像分类 | ⚠️ 适配器待实现 |
| `POSE` | 姿态估计 | ⚠️ 适配器待实现 |
| `OBB` | 旋转框检测 | ⚠️ 适配器待实现 |

#### 配置文件 (config/models.yaml)

```yaml
inference:
  backend: onnx           # onnx | tensorrt
  conf: 0.5               # 置信度阈值
  iou: 0.45               # NMS IoU 阈值
  imgsz: 640              # 推理尺寸
  device: "cpu"           # cpu | cuda:0 | auto
```

#### Python 示例

```python
from industrial_sdk import AIToolkit

ai = AIToolkit.instance()

# 检测
ai.loadModel("assets/yolo26n.onnx", "detect", "onnx")
ai.setConfidenceThreshold(0.5)
result = ai.detectEx(img)
for box in result.boxes:
    print(f"{box.class_name}: {box.confidence:.2f}")

# 分割
ai.loadModel("assets/yolo26n-seg.onnx", "segment", "onnx")
seg_result = ai.segmentEx(img)

# ByteTrack 跟踪
ai.enableTracking(frame_rate=30, track_buffer=30)
detections = ai.detectEx(frame)
track_ids = ai.applyTracking(detections.boxes, frame)
ai.disableTracking()
```

#### 命令行使用

```bash
python detect_yolo.py test.jpg
python detect_yolo.py --conf 0.3 --bench 100
python segment_yolo.py test.jpg
```

### 4.6 VLMToolkit

| 状态 | 🔲 接口预留 |
|------|------------|

`IVLMEngine` 纯虚接口已定义，定义了 `loadModel` 和 `generate(image, prompt)` 基本契约，具体实现待后续版本。

---

## 5. 部署指南

### 5.1 依赖清单

> **使用交付产物无需安装以下依赖**（运行时依赖的 .dll/.so 已在交付包中）。以下仅面向源码编译场景。

| 依赖 | Windows 路径 | Linux 安装 | 用途 |
|------|-------------|-----------|------|
| OpenCV | `D:/opencv` | `apt install libopencv-dev` | 计算机视觉核心 |
| pybind11 | pip 安装 | `apt install pybind11-dev` | Python 绑定 |
| ONNX Runtime | `D:/onnxruntime` (v1.26) | `-DONNXRUNTIME_ROOT=<path>` | AI 推理（可选） |
| Eigen3 | `third_party/eigen/` (bundled) | bundled | 线性代数 |
| spdlog | `third_party/spdlog/` (bundled) | bundled | 日志 |
| yaml-cpp | `third_party/yaml-cpp/` (bundled) | bundled | YAML 解析 |
| PCL | 系统安装 | 系统安装 | ICP 加速（可选） |
| MPI | 系统安装 | 系统安装 | 并行加速（可选） |

> Eigen3、spdlog、yaml-cpp 已 bund 在 `third_party/` 中，源码编译时自动使用。

### 5.2 源码编译（可选）

> 交付包已包含预编译产物。以下仅面向需要从源码重新编译的开发者。完整构建说明见 [CLAUDE.md](CLAUDE.md)。

#### Windows

```bash
mkdir build && cd build
cmake .. -G "Visual Studio 18 2026" \
  -DOpenCV_DIR=D:/opencv/build \
  -Dpybind11_DIR=<pybind11_cmake_dir>
cmake --build . --config Release -j4
```

#### Linux

```bash
# 安装系统依赖
sudo apt install libopencv-dev pybind11-dev libeigen3-dev

mkdir build && cd build
cmake .. -DCMAKE_BUILD_TYPE=Release -DENABLE_ONNX=OFF
cmake --build . -j$(nproc)
```

> 若需要 ONNX Runtime AI 推理：`-DENABLE_ONNX=ON -DONNXRUNTIME_ROOT=<path>`

#### CMake 选项

| 选项 | 默认 | 说明 |
|------|------|------|
| `BUILD_CALIBRATION` | ON | 编译标定模块（需 Eigen3） |
| `BUILD_PYTHON` | ON | pybind11 Python 扩展 |
| `ENABLE_ONNX` | ON | ONNX Runtime 后端 |
| `ENABLE_TENSORRT` | OFF | TensorRT 后端（需 CUDA，仅 Windows） |
| `BUILD_EXAMPLES` | ON | C++ demo |

### 5.3 交付物清单

#### Windows（交付文件）

| 文件 | 说明 |
|------|------|
| `algorithm_sdk_core.cp314-win_amd64.pyd` | Python 绑定模块（CPython 3.14） |
| `algorithm_vision.dll` | 全量 SDK（含全部 6 个模块） |
| `algorithm_vision_aitoolkit.dll` | AI 推理子库 |
| `algorithm_vision_cvtoolkit.dll` | 传统视觉子库 |
| `algorithm_vision_measurement.dll` | 测量子库 |
| `algorithm_vision_calibration.dll` | 标定子库 |
| `algorithm_vision_3dtoolkit.dll` | 3D 视觉子库 |
| `onnxruntime.dll` | ONNX Runtime（AI 推理必需） |
| `opencv_world4130.dll` | OpenCV 运行时 |
| `assets/*.onnx` | 模型文件 |
| `include/` | C++ 头文件（C++ 集成用） |

> 所有文件置于同一目录，将目录加入 `sys.path` 或 `PATH` 即可使用。

#### Linux（交付文件）

| 文件 | 说明 |
|------|------|
| `algorithm_sdk_core.cpython-312-x86_64-linux-gnu.so` | Python 绑定模块（CPython 3.12） |
| `libalgorithm_vision.so` | 全量 SDK |
| `libalgorithm_vision_aitoolkit.so` | AI 推理子库 |
| `libalgorithm_vision_cvtoolkit.so` | 传统视觉子库 |
| `libalgorithm_vision_measurement.so` | 测量子库 |
| `libalgorithm_vision_calibration.so` | 标定子库 |
| `libalgorithm_vision_3dtoolkit.so` | 3D 视觉子库 |
| `libonnxruntime.so` | ONNX Runtime（AI 推理时） |
| `assets/*.onnx` | 模型文件 |
| `include/` | C++ 头文件 |

> 设置 `LD_LIBRARY_PATH` 指向交付目录，`PYTHONPATH` 指向交付包根目录即可使用。

```bash
export LD_LIBRARY_PATH=<交付包>/industrial_sdk:$LD_LIBRARY_PATH
export PYTHONPATH=<交付包>:$PYTHONPATH

# 包方式
python3 -c "from industrial_sdk import AIToolkit; print('OK')"
# 直调方式
python3 -c "import algorithm_sdk_core; print('OK')"
```

### 5.4 常见问题

**Q: ImportError: DLL load failed**

确保所有依赖 DLL 与 `.pyd` 在同一目录，或已添加到 `PATH`。

**Q: ONNX Runtime 初始化失败**

确认 `D:/onnxruntime/lib/onnxruntime.dll` 存在且版本 1.26.0。

**Q: Python 版本不匹配**

SDK 基于 Python 3.14 编译（`.pyd` 文件名中 `cp314`）。换用其他版本需重新编译。

**Q: 模型加载失败**

确保模型文件路径正确，推荐使用 `assets/` 下的相对路径。

**Q: Linux: ImportError: cannot import name 'algorithm_sdk_core'**

确保 `LD_LIBRARY_PATH` 包含 `.so` 所在目录，`PYTHONPATH` 指向交付包根目录：

```bash
export LD_LIBRARY_PATH=<交付包>/industrial_sdk:$LD_LIBRARY_PATH
export PYTHONPATH=<交付包>:$PYTHONPATH
```

**Q: Linux: cmake 找不到 Eigen3**

已通过 `third_party/eigen-3.4.0/` bundle，CMake 自动使用。若仍报错，手动安装：

```bash
sudo apt install libeigen3-dev
```

**Q: Linux: 编译时 C++17 相关语法报错**

确保编译器版本足够：GCC ≥ 13（Ubuntu 24.04 默认 g++ 13.3）或 Clang ≥ 18。

---

## 6. 附录

### A.1 配置文件参考 (config/models.yaml)

```yaml
inference:
  backend: onnx           # onnx | tensorrt | openvino
  conf: 0.5               # 置信度阈值 [0.0, 1.0]
  iou: 0.45               # NMS IoU 阈值 [0.0, 1.0]
  imgsz: 640              # 模型输入尺寸
  device: "cpu"           # cpu | cuda:0 | auto

models:
  detect:
    onnx: "models/yolo26n.onnx"
    tensorrt: "models/yolo26n.engine"
  segment:
    onnx: "models/yolo26n-seg.onnx"
  classify:
    onnx: "models/yolo26n-cls.onnx"
  pose:
    onnx: "models/yolo26n-pose.onnx"
  obb:
    onnx: "models/yolo26n-obb.onnx"
```

### A.2 模型训练与导出

```bash
# 训练
yolo train model=yolo26n.pt data=my_task.yaml epochs=100 imgsz=640

# 导出 ONNX
yolo export model=runs/.../best.pt format=onnx imgsz=640 opset=12

# 部署
cp best.onnx D:/nnd/AlgorithmSDK/assets/
```

自定义类名需修改 `ONNXAdapter.cpp` 中 `kClassNames` 并重编译。类名 YAML 动态读取在规划中。

### A.3 坐标与单位约定

| 约定 | 说明 |
|------|------|
| 图像坐标系 | 原点**左上角**，X→右，Y→下，单位 px |
| 世界坐标系 | 右手系，由标定板定义原点 |
| 像素尺寸 | `pixel_size` (mm/px) 用于 px ↔ mm 转换 |
| 角度 | 度 (°)，逆时针为正 |
| 相机内参 | `[fx, 0, cx; 0, fy, cy; 0, 0, 1]` |
| 变换矩阵 | 4×4 齐次 `[R t; 0 1]` |

### A.4 术语表

| 术语 | 说明 |
|------|------|
| SDK | Software Development Kit |
| CV | Computer Vision |
| VLM | Vision Language Model |
| ONNX | Open Neural Network Exchange |
| NMS | Non-Maximum Suppression |
| IoU | Intersection over Union |
| GMC | Global Motion Compensation |
| GD&T | Geometric Dimensioning and Tolerancing |
| PnP | Perspective-n-Point |
| ICP | Iterative Closest Point |
| OBB | Oriented Bounding Box |
| GIL | Global Interpreter Lock |

### A.5 已知限制与路线图

| 优先级 | 说明 |
|--------|------|
| 🔴 当前 | 自定义类名需修改 C++ 源码并重编译 |
| 🔴 当前 | CLASSIFY/POSE/OBB 枚举已定义，适配器未实现 |
| 🟡 P1 | 类名从 YAML 动态加载 |
| 🟡 P1 | ONNX 适配器覆盖全部 5 种任务类型 |
| 🟡 P1 | macOS 编译和测试（Ubuntu 24.04 已通过） |
| 🟢 P2 | VLM 引擎实现（LLaVA / Qwen-VL） |
| 🟢 P2 | TensorRT 后端完善和性能基准 |
| 🟢 P3 | C++ 单元测试框架集成到 CMake |

---

> **文档版本**: 1.0 | **生成日期**: 2026-06-23 | **适用范围**: AlgorithmSDK v1.0.0 (commit e1629f5)
