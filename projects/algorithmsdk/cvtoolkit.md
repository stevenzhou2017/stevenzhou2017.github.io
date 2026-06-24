---
title: CVToolkit 模块
---

# CVToolkit — 传统视觉

> 基于 OpenCV 封装的图像处理工具集，全部为静态方法类，无状态无实例化。

## 类一览

| 类 | 功能 | 核心方法 |
|----|------|---------|
| `ImageEnhance` | 图像增强 | 直方图均衡化、伽马校正、锐化、亮度/对比度调整 |
| `EdgeDetector` | 边缘检测 | Canny、Sobel、Laplacian，自适应阈值 |
| `ContourAnalyzer` | 轮廓分析 | 查找轮廓、面积/周长/矩、多边形逼近、凸包 |
| `BlobAnalyzer` | 斑点检测 | 基于面积/圆度/惯性比/凸度的多条件过滤 |
| `TemplateMatcher` | 模板匹配 | 多尺度匹配、旋转不变匹配、NCC/CCOEFF |
| `GeometryUtils` | 几何计算 | 点线距离、角度计算、仿射/透视变换 |

## 目录结构

```
include/IndustrialVisionSDK/
├── CVToolkit.h
├── ImageEnhance.h
├── ImageFilter.h
├── EdgeDetector.h
├── ContourAnalyzer.h
├── BlobAnalyzer.h
├── TemplateMatcher.h
├── GeometryUtils.h
└── VisionTypes.h
```

## 示例

```python
from industrial_sdk import cv

# 边缘检测
edges = cv.EdgeDetector.canny(gray, 50, 150)

# 轮廓分析
contours = cv.ContourAnalyzer.find_contours(edges)

# 几何工具
d = cv.GeometryUtils.distance(0, 0, 100, 0)
```

> [!NOTE]
> 详细文档见 [SDK 交付手册](/交付文档.md#41-cvtoolkit-传统视觉)。
