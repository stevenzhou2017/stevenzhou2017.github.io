# AlgorithmSDK YOLO 推理全流程指南

## 一、架构总览

```
┌──────────────────────────────────────────────────────────┐
│  Python 脚本层                                           │
│  detect_yolo.py / segment_yolo.py                        │
│  ai.detectEx(img) / ai.segmentEx(img)                   │
└──────────────────────┬───────────────────────────────────┘
                       │ import algorithm_sdk_core (pybind11 .pyd)
                       ▼
┌──────────────────────────────────────────────────────────┐
│  C++ 高层封装 — AIToolkit (单例)                          │
│  core/src/aitoolkit/AIToolkit.cpp                       │
│  · loadModel(path, task, backend)                       │
│  · detectEx(frame) → DetectionResult                    │
│  · segmentEx(frame) → SegmentationResult                │
└──────────────────────┬───────────────────────────────────┘
                       │ EngineFactory::create(backend, task)
                       ▼
┌──────────────────────────────────────────────────────────┐
│  C++ 推理引擎 — IInferenceEngine 接口                     │
│  core/src/aitoolkit/adapters/ONNXAdapter.cpp            │
│  · loadModel()   — 加载 ONNX 模型                        │
│  · infer()       — 预处理 → 推理 → 后处理                  │
│  · unload()      — 释放资源                              │
└──────────────────────┬───────────────────────────────────┘
                       │ ONNX Runtime C++ API
                       ▼
┌──────────────────────────────────────────────────────────┐
│  ONNX Runtime (D:/onnxruntime)                          │
│  · onnxruntime.dll (v1.26.0)                            │
│  · 执行 .onnx 模型推理                                    │
└──────────────────────────────────────────────────────────┘
```

---

## 二、ONNXAdapter 推理流程详解

`core/src/aitoolkit/adapters/ONNXAdapter.cpp` 是推理核心，一次完整的 `infer()` 调用分为三个阶段：

### 2.1 预处理（DETECT / SEGMENT 共用）

```
输入：cv::Mat BGR 任意尺寸
  │
  ├─ letterbox()
  │   等比缩放 + 居中 padding (灰色 114)
  │   任意尺寸 → 640×640
  │   记录 LetterBoxInfo { r, padW, padH, newW, newH }
  │
  └─ blobFromImage()
      cv::dnn::blobFromImage: BGR→RGB, HWC→CHW, ÷255
      输出：std::vector<float> [1×3×640×640]
```

### 2.2 ONNX Runtime 推理

```
sessionRef.Run(inputTensor) → outputTensors

检测模型 (yolo26n.onnx):
  output0: [1, 300, 6]    每行 x1,y1,x2,y2,conf,clsId

分割模型 (yolo26n-seg.onnx):
  output0: [1, 300, 38]   每行 x1,y1,x2,y2,max_score,clsId + 32个mask系数
  output1: [1, 32, 160, 160]  原型掩码 (Proto26)
```

### 2.3 后处理

**检测 (postprocess):**
```
遍历 300 个检测结果 → 过滤 conf < 阈值
逆letterbox: x_orig = (x - padW) / r
clamp 到 [0, origW/H]
查 kClassNames → 输出 BBox 列表 → DetectResult
```

**分割 (postprocessSeg):**
```
遍历 300 个检测结果 → 过滤 conf < 阈值
逆letterbox (同上)
掩码重建:
  sigmoid( coeffs[1×32] @ proto[32, 25600] )  → 160×160 浮点掩码
  用640空间bbox ÷4 裁剪 → resize到原图bbox尺寸
  threshold 0.5 → CV_8UC1 二值掩码
输出 SegmentBox 列表(含 mask) → SegmentResult
```

### 2.4 关键常量

| 常量 | 值 | 含义 |
|------|-----|------|
| `kInputW/kInputH` | 640 | 模型输入尺寸 |
| `kMaxDet` | 300 | 最大检测数 |
| `kOutputDim` | 6 | 检测输出维度 (x1,y1,x2,y2,conf,clsId) |
| `kOutputDimSeg` | 38 | 分割输出维度 (6 + 32个mask系数) |
| `kMaskProtoC` | 32 | 原型掩码通道数 |
| `kMaskProtoH/W` | 160 | 原型掩码空间尺寸 (640÷4) |
| `kMaskThreshold` | 0.5 | 掩码二值化阈值 |

### 2.5 数据结构流转

