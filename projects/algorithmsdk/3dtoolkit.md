---
title: 3DToolkit 模块
---

# 3DToolkit — 3D 视觉

> 点云生成、深度图处理、结构光重建、ICP 配准。

## 类一览

| 类 | 功能 | 核心方法 |
|----|------|---------|
| `PointCloud` | 点云处理 | 生成、滤波（体素/统计/半径）、下采样、法线估计 |
| `DepthMap` | 深度图 | 深度图转点云、深度值滤波、孔洞填充 |
| `StructLightProcessor` | 结构光 | Gray Code 编解码、相位展开、重建 |
| `ICPRegistration` | ICP 配准 | 点对点 / 点对面 ICP（OpenCV + PCL 双路径） |

## 目录结构

```
AlgorithmSDK/
└── 3DToolkit/
    ├── include/IndustrialVisionSDK/
    │   └── 3DToolkit.h
    ├── src/
    │   └── 3DToolkit.cpp
    └── example/
        └── 3DToolkit_demo.cpp
```

## 示例

```python
from industrial_sdk import Toolkit3D

# 点云配准
aligned = toolkit3d.alignPointClouds(source_cloud, target_cloud)
```

> [!NOTE]
> 详细文档见 [SDK 交付手册](/交付文档.md#44-3dtoolkit-3d视觉)。
