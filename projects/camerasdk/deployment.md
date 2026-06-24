---
title: 部署说明
---

# 部署说明

> CameraSDK 支持源码编译与交付物部署两种方式。

## 环境要求

| 项目 | Windows | Linux |
|------|---------|-------|
| 操作系统 | Windows 10/11 (64-bit) | Ubuntu 24.04 LTS |
| 编译器 | Visual Studio 2026 (v143) | GCC 13+ |
| CMake | 3.22+ | 3.22+ |
| Python | 3.14 | 3.12+ |
| OpenCV | `D:/opencv` | `apt install libopencv-dev` |

## 依赖安装

```bash
# vcpkg 包
vcpkg install opencv4:x64-windows spdlog:x64-windows yaml-cpp:x64-windows

# Python 依赖
pip install pybind11 numpy opencv-python
```

## 编译构建

```bash
cd d:\nnd\CameraSDK

# 配置
cmake -B build ^
  -DCMAKE_TOOLCHAIN_FILE=C:/vcpkg/scripts/buildsystems/vcpkg.cmake ^
  -DCMAKE_BUILD_TYPE=Release

# 编译
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
└── *.dll                       # MVS Runtime + 第三方 DLL
```

## 运行

```bash
cd build\Release

# C++ 示例
single_frame.exe              # 采集一帧
continuous_capture.exe        # 实时画面，Esc 退出
multi_camera.exe              # 多相机（需要两台相机）

# Python
python examples\python_demo.py

# API 测试（无相机模式）
test.bat
```

## CMake 选项

| 选项 | 默认 | 说明 |
|------|------|------|
| `ENABLE_PYTHON` | ON | Python 绑定 |
| `ENABLE_CUDA` | ON | GPU 加速（需要 CUDA） |
| `ENABLE_HIKVISION` | ON | 海康插件 |
| `ENABLE_BASLER` | OFF | Basler 插件 |
| `ENABLE_DAHUA` | OFF | 大华插件 |

> [!NOTE]
> 完整开发指南与 API 详解见 [开发文档](/development.md)。
