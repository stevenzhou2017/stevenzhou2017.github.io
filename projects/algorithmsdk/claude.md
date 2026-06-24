# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build

### C++ SDK (Visual Studio / Windows)

```bash
mkdir build && cd build
cmake .. -DOpenCV_DIR=D:/opencv/build -Dpybind11_DIR=<pybind11_cmake_dir>
cmake --build . --config Release -j4
```

Key CMake options:

| Option | Default | Description |
|--------|---------|-------------|
| `BUILD_EXAMPLES` | ON | Build C++ demo executables |
| `BUILD_CALIBRATION` | ON | Calibration module (requires Eigen3, optionally PCL/MPI) |
| `BUILD_PYTHON` | ON | Build pybind11 Python extension |
| `ENABLE_ONNX` | ON | ONNX Runtime backend for YOLO inference (requires `D:/onnxruntime`) |
| `ENABLE_TENSORRT` | OFF | TensorRT backend for YOLO inference |

Dependencies: OpenCV (required), pybind11 (required for Python), Eigen3 (bundled in `third_party/`), spdlog (bundled), yaml-cpp (bundled). PCL and MPI are optional — features depending on them are disabled when not found.

### Python Package

```bash
cd python
pip install -e .
```

This runs CMake via `setup.py`, builds `algorithm_sdk_core.*.pyd`, and copies all DLLs into `python/industrial_sdk/`. The installed package is `industrial_sdk` — use it as:

```python
from industrial_sdk import AIToolkit, cv, MeasurementManager
```

### C++ Tests

The C++ tests in `tests/cpp/` are standalone source files (not integrated into CMake). They are built and run manually against the AIToolkit sub-library.

### Python Tests

```bash
cd python
python -m pytest ../tests/python/ -v
```

## Architecture

```
Python API (industrial_sdk/__init__.py)
  └── algorithm_sdk_core.*.pyd    ← pybind11 binding (bindings/algorithm_sdk_core.cpp)
        └── algorithm_vision.dll   ← C++ core library (core/src/)
              ├── CVToolkit        → algorithm_vision_cvtoolkit.dll
              ├── Measurement      → algorithm_vision_measurement.dll
              ├── Calibration      → algorithm_vision_calibration.dll
              ├── 3DToolkit        → algorithm_vision_3dtoolkit.dll
              ├── AIToolkit        → algorithm_vision_aitoolkit.dll
              └── VLMToolkit       (included in algorithm_vision.dll)
        Built on: OpenCV, Eigen3, ONNX Runtime, spdlog, yaml-cpp
```

### Library layout: two tiers

The build produces **one all-in-one library** (`algorithm_vision`) plus **independent sub-libraries** per module:

- **`algorithm_vision`** — the full SDK containing all modules. Used by the Python binding.
- **`algorithm_vision_cvtoolkit`** — CVToolkit only (image enhancement, edge detection, contours, blobs, template matching, geometry).
- **`algorithm_vision_measurement`** — Measurement only (distance, diameter, radius, angle, area, height, volume, pose, GD&T, profile).
- **`algorithm_vision_calibration`** — Calibration only (intrinsic, extrinsic, stereo, hand-eye, ICP refinement if PCL available).
- **`algorithm_vision_3dtoolkit`** — 3D only (point cloud, depth map, structured light, ICP registration).
- **`algorithm_vision_aitoolkit`** — AI only (YOLO inference engine, ONNX/TensorRT adapters, ByteTrack).

C++ demos in `examples/` each link against their specific sub-library, not the full `algorithm_vision`.

### Key patterns

- **Singleton toolkits**: `AIToolkit`, `CalibrationToolkit`, and `MeasurementManager` use the singleton pattern. In Python, access via `.instance()`.
- **VisionFrame**: The central data type that wraps `cv::Mat` plus metadata (camera_id, timestamp, detections, segments). Flows through the entire pipeline.
- **Binding is pybind11-only**: `bindings/algorithm_sdk_core.cpp` is the single binding file. It includes custom type casters for `cv::Mat` ↔ NumPy, `cv::Size`/`cv::Point` ↔ Python tuples. No separate wrapper layer — the binding directly exposes C++ classes as Python classes.
- **GIL management**: C++ inference methods release the Python GIL (`py::gil_scoped_release`) before long-running operations and re-acquire before returning.

### AIToolkit / YOLO inference

The AIToolkit uses a plugin architecture with `IInferenceEngine` as the interface:

- `EngineFactory` — creates the right engine based on backend name ("onnx", "tensorrt")
- `InferenceManager` — manages multiple named engine instances
- `adapters/ONNXAdapter` — ONNX Runtime backend
- `adapters/TensorRTAdapter` — TensorRT backend (optional)
- `BYTETracker` — Official ByteTrack implementation supporting GMC (Global Motion Compensation)
- Tasks: detect, segment, classify, pose, obb

Model configuration is at `config/models.yaml`. Inference settings (backend, confidence threshold, IoU, image size, device) are configured there.

### CVToolkit

Pure OpenCV-based image processing utilities. All classes expose static methods — no state, no instantiation needed. Modules: ImageEnhance, EdgeDetector, ContourAnalyzer, BlobAnalyzer, TemplateMatcher, GeometryUtils.

### Measurement

Factory-based architecture: `IMeasurement` interface → concrete measurement classes → `MeasurementManager` runs them against an image. The `MeasurementResult` struct carries `success`, `name`, `value`, `unit`, `confidence`.

### Calibration

Supports intrinsic (chessboard/circle grid/AprilTag), extrinsic (PnP), stereo, and hand-eye calibration. `CalibrationToolkit` is the singleton entry point that owns sub-calibrators. ICP refinement requires PCL.

### 3DToolkit

Point cloud generation from depth maps, structured light processing, ICP registration (OpenCV fallback + PCL-accelerated path). Key classes: `PointCloud`, `DepthMap`, `StructLightProcessor`, `ICPRegistration`, `Toolkit3D`.
