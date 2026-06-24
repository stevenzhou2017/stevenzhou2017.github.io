# CameraSDK × YOLOSDK 联合调试指南

## 概述

CameraSDK（相机采集）与 YOLOSDK（目标检测）通过 Python 桥接实现联合实时推理：

```
海康相机 → CameraSDK(C++) → _core.pyd → numpy → pyyolo → YOLOSDK(C++) → 检测框叠加 → OpenCV 显示
```

---

## 数据流

```
┌─────────────────────────────────────────────────────────────────┐
│                         Python 层                               │
│                                                                 │
│  pycamera.create_camera("hik")    pyyolo.create("onnx", ...)    │
│         │                                │                      │
│         ▼                                ▼                      │
│  cam.grabFrame()                  engine.infer(tensor)          │
│         │                                │                      │
│         ▼                                ▼                      │
│  FrameBuffer.numpy()   ──►   ImageTensor.image = np_array       │
│         │                                │                      │
│         ▼                                ▼                      │
│     cv::Mat                     DetectResult.draw(image)        │
│   (零拷贝 numpy)                  (返回带框的新图像)               │
│                                      │                          │
│                                      ▼                          │
│                              cv2.imshow("YOLO", img)            │
└─────────────────────────────────────────────────────────────────┘

C++ 层:
  CameraSDKCore.dll ──► HikAdapter ──► MvCameraControl.dll ──► 相机
  YoloSDKCore.dll  ──► ONNXAdapter ──► onnxruntime.dll    ──► YOLO 模型
```

---

## 环境要求

| 组件 | 版本/路径 | 说明 |
|------|----------|------|
| Python | 3.14.5 | 两个 SDK 的 `.pyd` 均编译为 cp314 |
| CameraSDK | `d:\nnd\CameraSDK` | 已编译，已安装 |
| YOLOSDK | `d:\nnd\YOLOSDK` | 已编译 |
| MVS Runtime | `C:\Program Files (x86)\Common Files\MVS\Runtime\Win64_x64` | 海康 SDK 运行时 |
| YOLO 模型 | `d:\nnd\YOLOSDK\assets\yolo26n.onnx` | YOLOv26n，ONNX 格式 |

---

## 环境搭建

### 1. 安装 Python 包

```bash
# pycamera（CameraSDK Python 绑定）
pip install --no-deps -e d:\nnd\CameraSDK\python

# pyyolo（YOLOSDK Python 绑定）
pip install --no-deps -e d:\nnd\YOLOSDK\python

# 运行时依赖
pip install opencv-python numpy
```

### 2. 验证导入

```bash
python -c "import pycamera; import pyyolo; print('OK')"
```

应输出：
```
pycamera loaded
OK
```

### 3. 编译 CameraSDK（代码修改后）

```bash
cd d:\nnd\CameraSDK
cmake --build build --config Release
cmake --install build --config Release   # 更新 _core.pyd 到包目录
```

---

## 关键桥梁

联合调试需要打通两个 SDK 之间的数据通道。CameraSDK 的改造如下：

### A. FrameBuffer.numpy() — 图像数据导出

**文件**: [src/python/pycamera.cpp](../src/python/pycamera.cpp)

```cpp
// FrameBuffer 绑定中新增
.def("numpy", [](const FrameBuffer &f) -> py::object {
    // cv::Mat → numpy.ndarray，零拷贝
    py::dtype dt = ...;          // CV_8U → uint8
    vector<py::ssize_t> shape;   // (H, W, C) 或 (H, W)
    vector<py::ssize_t> strides; // cv::Mat::step 直接映射
    return py::array(dt, shape, strides, f.frame.data, parent);
})
```

### B. HikAdapter.grabFrame() — Python 端取帧

**文件**: [src/python/pycamera.cpp](../src/python/pycamera.cpp)

```cpp
// ICamera / HikAdapter 绑定中新增
.def("grabFrame", [](HikAdapter &self) -> FrameBuffer::Ptr {
    FrameBuffer::Ptr frame;
    if (self.grabFrame(frame))
        return frame;
    return nullptr;  // Python 端检查 None
})
```

### C. YOLOSDK ImageTensor — 接收 numpy

**文件**: [D:\nnd\YOLOSDK\src\python\pyyolo_bindings.cpp](D:\nnd\YOLOSDK\src\python\pyyolo_bindings.cpp)

