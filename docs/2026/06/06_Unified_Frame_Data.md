# 统一数据契约

author： 周均扬

date： 2026.06.06

---

统一数据契约，重点是：**零拷贝 + 统一入口 + 可扩展 + 跨平台 + 多线程安全**。

## 1. 设计目标重构

- ✔ 统一数据模型（Single Data Contract）: CameraSDK / AlgorithmSDK 共享一个 Frame Contract

- ✔ 零拷贝链路（Zero-Copy Pipeline）: 采集 → 传输 → 算法 → 后处理 **不复制 cv::Mat**

- ✔ 多线程安全（Producer/Consumer）: 采集线程 ↔ 推理线程 ↔ 后处理线程

- ✔ 可扩展 metadata: 避免 struct 硬编码字段

---

## 2. 核心方案：引入 UnifiedFrame（统一中间层）

新增中间层： **UnifiedFrame = 跨 SDK 的唯一数据契约**

UnifiedFrame 定义:

```cpp
#pragma once

#include <memory>
#include <string>
#include <unordered_map>
#include <any>
#include <opencv2/opencv.hpp>

enum class UnifiedPixelFormat
{
    BGR,
    RGB,
    GRAY,
    NV12
};

class UnifiedFrame
{
public:
    using Ptr = std::shared_ptr<UnifiedFrame>;

    // =====================
    // 图像数据（核心：零拷贝）
    // =====================
    cv::Mat image;

#ifdef ENABLE_CUDA
    cv::cuda::GpuMat gpu_image;
#endif

    // =====================
    // 标准化元数据
    // =====================
    uint64_t frame_id = 0;
    uint64_t timestamp_ns = 0;

    int camera_id = -1;

    UnifiedPixelFormat format = UnifiedPixelFormat::BGR;

    bool valid = true;

    // =====================
    // 扩展字段
    // =====================
    std::unordered_map<std::string, std::any> meta;

public:
    UnifiedFrame() = default;

    inline void reset()
    {
        image.release();
#ifdef ENABLE_CUDA
        gpu_image.release();
#endif
        meta.clear();
        valid = false;
    }

    inline void setTimestamp()
    {
        // 可替换为 chrono 高精度实现
        timestamp_ns = static_cast<uint64_t>(
            std::chrono::high_resolution_clock::now().time_since_epoch().count()
        );
    }
};
```

---

## 3. CameraSDK → UnifiedFrame（零拷贝关键点）

关键原则：**CameraSDK 只负责“填数据”，不负责“解释数据”**。

### Adapter 设计：

```cpp
class CameraFrameAdapter
{
public:
    static UnifiedFrame::Ptr convert(const FrameBuffer& src)
    {
        auto dst = std::make_shared<UnifiedFrame>();

        // ⚠️ 核心：不做 clone
        dst->image = src.image;

        dst->frame_id = src.frame_id;
        dst->camera_id = src.camera_id;
        dst->timestamp_ns = src.timestamp;

        dst->valid = src.valid;

        dst->meta["sequence"] = src.sequence;
        dst->meta["gpu"] = src.gpu;

#ifdef ENABLE_CUDA
        if (src.gpu)
        {
            dst->gpu_image = src.gpu_image;
        }
#endif

        return dst;
    }
};
```

---

## 4. AlgorithmSDK → UnifiedFrame（算法输入标准化）

```cpp
class VisionFrameAdapter
{
public:
    static UnifiedFrame::Ptr convert(const VisionFrame& src)
    {
        auto dst = std::make_shared<UnifiedFrame>();

        dst->image = src.image;

        dst->camera_id = std::stoi(src.camera_id); // 建议后续改 string hash
        dst->timestamp_ns = static_cast<uint64_t>(src.timestamp * 1e9);

        dst->format = static_cast<UnifiedPixelFormat>(src.format);

        for (auto& [k, v] : src.metadata)
        {
            dst->meta[k] = v;
        }

        return dst;
    }

    static VisionFrame toVisionFrame(const UnifiedFrame& src)
    {
        VisionFrame vf;
        vf.image = src.image;

        vf.camera_id = std::to_string(src.camera_id);
        vf.timestamp = src.timestamp_ns / 1e9;

        vf.format = PixelFormat::BGR;

        vf.metadata = src.meta;

        return vf;
    }
};
```

---

## 5. 统一 Pipeline 架构

### 5.1 标准工业链路

```
CameraSDK -> FrameBuffer (zero-copy) -> UnifiedFrame (adapter layer) -> AlgorithmSDK algorithms -> VisionFrame (optional interop)
```

### 5.2 多线程架构

### Lock-free / SPSC Queue（核心）

```cpp
template<typename T>
class FrameQueue
{
public:
    void push(T frame);
    T pop();
};
```


### 5.3 Pipeline：

```
Camera Thread -> FrameBuffer Pool -> Adapter Thread -> UnifiedFrame Queue -> Inference Thread -> Postprocess Thread
```

---

## 6. Zero-Copy 关键优化点

### ❌ 必须避免
```cpp
cv::Mat copy = src.image.clone();
```

### ✔ 正确做法
```cpp
dst->image = src.image;  // ref-count sharing
```

OpenCV `cv::Mat` 本身就是：
> ✔ reference-counted shared buffer
> ✔ shallow copy 默认 zero-copy

---

## CUDA路径（高级优化）

```cpp
dst->gpu_image = src.gpu_image; // 同样是浅拷贝
```

---

## 7. CameraSDK / AlgorithmSDK 解耦策略

### ❌ 不要做：

* 直接让 CameraSDK include VisionFrame (AlgorithmSDK 中的数据格式)
* 直接让算法 include FrameBuffer (CameraSDK中的数据格式)


### ✔ 正确方式：

```
CameraSDK -> (Adapter Layer) -> UnifiedFrame -> (Adapter Layer) -> AlgorithmSDK
```

---

## 8. 统一设计带来的收益

## ✔ 架构层

* 完全解耦采集 / 算法
* SDK 可独立升级

## ✔ 性能层

* cv::Mat zero-copy
* GPU buffer 可复用
* 避免 memcpy / serialize

## ✔ 工业扩展性

* metadata 支持任意工业字段
* 支持多相机 / 多流

## ✔ 多线程能力

* SPSC queue + shared_ptr
* lock-free pipeline 可扩展
