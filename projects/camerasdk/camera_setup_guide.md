# CameraSDK 相机信息与连接配置指南

> 最后更新: 2026-06-10  
> 适用版本: CameraSDK v2.0.0 + 海康 MVS SDK

---

## 1. 当前已连接相机信息

执行 `python test.py --scan` 扫描到的相机：

| 项目 | 值 |
|------|-----|
| **型号 (Model)** | MV-CS020-10GC |
| **序列号 (Serial)** | DA7171596 |
| **传输层类型** | GigE Vision (千兆以太网) |
| **固件版本** | V4.0.12 240528 1284824 |
| **MAC 地址** | 34:BD:20:6C:6F:E7 |
| **IP 地址** | 169.254.232.111 |
| **子网掩码** | 255.255.0.0 |
| **默认网关** | 0.0.0.0（未设置） |
| **主机侧网卡 IP** | 169.254.136.22 |
| **设备接口版本** | v2.0 |
| **分辨率** | 1624 × 1240 像素 |
| **像素格式** | BayerRG8（彩色） |

---

## 2. GigE 相机正常运行的必备条件

### 2.1 硬件连接

```
┌─────────────┐         CAT5e/6 网线          ┌──────────────┐
│   相机       │ ◄──────────────────────────► │   主机网卡     │
│  (GigE)     │                               │  (千兆网口)    │
└─────────────┘                               └──────┬───────┘
                                                     │
                                               ┌─────┴──────┐
                                               │  交换机/直连 │
                                               └────────────┘
```

- 使用 **CAT5e 或 CAT6** 以上规格的网线
- 建议相机直连主机，或使用千兆交换机
- 确保网口指示灯正常（绿灯常亮=链路建立，黄灯闪烁=数据传输）

### 2.2 IP 地址配置

**核心原则：相机 IP 与主机网卡 IP 必须在同一网段。**

当前配置（链路本地地址，自动获取）：

| 设备 | IP 地址 | 子网掩码 |
|------|---------|---------|
| 相机 | 169.254.232.111 | 255.255.0.0 |
| 主机网卡 | 169.254.136.22 | 255.255.0.0 |

> `169.254.x.x` 是链路本地地址（APIPA），当相机设为 DHCP 但没有 DHCP 服务器时自动分配。此地址段可直接使用，但建议在生产环境中配置固定 IP。

**固定 IP 配置方法**（使用海康 IP Configurator 工具）：

```bash
# 工具位置（需要 MVS 完整安装）
C:\Program Files (x86)\MVS\Applications\Win64\Ip_Configurator.exe
```

操作步骤：
1. 打开 IP Configurator，搜索设备
2. 选中目标相机
3. 关闭 DHCP，设置固定 IP（如 `192.168.1.100`）
4. 配置主机网卡为同网段（如 `192.168.1.10`）
5. 子网掩码设为 `255.255.255.0`
6. 点击"应用"保存设置

**也可以用 SDK 代码强制设置 IP**（高级用法）：
```python
# 通过 GenICam 参数强制修改相机 IP（需先在链路本地地址打开设备）
cam = create_camera_by_ip("hik", "169.254.232.111")
cam.setParam("GevCurrentIPAddress", 0xC0A80164)  # 192.168.1.100 的整数表示
cam.setParam("GevCurrentSubnetMask", 0xFFFFFF00)
```

### 2.3 驱动与软件依赖

| 组件 | 说明 | 检查方法 |
|------|------|----------|
| **GigE Filter Driver** | 海康 GigE 过滤驱动 | 设备管理器 → 网卡属性 → 查看是否有 "MV GigE Vision Filter Driver" |
| **MVS Runtime DLL** | `MvCameraControl.dll` 及依赖 | `C:\Program Files (x86)\Common Files\MVS\Runtime\Win64_x64\` |
| **VC++ Redistributable** | MSVC 运行时库 | 随 MVS 安装包一起安装 |
| **Intel IPP** | 图像处理加速库 | 位于 MVS Runtime 目录 |

### 2.4 防火墙设置

GigE Vision 协议使用以下端口，需允许通过防火墙：

| 端口 | 用途 |
|------|------|
| **3956** (UDP) | GVCP (GigE Vision Control Protocol) — 设备发现与控制 |
| **49152-65535** (UDP) | GVSP (GigE Vision Streaming Protocol) — 图像数据传输 |

**Windows 防火墙设置：**
```powershell
# 添加入站规则（以管理员身份运行）
New-NetFirewallRule -DisplayName "GigE Vision GVCP" -Direction Inbound -Protocol UDP -LocalPort 3956 -Action Allow
```

或者**最简单的方式**：在 MVS 安装时选择"允许通过防火墙"，或在测试时将相机所在网卡设为"专用网络"。

### 2.5 网卡性能优化

| 设置项 | 推荐值 | 说明 |
|--------|--------|------|
| **巨帧 (Jumbo Packet)** | 9014 Bytes | 提升传输效率，降低 CPU 占用 |
| **接收缓冲区 (Receive Buffers)** | 2048 或最大 | 减少丢帧 |
| **中断节流率 (Interrupt Moderation)** | 关闭或最低 | 降低延迟 |
| **流控制 (Flow Control)** | 关闭 | GigE Vision 有自己的流控机制 |

设置路径：设备管理器 → 网卡 → 属性 → 高级

### 2.6 GevSCPSPacketSize（包大小）

SDK 在打开相机时**自动探测并设置**最佳包大小：

```
[HikAdapter] GevSCPSPacketSize set to 1500
```

- 如果网卡开启了巨帧 (9014)，SDK 会自动设置为更大值（如 9000）
- 当前值 1500 表示网卡未启用巨帧（使用标准以太网帧大小）
- **建议开启巨帧以获得更好的图像传输性能**

---

## 3. 相机运行参数说明

### 3.1 基础采集参数

| 参数名 (GenICam) | 类型 | 说明 | 典型值 |
|-----------------|------|------|--------|
| `ExposureTime` | Float | 曝光时间 (μs) | 5000 ~ 100000 |
| `Gain` | Float | 模拟增益 (dB) | 0 ~ 20 |
| `AcquisitionFrameRate` | Float | 采集帧率 (fps) | 5 ~ 30 |
| `TriggerMode` | Enum | 触发模式 | 0=连续, 1=触发 |
| `TriggerSource` | Enum | 触发源 | 0=软件, 1=线路0, ... |
| `AcquisitionMode` | Enum | 采集模式 | 2=连续采集 |

### 3.2 图像格式参数

| 参数名 | 说明 | 可选值 |
|--------|------|--------|
| `PixelFormat` | 像素格式 | Mono8, BayerRG8, RGB8Packed, ... |
| `Width` / `Height` | 图像分辨率 | MV-CS020-10GC 最大: 1624×1240 |
| `OffsetX` / `OffsetY` | ROI 偏移 | 用于设置感兴趣区域 |

### 3.3 使用示例

```python
import sys
sys.path.insert(0, 'build/Release')
from _core import create_camera_by_ip

