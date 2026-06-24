# CameraSDK 开发文档

## 项目概述

CameraSDK v2.0.0 — 工业级跨平台相机 SDK，支持 C++ / Python 双语言接口。

| 维度 | 说明 |
|------|------|
| 语言 | C++17，CMake 3.22+ |
| 平台 | Windows 10/11 x64（Linux 预留给构已就绪） |
| 相机 | Hikvision GigE / USB3（Basler、Dahua 给构已预留） |
| Python | Python 3.14，pybind11 桥接 |
| 第三方 | OpenCV 4.12、spdlog、yaml-cpp、CUDA（可选） |

---

## 目录结构

```
CameraSDK/
├── CMakeLists.txt              # 构建配置
├── test.py                     # Python 接口冒烟测试（8 项）
├── test.bat                    # Windows 测试启动脚本
│
├── include/
│   ├── ICamera.h               # 核心抽象接口
│   ├── CameraFactory.h         # 工厂类
│   ├── CameraManager.h         # 多相机管理器
│   ├── HikCamera.h             # Hik 类型标签
│   ├── BaslerCamera.h / DahuaCamera.h
│   ├── CameraWindows.h / CameraLinux.h
│   ├── adapters/
│   │   ├── HikAdapter.h        # ★ 海康适配器（真实 SDK 对接）
│   │   ├── BaslerAdapter.h
│   │   └── DahuaAdapter.h
│   └── common/
│       ├── FrameBuffer.h       # 帧缓冲（GPU 支持）
│       ├── ThreadSafeQueue.h   # 线程安全队列
│       ├── ConfigManager.h     # YAML 配置解析
│       └── Logger.h            # spdlog 封装
│
├── src/                        # 与 include 一一对应的实现
│   ├── CameraFactory.cpp
│   ├── CameraManager.cpp
│   ├── adapters/HikAdapter.cpp # ★ 真实海康 SDK 调用
│   └── common/...
│
├── examples/
│   ├── single_frame.cpp        # C++ 单帧采集
│   ├── continuous_capture.cpp  # C++ 连续采集
│   ├── multi_camera.cpp        # C++ 多相机管理
│   ├── python_demo.py          # Python 示例
│   └── python_multi_cam.py     # Python 多相机示例
│
├── python/
│   ├── setup.py                # wheel 打包
│   ├── pyproject.toml
│   └── pycamera/               # Python 包
│       ├── __init__.py
│       └── pycamera/
│           ├── __init__.py      # DLL 路径自动发现
│           ├── _core.cp314-win_amd64.pyd
│           ├── CameraSDKCore.dll
│           └── MvCameraControl.dll
│
├── third_party/
│   └── Hikvision/Windows/      # 海康 SDK 头文件和导入库
│
├── config/cameras.yaml         # 相机配置文件
└── docs/                       # 本文档
```

---

## 架构设计

### 三层架构

```
┌──────────────────────────────────────────┐
│  应用层（C++ examples / Python scripts）   │
├──────────────────────────────────────────┤
│  CameraManager — 多相机管理、工作线程、帧队列│
├──────────────────────────────────────────┤
│  ICamera ← HikAdapter / Basler / Dahua    │
│      适配器层（插件式，编译时可选）           │
├──────────────────────────────────────────┤
│  Common: FrameBuffer / ThreadSafeQueue /   │
│          Logger / ConfigManager            │
├──────────────────────────────────────────┤
│  第三方: OpenCV / spdlog / yaml-cpp / CUDA │
└──────────────────────────────────────────┘
```

### ICamera 核心接口

```cpp
class ICamera {
    virtual bool open() = 0;
    virtual void close() = 0;
    virtual bool grabFrame(FrameBuffer::Ptr &frame) = 0;
    virtual bool start() = 0;      // 启动连续取流
    virtual void stop() = 0;       // 停止取流
    virtual bool isOpened() const = 0;
    virtual void setFrameCallback(FrameCallback cb) = 0;
    virtual void enableGPU(bool enable) = 0;
    virtual bool setParam(const std::string &name, double value) = 0;
    virtual double getParam(const std::string &name) = 0;
};
```

