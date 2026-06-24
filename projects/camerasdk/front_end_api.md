# CameraSDK 联调接口文档

## 1. 三方架构

```
┌──────────────┐     ┌────────────────────┐     ┌─────────────────────┐
│   前端        │     │   Demo 后端          │     │  CameraSDK（我们）    │
│ （图形化编程） │     │ connectivity_test.py │     │                      │
│              │     │                      │     │  pycamera Python 包   │
│ 写 JSON ─────┼────→│ 解析 action          │────→│ cam.open()           │
│ 读 JSON ←────┼─────│ 写 status            │←────│ cam.setParam()       │
│              │     │                      │     │ cam.getParam()       │
│ 不管相机      │     │ 调用 SDK API          │     │ cam.start()          │
│              │     │                      │     │ cam.grabFrame()      │
│              │     │ （后端团队负责）        │     │ cam.close()          │
│              │     │                      │     │                      │
│              │     │                      │     │ （SDK 团队负责）       │
└──────────────┘     └────────────────────┘     └─────────────────────┘
```

- 我们（SDK 团队）负责 `pycamera` Python 包
- 后端团队负责桥接层（当前 Demo：JSON 文件 IPC，后续 TCP/IP）
- 前端团队只管发指令读状态

## 2. SDK 交付物（我们团队）

### 2.1 交付文件清单

| 文件 | 说明 |
|------|------|
| `_core.cp314-win_amd64.pyd` | pybind11 编译的 Python 模块 |
| `CameraSDKCore.dll` | CameraSDK C++ 核心库 |
| `CameraSDKCore.lib` | 链接库（C++ 开发用） |

运行依赖：MVS Runtime（海康 SDK 运行时，系统已安装于 `C:\Program Files (x86)\Common Files\MVS\Runtime\Win64_x64`）。

### 2.2 模块级函数

导入方式：`import pycamera`

#### pycamera.create_camera(type)

创建相机实例。

```python
cam = pycamera.create_camera("hik")   # "hik" | "basler" | "dahua"
```

| 参数 | 类型 | 说明 |
|------|------|------|
| type | str | `"hik"`=海康, `"basler"`=Basler(桩), `"dahua"`=大华(桩) |
| **返回** | HikAdapter | 相机对象 |

#### pycamera.create_camera_by_index(type, index)

创建并按序号打开相机。一步完成 create + openByIndex。

```python
cam = pycamera.create_camera_by_index("hik", 0)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| type | str | `"hik"` |
| index | int | 设备序号，0-based |
| **返回** | HikAdapter 或 None | 失败返回 None |

#### pycamera.create_camera_by_serial(type, serial)

创建并按序列号打开。

```python
cam = pycamera.create_camera_by_serial("hik", "DA7171596")
```

| 参数 | 类型 | 说明 |
|------|------|------|
| type | str | `"hik"` |
| serial | str | 相机序列号 |
| **返回** | HikAdapter 或 None | 失败返回 None |

#### pycamera.create_camera_by_ip(type, ip)

创建并按 IP 打开（仅 GigE 相机）。

```python
cam = pycamera.create_camera_by_ip("hik", "169.254.232.111")
```

| 参数 | 类型 | 说明 |
|------|------|------|
| type | str | `"hik"` |
| ip | str | 相机 IP 地址 |
| **返回** | HikAdapter 或 None | 失败返回 None |

#### pycamera.list_devices(tlayer_type)

枚举所有连接的相机。

```python
devices = pycamera.list_devices(5)   # 5 = GigE + USB3
for d in devices:
    print(d.model_name, d.serial_number, d.ip_address)
```

| 参数 | 类型 | 说明 |
|------|------|------|
| tlayer_type | int | `1`=仅 GigE, `4`=仅 USB3, `5`=全部（默认） |
| **返回** | list[DeviceInfo] | 设备信息列表 |

#### pycamera.list_gige_devices()

枚举 GigE 相机。等价于 `list_devices(1)`。

#### pycamera.list_usb_devices()

枚举 USB3 相机。等价于 `list_devices(4)`。

---

### 2.3 Camera 对象方法

#### 连接

| 方法 | 返回 | 说明 |
|------|------|------|
| `cam.open()` | bool | 自动枚举，连接第一个设备 |
| `cam.openByIndex(n)` | bool | 按序号 n 连接（0-based） |
| `cam.openBySerial("xxx")` | bool | 按序列号连接 |
| `cam.openByIP("x.x.x.x")` | bool | 按 IP 连接（仅 GigE） |
| `cam.close()` | — | 停止采集并关闭相机 |
| `cam.isOpened()` | bool | 相机是否已打开 |

```python
cam = pycamera.create_camera("hik")
if cam.open():
    print("相机已连接")
