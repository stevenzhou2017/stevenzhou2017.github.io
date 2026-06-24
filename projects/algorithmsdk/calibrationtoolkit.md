---
title: Calibration 模块
---

# Calibration — 标定

> 完整的相机标定工具链：内参、外参、立体、手眼标定 + ICP 精配准。

## 类一览

| 类 | 功能 | 说明 |
|----|------|------|
| `IntrinsicCalibrator` | 内参标定 | 棋盘格 / 圆格 / AprilTag |
| `ExtrinsicCalibrator` | 外参标定 | PnP 求解 |
| `StereoCalibrator` | 双目标定 | R, T, 基础矩阵 |
| `HandEyeCalibrator` | 手眼标定 | Tsai-Lenz / Daniilidis / LM |
| `ICPRefiner` | ICP 精配准 | PCL 加速 + OpenCV 回退 |
| `CalibrationToolkit` | 单例入口 | 统一调度 |

## 标定板类型

| 类型 | 说明 |
|------|------|
| `Chessboard` | 棋盘格（默认） |
| `CircleGrid` | 圆点网格 |
| `AprilTag` | AprilTag 标记板 |

## 手眼标定模式

| 模式 | 说明 |
|------|------|
| `EYE_TO_HAND` | 眼在手外 |
| `EYE_IN_HAND` | 眼在手上 |

## 目录结构

```
include/IndustrialVisionSDK/Calibration/
├── CalibrationTypes.h
├── CalibrationResult.h
├── CalibrationBoard.h
├── CalibrationToolkit.h
├── IntrinsicCalibrator.h
├── ExtrinsicCalibrator.h
├── StereoCalibrator.h
├── HandEyeCalibrator.h
└── ICPRefiner.h
```

## 示例

```python
from industrial_sdk import (
    CalibrationToolkit, HandEyeCalibrator,
    IntrinsicCalibrator, BoardConfig, BoardType
)

# 内参标定
calib = IntrinsicCalibrator()
board = BoardConfig()
board.type = BoardType.Chessboard
board.rows, board.cols = 9, 6
board.gridSize = 25.0
result = calib.calibrate(image_points, image_size, board)
print(f"重投影误差: {result['reprojectionError']:.4f} px")

# 手眼标定
he = HandEyeCalibrator()
he.addRobotPose(R_mat, t_vec)
he.addCameraPose(R_mat, t_vec)
T = he.calibrate()
```

> [!NOTE]
> 详细文档见 [SDK 交付手册](/交付文档.md#43-calibration-标定)。