### 取流模式

| 模式 | 调用方式 | 适用场景 |
|------|---------|---------|
| 单帧 | `open()` → `grabFrame()` → `close()` | 拍照 |
| 连续（轮询） | `open()` → `start()` → 循环 `grabFrame()` → `stop()` → `close()` | continuous_capture |
| 连续（回调） | `open()` → `setFrameCallback()` → `start()` → `stop()` → `close()` | 事件驱动 |
| 多相机 | `CameraManager` + `startAll()` → `popFrame()` → `stopAll()` | 多相机同步 |

---

## HikAdapter 实现详解

HikAdapter 是 ICamera 接口的海康威视实现，对接海康 MVS SDK（Machine Vision Software Development Kit）。
核心文件：[include/adapters/HikAdapter.h](../include/adapters/HikAdapter.h)、[src/adapters/HikAdapter.cpp](../src/adapters/HikAdapter.cpp)。

---

### 整体数据流

```
应用层
  │ open()  start()  grabFrame()  setParam()  close()
  ▼
HikAdapter（本适配器）
  │ 封装海康 C API，管理句柄生命周期、引用计数、像素转换
  ▼
MvCameraControl.dll（海康 SDK 主 DLL）
  │ GigE：MVGigEVisionSDK.dll → 网卡过滤驱动 → 网线 → 相机
  │ USB3：MvUsb3vTL.dll       → USB 驱动      → USB线 → 相机
  ▼
相机硬件
```

---

### 1. SDK 生命周期管理（引用计数）

海康 SDK 是进程级全局状态，`MV_CC_Initialize()` 和 `MV_CC_Finalize()` 只能调用一次。
但 CameraSDK 允许创建多个 HikAdapter 实例（多相机场景），因此用**引用计数**确保只在首个实例构造时初始化、最后一个实例析构时反初始化。

```
Camera A 构造 → refCount 0→1, MV_CC_Initialize()    ← 仅这一次
Camera B 构造 → refCount 1→2, 跳过
Camera A 析构 → refCount 2→1, 跳过
Camera B 析构 → refCount 1→0, MV_CC_Finalize()      ← 仅这一次
```

实现：
- 静态原子变量 `g_sdkRefCount` 记录活跃实例数
- 静态互斥锁 `g_sdkMutex` 保证线程安全
- 静态函数 `initSDK()` / `finalizeSDK()`

---

### 2. open() — 设备发现与连接

```
MV_CC_Initialize()          ← 已在构造函数中完成
       │
       ▼
MV_CC_EnumDevices(GIGE|USB3, &devList)
       │ 枚举网络和 USB 总线上的所有海康设备
       │ 返回设备数量 nDeviceNum，每个设备包含厂商名、型号、序列号、IP 地址
       │
       ▼
取 devList.pDeviceInfo[0]   ← 默认打开第一个可用设备
       │
       ▼
MV_CC_CreateHandle(&handle_, pDeviceInfo)
       │ 为指定设备创建 SDK 句柄（handle_ 是 void*，对外透明）
       │
       ▼
MV_CC_OpenDevice(handle_, MV_ACCESS_Exclusive, 0)
       │ 独占模式打开设备。若设备已被其他程序占用，返回 0x80000203
       │
       ▼
MV_CC_SetEnumValue(handle_, "AcquisitionMode", MV_ACQ_MODE_CONTINUOUS)
MV_CC_SetEnumValue(handle_, "TriggerMode",      MV_TRIGGER_MODE_OFF)
       │ 设置为连续采集模式、关闭硬件触发（自由运行）
       │
       ▼
opened_ = true
```

**错误码速查**：