```
ONNXAdapter::infer()
  → DetectResult : InferenceResult
      └─ vector<BBox> { x1,y1,x2,y2, confidence, classId, className }

  → SegmentResult : InferenceResult
      └─ vector<SegmentBox> : BBox
          └─ + cv::Mat mask (CV_8UC1, 每个实例的二值掩码)

AIToolkit 转换:
  BBox → DetectionBox     (对外暴露)
  SegmentBox → SegmentationBox (对外暴露，mask 保留)

pybind11 转换:
  DetectionBox/SegmentationBox → Python 对象
  cv::Mat mask → numpy array
```

---

## 三、自定义模型训练全流程

### 3.1 第一阶段：训练（在 D:\test\ultralytics）

**准备数据：**

```
D:\test\ultralytics\datasets\my_task\
├── images\
│   ├── train\          # 训练图片 (.jpg)
│   └── val\            # 验证图片 (.jpg)
├── labels\
│   ├── train\          # YOLO 标注 (.txt)
│   └── val\
└── my_task.yaml        # 数据集配置
```

`my_task.yaml` 示例：

```yaml
path: D:/test/ultralytics/datasets/my_task
train: images/train
val: images/val
names:
  0: scratch
  1: dent
  2: crack
  3: stain
```

**训练命令：**

```bash
# 目标检测
yolo train model=yolo26n.pt data=my_task.yaml epochs=100 imgsz=640 name=my_detect

# 实例分割
yolo train model=yolo26n-seg.pt data=my_task.yaml epochs=100 imgsz=640 name=my_segment

# 姿态估计
yolo train model=yolo26n-pose.pt data=my_pose.yaml epochs=100 imgsz=640 name=my_pose

# 旋转框检测
yolo train model=yolo26n-obb.pt data=my_obb.yaml epochs=100 imgsz=640 name=my_obb

# 分类
yolo train model=yolo26n-cls.pt data=my_cls.yaml epochs=100 imgsz=640 name=my_cls
```

产出：`runs/<task>/my_xxx/weights/best.pt`

### 3.2 第二阶段：导出 ONNX

```bash
yolo export model=runs/segment/my_segment/weights/best.pt format=onnx imgsz=640 opset=12
```

产出 `best.onnx`，复制到 SDK：

```
D:\nnd\AlgorithmSDK\assets\my_segment.onnx
D:\nnd\AlgorithmSDK\assets\my_segment.yaml   # 配置文件
```

### 3.3 第三阶段：SDK 适配（当前需要做的事情）

> ⚠️ **当前状态**：类名硬编码在 C++ 源码中，训练新模型需要改 C++ 代码并重新编译。
> **规划方向**：将配置改为从 YAML 读取，届时只需复制配置文件即可，无需重编译。

**当前需要修改的文件：**

| 文件 | 修改内容 |
|------|---------|
| `core/src/aitoolkit/adapters/ONNXAdapter.cpp:21` | `kClassNames` 改为自定义类名 |
| `ONNXAdapter.h:67-68` | 如果训练 `imgsz ≠ 640`，修改 `kInputW/kInputH` |

**当前步骤：**

1. 修改 `ONNXAdapter.cpp` 中的 `kClassNames` 为你的类别
2. 如果 `imgsz` 不是 640，修改 `kInputW/kInputH`
3. 重新编译：

```bash
cd build
cmake --build . --config Release
```

**规划中的配置化（尚未实现）：**

```
assets/
├── my_segment.onnx          # 模型文件
└── my_segment.yaml           # 配置文件
    # classes:
    #   - scratch
    #   - dent
    #   - crack
    #   - stain
    # input_size: 640
```

理想流程：训练完 → 导出 `onnx + yaml` → 复制到 assets → 直接用，无需重编译。

### 3.4 第四阶段：推理调用

训练好、导出好、SDK 适配好之后，调用方式和现在完全一样：

```python
import algorithm_sdk_core as sdk
import cv2

ai = sdk.AIToolkit.instance()

# ── 检测 ──
ai.loadModel("assets/my_detect.onnx", "detect", "onnx")
ai.setConfidenceThreshold(0.3)

img = cv2.imread("test.jpg")
result = ai.detectEx(img)          # → DetectionResult
for box in result.boxes:
    print(f"{box.class_name} @ {box.confidence:.2f}")

# ── 分割 ──
ai.loadModel("assets/my_segment.onnx", "segment", "onnx")

result = ai.segmentEx(img)         # → SegmentationResult
for box in result.boxes:
    # box.mask 是 numpy array (CV_8UC1)，可保存或叠加显示
    cv2.imwrite(f"mask_{box.class_name}.png", box.mask)

# ── 一键函数（封装了加载+参数+推理）──
# 参见 detect_yolo.py / segment_yolo.py
```