# 打开相机
cam = create_camera_by_ip("hik", "169.254.232.111")

# 设置参数
cam.setParam("ExposureTime", 30000.0)   # 30ms 曝光
cam.setParam("Gain", 5.0)               # 5dB 增益

# 读取参数
exp = cam.getParam("ExposureTime")
gain = cam.getParam("Gain")
print(f"Exposure: {exp:.0f}us, Gain: {gain:.1f}dB")

# 取图
cam.start()
frame = cam.grabFrame()
if frame is not None:
    print(f"Frame: {frame.width}x{frame.height}, id={frame.frame_id}")
    # 转为 numpy 数组（零拷贝）
    img = frame.numpy()
cam.stop()
cam.close()
```

---

## 4. 配置文件说明

文件：`config/cameras.yaml`

```yaml
cameras:
  - id: cam1
    type: hik
    connection:
      method: auto           # 连接方式
      index: 0               # method=index 时的目标索引
      ip: ""                 # method=ip 时的目标 IP
      serial: ""             # method=serial 时的目标序列号
    gigE:
      packetSize: 0          # 0=自动探测
      interPacketDelay: 0    # 包间延迟(us)
      timeout: 5000          # 采集超时(ms)
    params:
      exposure: 5000
      gain: 10
      trigger: off
```

`connection.method` 支持四种方式：

| method | 说明 | 需要额外参数 |
|--------|------|-------------|
| `auto` | 枚举所有设备，打开第一台 | 无 |
| `index` | 按枚举序号打开 | `connection.index` |
| `ip` | 按 IP 地址打开 (GigE) | `connection.ip` |
| `serial` | 按序列号打开 | `connection.serial` |

---

## 5. 常用命令速查

```bash
# 扫描所有已连接相机
python test.py --scan

# 按索引连接并取流测试
python test.py --camera-by-index 0

# 按 IP 连接并取流测试
python test.py --camera-by-ip 169.254.232.111

# 按序列号连接并取流测试
python test.py --camera-by-serial DA7171596

# 无相机 API 冒烟测试
python test.py
```

---

## 6. 常见故障排查

### 问题：扫描不到相机

```
[ERROR] No cameras found.
```

排查步骤：
1. ✅ 检查相机电源灯是否亮起
2. ✅ 检查网线是否插好，网口灯是否闪烁
3. ✅ 运行 `Ip_Configurator.exe` 查看能否发现设备
4. ✅ 检查 Windows 防火墙是否放行 3956 端口
5. ✅ 检查网卡是否启用了 "MV GigE Vision Filter Driver"
6. ✅ 用 `ping 169.254.232.111` 测试网络连通性
7. ✅ 尝试将相机和主机都设为同一固定 IP 网段

### 问题：能发现但无法打开

可能原因：
- 相机被其他程序占用（关闭 MVS.exe、其他 SDK 应用）
- 相机处于错误状态（断电重启相机）
- 访问模式冲突（尝试切换交换机口或重启网卡）

### 问题：能打开但取图失败

可能原因：
- 网卡未启用巨帧，但 SDK 探测的包大小过大
- 网络丢包严重（检查网线和交换机）
- 防火墙拦截了 GVSP 数据流（端口 49152-65535）
- 相机触发模式设置为硬件触发但没有触发信号

---

## 7. 环境参考

| 项目 | 值 |
|------|-----|
| 操作系统 | Windows 11 Pro 10.0.26200 |
| Python 版本 | 3.14 |
| MVS SDK | C:\Program Files (x86)\Common Files\MVS\ |
| 编译工具链 | MSVC 2022 / CMake 3.22+ |
| CameraSDK 版本 | v2.0.0 |