| 错误码 | 含义 | 常见原因 |
|--------|------|---------|
| `0x8000000C` | DLL 加载失败 | MVS Runtime 目录不在 PATH，或缺失 VC++ 运行时 |
| `0x80000203` | 设备无访问权限 | MVS 客户端或其他程序正独占相机 |
| `MV_OK` (0) | 成功 | |

---

### 3. grabFrame() — 取帧核心逻辑

grabFrame() 是**唯一的取帧入口**，兼顾单帧和连续两种场景：

```
grabFrame(frame)
  │
  ├─ grabbing_ == false ?
  │     │ 单帧模式：需要临时启停取流
  │     ├─ MV_CC_StartGrabbing(handle_)     ← 开始取流
  │     ├─ MV_CC_GetImageBuffer(handle_, &stFrame, 5000)
  │     │     等待一帧（5 秒超时），拿到原始图像数据 pBufAddr
  │     ├─ wrapFrame(&stFrame)              ← 图像包装（见下文）
  │     ├─ MV_CC_FreeImageBuffer(handle_, &stFrame)  ← 归还 SDK 缓存
  │     └─ MV_CC_StopGrabbing(handle_)      ← 停止取流
  │
  └─ grabbing_ == true ?
        │ 连续模式：start() 已开启取流，直接拿帧
        ├─ MV_CC_GetImageBuffer(handle_, &stFrame, 500)  ← 短超时
        ├─ wrapFrame(&stFrame)
        └─ MV_CC_FreeImageBuffer(handle_, &stFrame)
```

**两种模式切换逻辑**：
- 如果在 `start()` 之前调用 `grabFrame()`（即 `single_frame.cpp` 场景），自动启动/停止取流
- 如果在 `start()` 之后调用 `grabFrame()`（即 `continuous_capture.cpp` 场景），不重复启动，直接取帧

---

### 4. start() / stop() — 连续取流控制

```
start():
  MV_CC_StartGrabbing(handle_)      ← SDK 内部开始缓存图像
  grabbing_ = true
  running_  = true
  if (callback_ 已设置):
      captureThread_ = thread(captureLoop)  ← 启动后台线程
  else:
      不开线程                          ← 由 CameraManager 或用户轮询 grabFrame()

stop():
  running_ = false
  captureThread_.join()              ← 等待后台线程退出（如有）
  MV_CC_StopGrabbing(handle_)        ← 停止 SDK 取流
  grabbing_ = false
```

**为什么不总是开启后台线程？**

CameraManager 有自己的工作线程来轮询 `grabFrame()`。如果 HikAdapter 也开启后台线程，
两个线程同时对同一个 `handle_` 调用 `MV_CC_GetImageBuffer()`，会导致帧数据竞争。
因此只有用户显式注册回调时（需要回调驱动模式），HikAdapter 才启动自己的线程。

---

### 5. wrapFrame() — 图像数据包装

将海康 `MV_FRAME_OUT` 结构体转换为 CameraSDK 的 `FrameBuffer`：

```
MV_FRAME_OUT（海康原始帧数据）
  ├── pBufAddr           → 原始图像数据指针
  ├── stFrameInfo.nWidth → 图像宽度（最大 65535）
  ├── stFrameInfo.nHeight→ 图像高度
  ├── stFrameInfo.enPixelType → 像素格式（Mono8, BayerRG8, RGB8...）
  ├── stFrameInfo.nFrameLen   → 数据字节数
  └── stFrameInfo.nHostTimeStamp → 主机时间戳

        │  深拷贝（std::memcpy，因为 SDK 回调结束后会回收 pBufAddr）
        ▼

FrameBuffer（CameraSDK 帧缓冲）
  ├── frame        → cv::Mat（图像矩阵）
  ├── timestamp    → 时间戳
  ├── frame_id     → 帧序号
  ├── gpu          → GPU 标记
  └── valid        → 有效性标记
```

**像素格式转换表**：

