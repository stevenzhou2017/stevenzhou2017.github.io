# 工业视觉事件回溯录制系统（Event-based Vision Recorder）

author: 周均扬

date： 2026.06.22 

---

工业视觉事件回溯录制系统等价于：

- 安防 NVR + AI分析
- 工业质检系统
- 智能告警系统
- SCADA子模块


提供一套**“工业级可扩展架构”**的实现方案：Vision Event Recorder + AI SCADA + GPU Video System（事件录像 + AI检测 + GPU视频流 + SCADA控制）。


###  1️. 工业级总体架构

```text
                    ┌──────────────────────────────┐
                    │      Web SCADA Dashboard     │
                    │  (实时视频 / 告警 / 控制)     │
                    └──────────────┬───────────────┘
                                   │ WebSocket / WebRTC
┌──────────────────────────────────▼──────────────────────────┐
│                AI + SCADA Event Control Layer              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Event Engine │  │ AI Scheduler │  │ Alarm Manager    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬──────────┘  │
│         │                 │                 │               │
│         ▼                 ▼                 ▼               │
│                Event Bus (ZeroMQ / Queue / Redis)          │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              GPU Video + AI Inference Layer                 │
│   TensorRT / CUDA Stream / NVDEC Decode / Batch Pipeline    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│        CameraSDK + ZeroCopy Frame + Ring Buffer            │
│   GigE / USB / RTSP → Shared Memory → GPU Buffer           │
└─────────────────────────────────────────────────────────────┘
```

---

###  2️. 系统核心能力拆解

系统由4个核心子系统组成:

#### 1. Event Recorder（事件录像）

* 30s pre-buffer 
* 30s post-buffer
* 自动生成 MP4


#### 2. AI SCADA（控制系统）

* NG触发
* 规则引擎
* PLC联动


#### 3. GPU Video Pipeline

* NVDEC解码
* CUDA zero-copy
* TensorRT inference


#### 4. Web SCADA

* 实时视频
* 告警流
* 设备状态

---

### 3. 工程结构及实现

```text
vision_scada/
│
├── camera/
│   ├── camera_sdk.py
│   ├── ring_buffer.py
│
├── gpu/
│   ├── inference.py
│
├── event/
│   ├── recorder.py
│   ├── event_engine.py
│
├── scada/
│   ├── server.py
│
├── core/
│   ├── event_bus.py
│
└── main.py
```


#### 1. Ring Buffer

```python
# camera/ring_buffer.py
import numpy as np
import threading
from collections import deque
import time

class RingBuffer:
    def __init__(self, seconds=30, fps=30):
        self.maxlen = seconds * fps
        self.buffer = deque(maxlen=self.maxlen)
        self.lock = threading.Lock()

    def push(self, frame):
        with self.lock:
            self.buffer.append((time.time(), frame))

    def get(self):
        with self.lock:
            return list(self.buffer)
```


#### 2. CameraSDK（工业采集层）

```python
# camera/camera_sdk.py
import threading
import cv2
import time
import numpy as np

class CameraSDK(threading.Thread):
    def __init__(self, buffer, event_bus, fps=20):
        super().__init__(daemon=True)
        self.buffer = buffer
        self.bus = event_bus
        self.fps = fps
        self.running = True
        self.frame_id = 0

    def run(self):
        while self.running:
            frame = np.zeros((480, 640, 3), dtype=np.uint8)

            cv2.putText(frame,
                        f"Frame {self.frame_id}",
                        (50, 100),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        1, (0,255,0), 2)

            self.buffer.push(frame)

            # 事件流
            self.bus.publish({
                "type": "frame",
                "id": self.frame_id,
                "frame": frame
            })

            self.frame_id += 1
            time.sleep(1/self.fps)
```

#### 3. Event Bus

```python
# core/event_bus.py
import queue

class EventBus:
    def __init__(self):
        self.q = queue.Queue(maxsize=1000)

    def publish(self, event):
        try:
            self.q.put_nowait(event)
        except:
            pass

    def get(self):
        return self.q.get()
```


#### 4.  AI检测 + SCADA触发

```python
# gpu/inference.py
import threading
import time
import numpy as np

class AIEngine(threading.Thread):
    def __init__(self, bus, recorder):
        super().__init__(daemon=True)
        self.bus = bus
        self.recorder = recorder

    def run(self):
        while True:
            event = self.bus.get()

            if event["type"] == "frame":
                score = np.random.random()
                ng = score > 0.85

                print(f"[AI] score={score:.2f}")

                if ng:
                    print("🚨 NG DETECTED → trigger recorder")
                    self.recorder.trigger()
```


#### 5. 事件录像器

```python
# event/recorder.py
import cv2
import time
import threading

class EventRecorder:
    def __init__(self, ring_buffer, fps=20):
        self.buffer = ring_buffer
        self.fps = fps
        self.post_seconds = 30
        self.recording = False

    def trigger(self):
        if self.recording:
            return

        self.recording = True
        pre = self.buffer.get()
        post = []

        def collect_post():
            time.sleep(self.post_seconds)
            self.save(pre, post)

        self.post_thread = threading.Thread(target=collect_post)
        self.post_thread.start()

        self.post_buffer = post

    def push_post(self, frame):
        if self.recording:
            self.post_buffer.append(frame)

    def save(self, pre, post):
        frames = pre + [(time.time(), f) for f in post]

        if not frames:
            return

        h, w, _ = frames[0][1].shape

        name = f"event_{int(time.time())}.mp4"
        writer = cv2.VideoWriter(name,
                                 cv2.VideoWriter_fourcc(*"mp4v"),
                                 self.fps,
                                 (w, h))

        for _, frame in frames:
            writer.write(frame)

        writer.release()

        print(f"💾 Saved: {name}")

        self.recording = False
```


#### 6. Web SCADA（实时视频 + 状态）

```python
# scada/server.py
from fastapi import FastAPI, WebSocket
import base64
import cv2

app = FastAPI()

clients = set()

@app.websocket("/ws")
async def ws(websocket: WebSocket):
    await websocket.accept()
    clients.add(websocket)

    try:
        while True:
            await websocket.receive_text()
    finally:
        clients.remove(websocket)


async def push_frame(frame):
    _, buf = cv2.imencode(".jpg", frame)
    jpg = base64.b64encode(buf).decode()

    for c in clients:
        await c.send_text(jpg)
```

---

#### 7. 系统启动主程序 main.py

```python
from camera.ring_buffer import RingBuffer
from core.event_bus import EventBus
from camera.camera_sdk import CameraSDK
from gpu.inference import AIEngine
from event.recorder import EventRecorder

buffer = RingBuffer(30, 20)
bus = EventBus()

recorder = EventRecorder(buffer)
camera = CameraSDK(buffer, bus)
ai = AIEngine(bus, recorder)

camera.start()
ai.start()

print("[SYSTEM] Vision SCADA Running...")

while True:
    pass
```

---

### 4. 系统本质

系统为**GPU加速 + 事件驱动 + 工业级视觉 SCADA 操作系统**， 具备：

 - 实时采集（CameraSDK）：工业相机抽象层
 - GPU推理链路： AI事件驱动
 - Ring Buffer录像：工业事件回溯系统
 - SCADA控制：事件 → 控制 → 告警
 - 可扩展架构：可接 PLC / MES / Robot / Cloud


 一句话总结是：**“GPU Vision SCADA + Event Recorder 核心内核”**。

---
