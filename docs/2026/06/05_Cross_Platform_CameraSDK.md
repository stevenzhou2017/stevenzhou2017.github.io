# **跨平台工业相机 SDK 框架设计方案**

author： 周均扬

date： 2026.06.06

---


整理一个**跨平台工业相机 SDK 框架设计方案**，针对通用工业相机，支持 Linux/Windows 自动调用相应库，并附带示例代码和说明。


## 1️. 整体目标

* **跨平台**：Linux (.so) / Windows (.dll) 自动调用。
* **抽象封装**：上层应用无需关心底层 SDK 类型。
* **支持多种模式**：单帧采集 / 连续采集。
* **示例代码可编译运行**：提供完整 C++ + Python/可扩展接口。
* **SDK 加速**：链接本地已下载的工业相机 SDK 库，保证性能。
* **团队可用文档**：便于交流、汇报。

---

## 2. 架构设计

### 2.1 模块划分

```
CrossPlatformCameraSDK/
│
├─ include/
│   ├─ ICamera.h               # 相机接口抽象
│   ├─ CameraFactory.h         # 相机工厂
│
├─ src/
│   ├─ CameraLinux.cpp         # Linux 平台实现
│   ├─ CameraWindows.cpp       # Windows 平台实现
│   ├─ CameraFactory.cpp       # 工厂实现
│
├─ examples/
│   ├─ single_frame.cpp        # 单帧采集示例
│   ├─ continuous_capture.cpp  # 连续采集示例
│
├─ CMakeLists.txt              # 跨平台编译配置
├─ README.md
└─ third_party/
    ├─ LinuxLibs/              # Linux so 文件
    └─ WindowsLibs/            # Windows dll 文件
```

---

### 2.2 核心设计理念

1. **接口抽象化**
   所有平台共享一个统一的 `ICamera` 接口，上层调用不区分平台。

   ```cpp
   class ICamera {
   public:
       virtual ~ICamera() {}
       virtual bool open() = 0;
       virtual void close() = 0;
       virtual bool grabFrame(cv::Mat &frame) = 0;
       virtual bool startContinuous() = 0;
       virtual void stopContinuous() = 0;
   };
   ```

2. **平台实现分离**

   * Linux: 调用 `.so`
   * Windows: 调用 `.dll`

   ```cpp
   #ifdef _WIN32
   #include "CameraWindows.h"
   using PlatformCamera = CameraWindows;
   #else
   #include "CameraLinux.h"
   using PlatformCamera = CameraLinux;
   #endif
   ```

3. **工厂模式**
   根据操作系统创建相机实例：

   ```cpp
   class CameraFactory {
   public:
       static std::unique_ptr<ICamera> createCamera() {
           return std::make_unique<PlatformCamera>();
       }
   };
   ```


### 2.3 编译与链接策略

* **Linux**

  ```bash
  g++ -std=c++17 -Iinclude -Lthird_party/LinuxLibs -lXXXXXXSDK -o test examples/single_frame.cpp
  ```

* **Windows (MSVC)**

  ```bat
  cl /EHsc /Iinclude examples\single_frame.cpp /link /LIBPATH:third_party\WindowsLibs XXXXXXSDK.lib
  ```

* **CMakeLists.txt**（跨平台示例）

```cmake
cmake_minimum_required(VERSION 3.10)
project(CrossPlatformCameraSDK)

set(CMAKE_CXX_STANDARD 17)

include_directories(include)
link_directories(${CMAKE_SOURCE_DIR}/third_party/${CMAKE_SYSTEM_NAME}Libs)

file(GLOB SRC src/*.cpp)

add_library(CrossCameraSDK ${SRC})

if(WIN32)
    target_link_libraries(CrossCameraSDK XXXXXXSDK.lib)
else()
    target_link_libraries(CrossCameraSDK XXXXXXDK.so pthread)
endif()

add_executable(single_frame examples/single_frame.cpp)
target_link_libraries(single_frame CrossCameraSDK)
```


### 2.4 示例代码

**单帧采集 (C++)**

```cpp
#include "CameraFactory.h"
#include <opencv2/opencv.hpp>
#include <iostream>

int main() {
    auto camera = CameraFactory::createCamera();
    if(!camera->open()) {
        std::cerr << "Failed to open camera" << std::endl;
        return -1;
    }

    cv::Mat frame;
    if(camera->grabFrame(frame)) {
        cv::imshow("Single Frame", frame);
        cv::waitKey(0);
    }

    camera->close();
    return 0;
}
```

**连续采集 (C++)**

```cpp
#include "CameraFactory.h"
#include <opencv2/opencv.hpp>
#include <thread>

int main() {
    auto camera = CameraFactory::createCamera();
    camera->open();
    camera->startContinuous();

    cv::Mat frame;
    while(true) {
        if(camera->grabFrame(frame)) {
            cv::imshow("Continuous Capture", frame);
        }
        if(cv::waitKey(1) == 27) break; // ESC 退出
    }

    camera->stopContinuous();
    camera->close();
}
```


### 2.5 跨平台注意点

| 项目     | Linux             | Windows                         |
| ------ | ----------------- | ------------------------------- |
| SDK 文件 | .so               | .dll                            |
| 动态加载   | `dlopen`, `dlsym` | `LoadLibrary`, `GetProcAddress` |
| 编译依赖   | pthread, stdc++17 | MSVC runtime                    |
| 字符串编码  | UTF-8             | UTF-16/ANSI                     |
| 异常处理   | try/catch + 错误码   | try/catch + 错误码                 |


### 2.6 扩展接口

* Python 封装（可选）：使用 **pybind11** 封装 `ICamera` 类，直接生成 Python 模块。
* 高级功能：

  * ROI 设置
  * 白平衡/增益/曝光控制
  * 触发模式支持（软触发/硬触发）
  * 多相机并行采集

---

### 3. 沟通与汇报要点

1. **优势**：

   * 跨平台兼容
   * 上层调用简单统一
   * 支持单帧和连续采集模式
   * 可以直接链接本地 SDK，加速开发
2. **可视化架构图**：

```
+-----------------------+
|      上层应用         |
+-----------------------+
           |
           v
+-----------------------+
|     ICamera 接口       |
+-----------------------+
           |
+------------------+------------------+
|   Linux实现      |   Windows实现    |
| CameraLinux.cpp  | CameraWindows.cpp|
+------------------+------------------+
           |
           v
+--------------  ---------+
|   工业相机SDK (.so/.dll) |
+----------------  -------+
           |
           v
    硬件工业相机
```

---