| 海康 `MvGvspPixelType` | OpenCV Type | 附加处理 |
|------------------------|-------------|---------|
| `PixelType_Gvsp_Mono8` | `CV_8UC1` | 直接拷贝 |
| `PixelType_Gvsp_BayerRG8` | `CV_8UC1` | `cv::cvtColor(COLOR_BayerRG2BGR)` |
| `PixelType_Gvsp_BayerGB8` | `CV_8UC1` | `cv::cvtColor(COLOR_BayerGB2BGR)` |
| `PixelType_Gvsp_BayerGR8` | `CV_8UC1` | `cv::cvtColor(COLOR_BayerGR2BGR)` |
| `PixelType_Gvsp_BayerBG8` | `CV_8UC1` | `cv::cvtColor(COLOR_BayerBG2BGR)` |
| `PixelType_Gvsp_RGB8_Packed` | `CV_8UC3` | 直接拷贝（RGB 顺序） |
| `PixelType_Gvsp_BGR8_Packed` | `CV_8UC3` | 直接拷贝（BGR 顺序） |

> Bayer 格式是工业相机最常见的输出格式——每个像素只有一个颜色通道的值，需用插值算法还原为彩色图。
> 转换后统一为 BGR 格式，与 OpenCV 默认颜色顺序一致。

---

### 6. captureLoop() — 回调模式的采集线程

仅当用户通过 `setFrameCallback()` 注册了回调且调用了 `start()` 时运行：

```
captureLoop 线程:
  while (running_):
    MV_CC_GetImageBuffer(handle_, &stFrame, 500)   ← 500ms 超时
      │
      ├─ MV_OK（拿到帧）
      │    wrapFrame(&stFrame)                     ← 包装为 FrameBuffer
      │    MV_CC_FreeImageBuffer(handle_, &stFrame)
      │    callback_(frame)                        ← 触发用户回调（线程安全）
      │
      └─ MV_E_TIMEOUT（超时无帧，正常情况）
           继续下一轮
```

---

### 7. setParam() / getParam() — GenICam 参数读写

通过字符串键名读写相机参数，遵循 GenICam 标准命名规范：

```cpp
// 写入浮点参数
cam->setParam("ExposureTime", 5000.0);
//  内部: MV_CC_SetFloatValue(handle_, "ExposureTime", 5000.0f)

// 读取浮点参数
double val = cam->getParam("ExposureTime");
//  内部: MV_CC_GetFloatValue(handle_, "ExposureTime", &floatVal)
//        return floatVal.fCurValue
```

**常用 GenICam 参数名**（海康相机）：

| 参数名 | 类型 | 说明 | 典型值 |
|--------|------|------|--------|
| `ExposureTime` | Float | 曝光时间（μs） | 100 ~ 1000000 |
| `Gain` | Float | 模拟增益（dB） | 0 ~ 20 |
| `Gamma` | Float | Gamma 校正 | 0.1 ~ 4.0 |
| `AcquisitionFrameRate` | Float | 采集帧率（fps） | 1 ~ 相机最大帧率 |
| `TriggerMode` | Enum | 触发模式 | 0=Off, 1=On |
| `AcquisitionMode` | Enum | 采集模式 | 2=Continuous |
| `GevSCPSPacketSize` | Int | GigE 包大小 | 1500（默认） |
| `DeviceSerialNumber` | String | 设备序列号 | 只读 |
| `DeviceModelName` | String | 设备型号 | 只读 |

> `setParam()` 只支持 Float 类型参数。如需设置枚举或整数，可扩展 `setEnum()` / `setInt()` 接口。

---

### 8. 完整代码位置