---

## 四、Python 脚本用法

### 检测

```bash
python detect_yolo.py                    # 扫描 data/image/ 全部图片
python detect_yolo.py test.jpg           # 单张图片
python detect_yolo.py --conf 0.3         # 调整置信度阈值
python detect_yolo.py --bench 100        # 性能测试 (100次取平均)
```

### 分割

```bash
python segment_yolo.py                   # 扫描 data/image/ 全部图片
python segment_yolo.py test.jpg          # 单张图片
python segment_yolo.py --conf 0.3        # 调整置信度阈值
python segment_yolo.py --bench 100       # 性能测试 (100次取平均)
```

结果输出到 `data/result/`:
- 检测：`{name}_detect.jpg`
- 分割：`{name}_segment.jpg`

---

## 五、当前支持的任务类型

| TaskType | 对应模型 | ONNX 输出 | SDK 状态 |
|----------|---------|-----------|---------|
| `DETECT` | yolo26n.onnx | [1, 300, 6] | ✅ 完整支持 |
| `SEGMENT` | yolo26n-seg.onnx | [1, 300, 38] + [1, 32, 160, 160] | ✅ 完整支持 |
| `CLASSIFY` | yolo26n-cls.onnx | [1, 1000] | ⚠️ 枚举已定义，适配器未实现 |
| `POSE` | yolo26n-pose.onnx | [1, 300, 56] | ⚠️ 枚举已定义，适配器未实现 |
| `OBB` | yolo26n-obb.onnx | [1, 300, 9] | ⚠️ 枚举已定义，适配器未实现 |
| `SEMANTIC` | yolo26n-sem.onnx | class map | ⚠️ 枚举已定义，适配器未实现 |

---

## 六、文件索引

### C++ SDK 核心

| 文件 | 作用 |
|------|------|
| `core/include/.../AIToolkit/adapters/ONNXAdapter.h` | ONNX 适配器头文件（常量、接口） |
| `core/src/aitoolkit/adapters/ONNXAdapter.cpp` | ONNX 适配器实现（预处理 → 推理 → 后处理） |
| `core/include/.../AIToolkit/IInferenceEngine.h` | 推理引擎纯虚接口 |
| `core/include/.../AIToolkit/EngineFactory.h` | 工厂方法（按 backend+task 创建引擎） |
| `core/src/aitoolkit/EngineFactory.cpp` | 工厂实现（含路径推断逻辑） |
| `core/include/.../AIToolkit/AIToolkit.h` | 高层单例 API（detect/segment/batch） |
| `core/src/aitoolkit/AIToolkit.cpp` | 高层实现 |
| `core/include/.../AIToolkit/common/TaskType.h` | 任务枚举 + 结果数据结构 |
| `core/src/aitoolkit/common/TaskType.cpp` | draw() 可视化实现 |
| `core/include/.../VisionFrame.h` | VisionFrame + DetectionBox/Result + SegmentationBox/Result |

### Python

| 文件 | 作用 |
|------|------|
| `bindings/algorithm_sdk_core.cpp` | pybind11 绑定（C++ → Python） |
| `detect_yolo.py` | 检测脚本 |
| `segment_yolo.py` | 分割脚本 |
| `test_model_detect.py` | 检测集成测试 |

### 模型与资源

| 路径 | 内容 |
|------|------|
| `assets/yolo26n.onnx` | 检测模型 (~10MB) |
| `assets/yolo26n-seg.onnx` | 分割模型 (~11MB) |
| `data/image/` | 测试图片 |
| `data/result/` | 推理结果输出 |
| `D:/onnxruntime/` | ONNX Runtime 库 (headers + lib + dll) |

---

## 七、编译

```bash
cd D:\nnd\AlgorithmSDK\build
cmake .. -G "Visual Studio 18 2026" \
  -DCMAKE_BUILD_TYPE=Release \
  -DENABLE_ONNX=ON \
  -DBUILD_PYTHON=ON \
  -DBUILD_CALIBRATION=OFF
cmake --build . --config Release
```

编译产物：
- `build/Release/algorithm_vision_aitoolkit.dll` — AI 推理库
- `build/Release/algorithm_sdk_core.cp314-win_amd64.pyd` — Python 绑定