```cpp
// ImageTensor 绑定（YOLOSDK 已有，无需修改）
.def_property("image",
    [](ImageTensor& self) -> py::object { return py::cast(self.image); },
    [](ImageTensor& self, py::array arr) {
        self.image = arr.cast<cv::Mat>();  // numpy → cv::Mat（type caster）
        self.width  = self.image.cols;
        self.height = self.image.rows;
        self.valid  = !self.image.empty();
    })
```

---

## 联合调试脚本

**文件**: [examples/yolo_detect.py](../examples/yolo_detect.py)

```python
"""CameraSDK + YOLOSDK 联合实时目标检测"""
import os, sys

# ── DLL 路径（必须在 import 之前）────────────
BUILD_DIR = "d:/nnd/CameraSDK/build/Release"
MVS_DIR   = "C:/Program Files (x86)/Common Files/MVS/Runtime/Win64_x64"
YOLO_DIR  = "D:/nnd/YOLOSDK/python/pyyolo/pyyolo"

for d in [BUILD_DIR, MVS_DIR, YOLO_DIR]:
    if os.path.isdir(d):
        os.add_dll_directory(d)

sys.path.insert(0, "d:/nnd/CameraSDK/python")

import pycamera
import pyyolo
import cv2

# ── 参数 ─────────────────────────────────────
exposure = float(sys.argv[1]) if len(sys.argv) > 1 else 20000
gain     = float(sys.argv[2]) if len(sys.argv) > 2 else 10
conf     = float(sys.argv[3]) if len(sys.argv) > 3 else 0.5

# ── 1. 打开相机 ──────────────────────────────
cam = pycamera.create_camera("hik")
cam.open()
cam.setParam("ExposureTime", exposure)
cam.setParam("Gain", gain)
cam.start()

# ── 2. 加载 YOLO 模型 ────────────────────────
engine = pyyolo.create("onnx", "detect",
    "D:/nnd/YOLOSDK/assets/yolo26n.onnx", conf=conf)

# ── 3. 实时检测循环 ──────────────────────────
cv2.namedWindow("YOLO Detection", cv2.WINDOW_NORMAL)
cv2.resizeWindow("YOLO Detection", 1280, 720)

while True:
    fb = cam.grabFrame()
    if fb is None:
        continue

    img = fb.numpy()

    tensor = pyyolo.ImageTensor()
    tensor.image = img

    result = engine.infer(tensor)
    if result is not None and len(result.boxes) > 0:
        img = result.draw(img)   # ⚠️ draw 返回新图像，不是原地修改

    cv2.imshow("YOLO Detection", img)

    if cv2.waitKey(1) == 27:  # ESC
        break

cam.stop()
cam.close()
```

---

## 运行命令

```bash
cd d:\nnd\CameraSDK\examples

# 默认参数
python yolo_detect.py

# 自定义曝光、增益、置信度
python yolo_detect.py 20000 10 0.5

# 低曝光（避免过曝）
python yolo_detect.py 5000 5 0.3
```

---

## 已验证功能

| 功能 | 状态 | 备注 |
|------|------|------|
| CameraSDK 实时采集 | ✅ | 海康 GigE 相机 |
| YOLO 模型推理 | ✅ | ONNX Runtime，~5 目标/帧 |
| 检测框叠加显示 | ✅ | `result.draw()` 返回新图像 |
| 多相机切换 | ✅ | 不同相机需重新调曝光 |
| 彩色相机 Bayer 处理 | ✅ | RG↔BG 互换已适配 |
| 单色相机 Mono8 | ✅ | 无色彩，YOLO 基于纹理检测 |

---

## 常见问题

### Q: `MV_CC_EnumDevices failed: 0x8000000c`

MVS Runtime DLL 缺失。确保 `C:\Program Files (x86)\Common Files\MVS\Runtime\Win64_x64` 在 DLL 搜索路径中。

### Q: `MV_CC_OpenDevice failed: 0x80000203`

相机被 MVS 客户端独占。关掉 MVS 客户端。

### Q: 画面有网格/马赛克

Bayer 转换没生效或排列错误。检查 `PixelType` 诊断输出，确认转换代码匹配。

### Q: 画面严重偏色/白平衡异常

在 MVS 客户端中设置 `BalanceWhiteAuto = Continuous`，相机掉电保存。或代码中调用：
```python
cam.setParam("BalanceWhiteAuto", 2)
```

### Q: 检测框不显示

`result.draw(image)` 返回新图像，不是原地修改。必须接收返回值：
```python
img = result.draw(img)  # ✅
result.draw(img)        # ❌ 无效
```

### Q: 换相机后效果变差

不同型号的相机需要不同的曝光/增益/白平衡配置。先在 MVS 客户端中调好，再到代码中使用。