| 文件 | 行数 | 说明 |
|------|------|------|
| [include/adapters/HikAdapter.h](../include/adapters/HikAdapter.h) | ~70 行 | 类声明、成员变量 |
| [src/adapters/HikAdapter.cpp](../src/adapters/HikAdapter.cpp) | ~300 行 | 全部实现 |
| [third_party/Hikvision/Windows/include/MvCameraControl.h](../third_party/Hikvision/Windows/include/MvCameraControl.h) | ~2700 行 | 海康 SDK 头文件（参考） |
| [third_party/Hikvision/Windows/include/CameraParams.h](../third_party/Hikvision/Windows/include/CameraParams.h) | ~1400 行 | 海康数据结构定义（参考） |

---

## 环境搭建

### 依赖清单

| 组件 | 安装方式 | 备注 |
|------|---------|------|
| CMake 4.3+ | cmake.org | |
| Python 3.14 | python.org | 必须 3.14，`_core.cp314-win_amd64.pyd` 只兼容 3.14 |
| Visual Studio 2026 | Build Tools | C++ 工作负载 |
| vcpkg | github.com/microsoft/vcpkg | 管理 OpenCV / spdlog / yaml-cpp |
| Hikvision MVS | 海康官网 | GigE 过滤驱动 + 运行时 DLL |
| pybind11 | `pip install pybind11` | |
| CUDA Toolkit | NVIDIA（可选） | |

### vcpkg 包安装

```bash
vcpkg install opencv4:x64-windows spdlog:x64-windows yaml-cpp:x64-windows
```

### 一次总安装

```bash
# Python 依赖
pip install pybind11 numpy opencv-python

# pycamera（可编辑模式）
cd d:\nnd\CameraSDK\python
pip install --no-deps -e .
```

---

## 构建与运行

### 构建

```bash
cd d:\nnd\CameraSDK

# 配置（首次或依赖变化后）
cmake -B build ^
  -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake ^
  -DCMAKE_BUILD_TYPE=Release

# 编译（日常开发）
cmake --build build --config Release
```

### 编译产物

```
build/Release/
├── CameraSDKCore.dll           # C++ 核心库
├── _core.cp314-win_amd64.pyd   # Python 扩展模块
├── single_frame.exe            # 单帧采集
├── multi_camera.exe            # 多相机采集
├── continuous_capture.exe      # 连续实时采集
└── *.dll                       # 自动拷贝的 MVS Runtime + 第三方 DLL
```

### 运行

```bash
cd d:\nnd\CameraSDK\build\Release

# C++ 示例
single_frame.exe              # 采集一帧，弹窗显示
continuous_capture.exe        # 实时画面，Esc 退出
multi_camera.exe              # 多相机（需要两台相机）

# Python 示例
python d:\nnd\CameraSDK\examples\python_demo.py

# API 测试（无相机模式）
cd d:\nnd\CameraSDK
test.bat
```

### 构建选项

| CMake Option | 默认值 | 说明 |
|-------------|--------|------|
| `ENABLE_PYTHON` | ON | Python 绑定 |
| `ENABLE_CUDA` | ON | GPU 加速（需要 CUDA） |
| `ENABLE_HIKVISION` | ON | 海康插件 |
| `ENABLE_BASLER` | OFF | Basler 插件 |
| `ENABLE_DAHUA` | OFF | Dahua 插件 |
| `ENABLE_TENSORRT` | OFF | TensorRT 推理 |

---

## Python API

```python
import pycamera

# 创建相机
cam = pycamera.create_camera("hik")

# 基本操作
cam.open()
cam.start()
cam.stop()
cam.close()

# 参数读写（GenICam）
cam.setParam("ExposureTime", 5000)
value = cam.getParam("ExposureTime")

# GPU
cam.enableGPU(True)

# 多相机管理
mgr = pycamera.CameraManager()
mgr.addCamera("cam0", cam)
mgr.startAll()
frame = mgr.popFrame("cam0", timeout_ms=100)
mgr.stopAll()
```

---

## 常见问题

### Q: `python` 命令还是 conda 的 3.13？

```bash
where python  # 查看优先级
# 若 conda 排第一：重启终端（conda auto_activate 已关闭）
```

### Q: `import pycamera` 报 DLL load failed？