```

#### 采集控制

| 方法 | 返回 | 说明 |
|------|------|------|
| `cam.start()` | bool | 开始连续取流 |
| `cam.stop()` | — | 停止取流 |
| `cam.grabFrame()` | FrameBuffer 或 None | 取一帧，超时返回 None |

```python
cam.start()
while True:
    fb = cam.grabFrame()
    if fb is not None:
        img = fb.numpy()          # 转为 numpy 数组（零拷贝）
        cv2.imshow("preview", img)
    if cv2.waitKey(1) == 27:
        break
cam.stop()
```

#### 参数读写

| 方法 | 返回 | 说明 |
|------|------|------|
| `cam.setParam(name, value)` | bool | 写入 Float 型 GenICam 参数 |
| `cam.getParam(name)` | float | 读取 Float 型 GenICam 参数 |

```python
cam.setParam("ExposureTime", 30000.0)   # 设曝光 30ms
cam.setParam("Gain", 5.0)               # 设增益 5dB

exp  = cam.getParam("ExposureTime")     # → 30000.0
gain = cam.getParam("Gain")             # → 5.02（硬件实际值）
```

#### 设备信息

```python
di = cam.getDeviceInfo()
```

**DeviceInfo 属性**：

| 属性 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `model_name` | str | 相机型号 | `"MV-CS020-10GC"` |
| `serial_number` | str | 序列号 | `"DA7171596"` |
| `manufacturer` | str | 制造商 | `"Hikrobot"` |
| `device_version` | str | 固件版本 | `"V1.0.0"` |
| `user_defined_name` | str | 用户自定义名 | `"Camera1"` |
| `tlayer_type` | int | 传输层类型 | `1`=GigE, `4`=USB3 |
| `ip_address` | str | IP 地址（GigE） | `"169.254.232.111"` |
| `mac_address` | str | MAC 地址 | `"34:BD:20:6C:6F:E7"` |
| `subnet_mask` | str | 子网掩码（GigE） | `"255.255.0.0"` |
| `default_gateway` | str | 默认网关（GigE） | `"0.0.0.0"` |

#### 其他

| 方法 | 说明 |
|------|------|
| `cam.enableGPU(bool)` | 启用/禁用 GPU 加速 |
| `cam.setFrameCallback(fn)` | 注册帧回调 `fn(FrameBuffer)` |

---

### 2.4 FrameBuffer 对象

`cam.grabFrame()` 返回此类型。

| 属性 | 类型 | 说明 |
|------|------|------|
| `frame_id` | int | 帧序号 |
| `timestamp` | int | 时间戳 (ns) |
| `camera_id` | int | 相机序号 |
| `width` | int | 图像宽度 (px) |
| `height` | int | 图像高度 (px) |
| `numpy()` | ndarray | 零拷贝转为 numpy 数组（用于 OpenCV 显示/处理） |

```python
fb = cam.grabFrame()
if fb is not None:
    print(f"Frame #{fb.frame_id}: {fb.width}x{fb.height}")
    img = fb.numpy()           # numpy.ndarray, shape=(H,W,3) 或 (H,W)
    cv2.imwrite("capture.jpg", img)
