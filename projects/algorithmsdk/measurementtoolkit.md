---
title: Measurement 模块
---

# Measurement — 工业测量

> 工厂模式架构，`MeasurementManager` 统一管理各类测量操作。

## 测量类型

| 类 | 测量内容 | 单位 |
|----|---------|------|
| `DistanceMeasurement` | 点到点 / 线到线距离 | mm / px |
| `DiameterMeasurement` | 圆孔 / 圆柱直径 | mm |
| `RadiusMeasurement` | 圆角 / 圆弧半径 | mm |
| `AngleMeasurement` | 两线夹角 | 度 (°) |
| `AreaMeasurement` | 轮廓面积 | mm² / px² |
| `HeightMeasurement` | 基于标定的高度差 | mm |
| `VolumeMeasurement` | 基于标定的体积 | mm³ |
| `PoseMeasurement` | 目标 6D 位姿 | mm + 度 |
| `GDTMeasurement` | 平面度、平行度、垂直度、位置度 | mm |
| `ProfileMeasurement` | 轮廓度偏差分析 | mm |

## 数据结构

```
MeasurementResult → { success, name, value, unit, confidence }
```

## 示例

```python
from industrial_sdk import MeasurementManager, DistanceMeasurement

mgr = MeasurementManager()
dist = DistanceMeasurement((100, 200), (300, 400), 0.05)
mgr.add(dist)
results = mgr.run(image)
for r in results:
    print(f"{r.name}: {r.value:.3f} {r.unit}")
```

> [!NOTE]
> 详细文档见 [SDK 交付手册](/交付文档.md#42-measurement-工业测量)。