确保 `build/Release/` 在 PATH 中，或 `python/pycamera/pycamera/__init__.py` 的 DLL 自动发现已生效。

### Q: `MV_CC_EnumDevices failed: 0x8000000C`？

MVS Runtime DLL 缺失。重新 `cmake --build`，CMake 会自动从 MVS 安装目录拷贝。

### Q: `MV_CC_OpenDevice failed: 0x80000203`？

**访问被拒绝** — 另一个程序（如 MVS 客户端）正独占相机。关掉 MVS 客户端再试。

### Q: 打开相机但不出图？

1. 检查触发模式：代码已将 `TriggerMode` 设为 OFF
2. 检查 IP 配置：确保相机和网卡在同一网段（通常 192.168.1.x）
3. GigE 包大小：在 MVS 客户端中将 `GevSCPSPacketSize` 设为 1500

### Q: `ModuleNotFoundError: No module named 'pycamera'`?

系统 Python 和项目 Python 版本不一致。确认 `python --version` 为 3.14.5。

---

## 变更记录

以下文档化所有对项目源码的修改（截至 2026-06-05）。

---

### 1. HikAdapter.h — 适配器头文件

**文件**: [include/adapters/HikAdapter.h](../include/adapters/HikAdapter.h)

**改动前**：

```cpp
// Mock 模式：只存储状态，不依赖任何 SDK
std::map<std::string, double> params_;   // 参数存储（纯内存）
// 无 SDK 句柄
// 无 SDK 初始化逻辑
```

**改动后**：

```cpp
#include "MvCameraControl.h"              // ★ 新增：引入海康 SDK 头文件

void *handle_;                            // ★ 新增：SDK 设备句柄
bool grabbing_;                           // ★ 新增：取流状态标记

// ★ 新增：静态 SDK 管理
static int  initSDK();                    //  引用计数 + MV_CC_Initialize
static void finalizeSDK();                //  引用计数 + MV_CC_Finalize

// ★ 新增：图像处理辅助
static int   pixelTypeToCvType(...);      //  像素格式映射
FrameBuffer::Ptr wrapFrame(...);          //  MV_FRAME_OUT → FrameBuffer
```

**变更理由**: Mock 模式不需要任何 SDK 依赖；真实模式需要存储设备句柄 `handle_`，管理 SDK 进程级生命周期，处理海康像素格式到 OpenCV 的转换。

---

### 2. HikAdapter.cpp — 适配器实现

**文件**: [src/adapters/HikAdapter.cpp](../src/adapters/HikAdapter.cpp)

**改动量**: ~130 行（mock） → ~300 行（真实 SDK），每个方法均重写。

**逐方法对比**：

#### 构造 / 析构

| | 改动前 | 改动后 |
|------|--------|--------|
| 构造 | `opened_(false), gpuEnabled_(false), running_(false)` | + 调用 `initSDK()`（引用计数，首个实例调 `MV_CC_Initialize()`） |
| 析构 | `close()` | + 调用 `finalizeSDK()`（引用计数，最后实例调 `MV_CC_Finalize()`） |

#### open()

```cpp
// 改动前
bool HikAdapter::open() {
    opened_ = true;                    // 仅设标志位
    return true;
}

// 改动后
bool HikAdapter::open() {
    MV_CC_DEVICE_INFO_LIST stDevList;
    MV_CC_EnumDevices(GIGE|USB3, &stDevList);   // ① 枚举设备
    MV_CC_CreateHandle(&handle_, ...);           // ② 创建句柄
    MV_CC_OpenDevice(handle_, Exclusive, 0);     // ③ 独占打开
    MV_CC_SetEnumValue(handle_, "AcquisitionMode", Continuous); // ④ 连续模式
    MV_CC_SetEnumValue(handle_, "TriggerMode", Off);            // ④ 关触发
    opened_ = true;
}
```

#### grabFrame()