```

---

### 2.5 相机参数速查表

参数名与 GenICam 标准一致，直接作为 `setParam` / `getParam` 的第一个参数。

**曝光 / 增益**

| 参数 | 类型 | 范围 | 说明 |
|------|------|------|------|
| `ExposureTime` | float | 100 ~ 1,000,000 | 曝光时间 (μs)，越大画面越亮 |
| `ExposureAuto` | float | 0/1/2 | 自动曝光：0=关, 1=单次, 2=连续 |
| `Gain` | float | 0 ~ 20 | 模拟增益 (dB)，越大越亮但噪点增加 |
| `GainAuto` | float | 0/1/2 | 自动增益 |

```python
cam.setParam("ExposureTime", 20000)   # 20ms 曝光
cam.setParam("Gain", 10)              # 10dB 增益
```

**帧率 / 图像**

| 参数 | 类型 | 范围 | 说明 |
|------|------|------|------|
| `AcquisitionFrameRate` | float | 1 ~ 相机最大值 | 采集帧率 (fps) |
| `Gamma` | float | 0.1 ~ 4.0 | Gamma 校正，1.0=线性 |

```python
cam.setParam("AcquisitionFrameRate", 20)   # 20fps
cam.setParam("Gamma", 0.8)                 # 提亮暗部
```

**白平衡**

| 参数 | 类型 | 范围 | 说明 |
|------|------|------|------|
| `BalanceWhiteAuto` | float | 0/1/2 | 自动白平衡：0=关, 1=单次, 2=连续 |
| `BalanceRatioRed` | float | 0 ~ 255 | 红通道增益 |
| `BalanceRatioBlue` | float | 0 ~ 255 | 蓝通道增益 |

```python
cam.setParam("BalanceWhiteAuto", 2)   # 连续自动白平衡
```

**触发**

| 参数 | 类型 | 范围 | 说明 |
|------|------|------|------|
| `TriggerMode` | float | 0/1 | 0=连续采集, 1=触发模式 |

```python
cam.setParam("TriggerMode", 0)   # 连续采集（默认）
```

> 以上为常用参数。完整列表见海康 SDK 开发指南 CHM（`third_party/Hikvision/Windows/doc/`）。`setParam` / `getParam` 底层调用 `MV_CC_SetFloatValue` / `MV_CC_GetFloatValue`，任何 Float 型 GenICam 参数均可使用。

## 3. Demo 后端（参考实现）

`examples/connectivity_test.py` 是一个 Demo，演示如何基于 SDK 实现 JSON 文件 IPC。后端团队可以参考或替换。

### 3.1 Demo 做了什么

```
启动 → idle 状态
  ↓
轮询 config/connectivity_params.json （0.5s 间隔）
  ↓ 检测到变化
解析 action → 调用 pycamera API
  ↓
写回 config/connectivity_status.json
```

### 3.2 Demo 支持的操作（6 个 action）

| action | 调用的 SDK API | 效果 |
|--------|---------------|------|
| `"enumerate"` | `pycamera.list_devices()` | 枚举设备 |
| `"open"` | `create_camera → open → setParam → start` | 打开并开始采集 |
| `"close"` | `stop → close` | 停止采集并关闭 |
| `"stop"` | `stop` | 仅停止采集 |
| `"start"` | `start` | 恢复采集 |
| `"set_params"` | `setParam` | 只更新参数 |

## 4. 前端接口（JSON 文件协议）

### 4.1 输入：connectivity_params.json（前端写）

```json
{
    "action": "open",
    "connect_method": "auto",
    "ExposureTime": 20000.0,
    "Gain": 10.0
}
```

- `action`：指令名（必填）
- `connect_method`：`"auto"` / `"index"` / `"serial"` / `"ip"`（默认 auto）
- 其余所有 key 透传为相机参数

### 4.2 输出：connectivity_status.json（前端读）

```json
{
    "status": "running",
    "device": {
        "model": "MV-CS020-10GC",
        "serial": "DA7171596",
        "ip": "169.254.232.111"
    },
    "current_params": {
        "ExposureTime": 20000.0,
        "Gain": 10.02
    },
    "devices": [],
    "error": "",
    "timestamp": 1781162843.716
}
```

| 字段 | 说明 |
|------|------|
| `status` | `"idle"` / `"opened"` / `"running"` / `"error"` |
| `device` | 当前相机信息，未打开时为 null |
| `current_params` | 用 `getParam()` 从硬件读回的实际参数值 |
| `devices` | enumerate 时填充的设备列表 |
| `error` | 错误信息，成功时为空 |

### 4.3 状态机

```
idle ──open──→ running
  ↑              ↓ stop
  │           opened
  │              ↓ close
  └──────────────┘
```

### 4.4 典型流程

```
① 枚举 → {"action": "enumerate"} → 读 devices

② 打开 → {"action": "open", "ExposureTime": 20000, "Gain": 10} → status: "running"

③ 调参 → {"action": "set_params", "ExposureTime": 50000} → current_params 更新

④ 关闭 → {"action": "close"} → status: "idle"
```

## 5. 后续 TCP/IP 方案

Demo 的文件 IPC 仅用于联通验证。升级 TCP/IP 时：

- SDK（我们）：**API 不变**
- 后端：改用 socket 收发 JSON，复用 `open_camera()` / `execute_action()` / `refresh_params()` 等函数
- 前端：改连 socket，协议不变