```cpp
// 改动前
frame = std::make_shared<FrameBuffer>();
frame->frame = cv::Mat::zeros(1080, 1920, CV_8UC3);
cv::randu(frame->frame, ...);          // 随机噪声

// 改动后
if (!grabbing_) MV_CC_StartGrabbing(handle_);       // 单帧：自动启停
MV_CC_GetImageBuffer(handle_, &stFrame, timeout);   // 等待真实帧
frame = wrapFrame(&stFrame);                        // 包装 + Bayer→BGR
MV_CC_FreeImageBuffer(handle_, &stFrame);
if (!grabbing_) MV_CC_StopGrabbing(handle_);
```

#### setParam() / getParam()

```cpp
// 改动前
params_[name] = value;                 // 内存 map
return params_[name];

// 改动后
MV_CC_SetFloatValue(handle_, name.c_str(), value);  // 真实 SDK 调用
MV_CC_GetFloatValue(handle_, name.c_str(), &floatVal);
return floatVal.fCurValue;
```

#### start() / stop()

```cpp
// 改动前
running_ = true;
captureThread_ = std::thread(&HikAdapter::captureLoop, this);  // 总是启线程

// 改动后
MV_CC_StartGrabbing(handle_);          // 开 SDK 取流
if (callback_) {                       // ★ 仅回调模式下启线程
    captureThread_ = std::thread(&HikAdapter::captureLoop, this);
}
```

**变更理由**: start() 无条件启线程会与 CameraManager 的工作线程冲突（双线程抢 `MV_CC_GetImageBuffer`）。改为仅回调模式启线程，CameraManager 路径由管理器自行轮询。

#### 新增辅助函数

| 函数 | 作用 |
|------|------|
| `initSDK()` / `finalizeSDK()` | 原子引用计数，保证多实例下只初始化/反初始化一次 |
| `pixelTypeToCvType()` | 7 种海康像素格式 → OpenCV `CV_8UC1` / `CV_8UC3` |
| `wrapFrame()` | `MV_FRAME_OUT` 深拷贝 → `FrameBuffer`，Bayer 自动转 BGR |

---

### 3. CMakeLists.txt — MVS Runtime 自动部署

**文件**: [CMakeLists.txt](../CMakeLists.txt)

**改动前**：

```cmake
# 手动拷贝单个 DLL
set(HIK_DLL "${HIK_ROOT}/lib/win64/MvCameraControl.dll")
add_custom_command(TARGET ${EXAMPLE_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_if_different
    "${HIK_ROOT}/lib/win64/MvCameraControl.dll"
    $<TARGET_FILE_DIR:${EXAMPLE_NAME}>)
```

**改动后**：

```cmake
# 自动拷贝整个 MVS Runtime 目录（65 个 DLL）
set(MVS_RUNTIME_DIR "C:/Program Files (x86)/Common Files/MVS/Runtime/Win64_x64")
function(copy_mvs_runtime target)
    add_custom_command(TARGET ${target} POST_BUILD
        COMMAND ${CMAKE_COMMAND} -E copy_directory_if_different
        "${MVS_RUNTIME_DIR}"
        "$<TARGET_FILE_DIR:${target}>"
    )
endfunction()

# 挂载到所有目标
copy_mvs_runtime(CameraSDKCore)
copy_mvs_runtime(_core)
copy_mvs_runtime(${EXAMPLE_NAME})   # 每个示例
```

**变更理由**: 海康 SDK 主 DLL（`MvCameraControl.dll`）依赖 60+ 个子 DLL（传输层、图像处理、日志等），都在 MVS Runtime 目录下。手动拷贝容易遗漏，改为 CMake 自动全量拷贝，编译完成即可运行。

---

### 4. continuous_capture.cpp — 修复线程冲突

**文件**: [examples/continuous_capture.cpp](../examples/continuous_capture.cpp)

**改动前**：

```cpp
camera->start();         // 启动后台采集线程
while (true) {
    camera->grabFrame(frame);   // 主线程也调 GetImageBuffer → 双线程冲突！
    cv::imshow(...);
}
```

**改动后**：

```cpp
camera->start();         // 只开 SDK 取流，不启动线程（无回调）
while (true) {
    camera->grabFrame(frame);   // 唯一 GetImageBuffer 入口
    cv::imshow(...);
    if (cv::waitKey(1) == 27) break;
}
```

**变更理由**: 旧版 `start()` 总是启动采集线程，导致与主循环形成两个线程同时调用 `MV_CC_GetImageBuffer()`。新版 `start()` 仅在注册回调时启线程，此处不注册回调，由主循环统一取帧。

---

### 5. python_demo.py — Python 示例修复

**文件**: [examples/python_demo.py](../examples/python_demo.py)

**改动前**：

```python
import pycamera                     # 之前可能找不到模块
cam = pycamera.create_camera()      # 缺省参数 pybind11 未保留
```

**改动后**：

```python
import sys
sys.path.insert(0, r"d:\nnd\CameraSDK\python")        # 确保找到 pycamera 包

import pycamera
cam = pycamera.create_camera("hik")  # 显式传入类型字符串
```

**变更理由**: pybind11 未保留 C++ 默认参数值，需显式传参 `"hik"`；开发阶段未打 wheel 包时需 `sys.path` 辅助。

---

### 6. pycamera __init__.py — DLL 路径自动发现

**文件**: [python/pycamera/pycamera/__init__.py](../python/pycamera/pycamera/__init__.py)

**改动前**：

```python
from ._core import *
__version__ = "2.0.0"
```

**改动后**：

```python
# import _core 之前，自动扫描并注册 DLL 搜索路径
import os
from pathlib import Path

_dll_dirs = [
    Path(__file__).parent.resolve(),   # 包自身目录
    # + 环境变量 CAMERASDK_BUILD_DIR
    # + 相对路径 ../../build/{Release,Debug}
    # + 当前工作目录
]

for d in _dll_dirs:
    if d.is_dir():
        os.add_dll_directory(str(d))

from ._core import *
```

**变更理由**: Windows 上 `_core.pyd` 依赖 `CameraSDKCore.dll` → `opencv_core4.dll` 等。Python 3.8+ 不再从 `PATH` 搜索 DLL，必须通过 `os.add_dll_directory()` 显式注册。此改动让 `import pycamera` 自动完成路径发现，无需用户手动设置。

---

### 7. development.md — 本文档

**文件**: [docs/development.md](../docs/development.md)

**状态**: 新增，覆盖环境搭建、架构设计、API 详解、FAQ、变更记录。

---

### 汇总

| 文件 | 类型 | 行数变化 |
|------|------|---------|
| `include/adapters/HikAdapter.h` | 修改 | +15 |
| `src/adapters/HikAdapter.cpp` | 重写 | 130 → 300 |
| `CMakeLists.txt` | 修改 | +25 |
| `examples/continuous_capture.cpp` | 修改 | ±5 |
| `examples/python_demo.py` | 修改 | +4 |
| `python/pycamera/pycamera/__init__.py` | 修改 | 3 → 30 |
| `docs/development.md` | 新增 | +540 |

### 未修改的文件

| 层级 | 文件 |
|------|------|
| 接口层 | `ICamera.h`、`CameraFactory.h`、`CameraManager.h` |
| 工厂/管理器 | `CameraFactory.cpp`、`CameraManager.cpp` |
| 公共组件 | `FrameBuffer.h/.cpp`、`ThreadSafeQueue.h`、`Logger.h/.cpp`、`ConfigManager.h/.cpp` |
| 其他适配器 | `BaslerAdapter.h/.cpp`、`DahuaAdapter.h/.cpp` |
| 测试 | `test.py`、`test.bat` |
| 配置 | `config/cameras.yaml` |
| Python 绑定 | `src/python/pycamera.cpp` |
