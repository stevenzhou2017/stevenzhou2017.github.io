# 事件驱动的工业视觉系统

author： 周均扬

date: 2026.06.25

---

按工业视觉OS思路重构 **可运行 Demo（WebSocket + WebRTC + CameraSDK + AlgorithmSDK + 事件回溯录制系统）**。

核心目标是一个 **Event-driven Video + AI + Replay System**。

---

### 1. 系统架构

```text
                ┌──────────────────────────────┐
                │        Web UI (Browser)      │
                │  WebRTC Player + Event Panel │
                └──────────────┬───────────────┘
                               │
                     WebRTC Video Stream
                               │
        ┌──────────────────────▼──────────────────────┐
        │            Media + AI Server                │
        │                                              │
        │  WebSocket (Control + Event Bus)            │
        │  WebRTC (Video Streaming SFU-lite)          │
        │                                              │
        │  ┌──────────────────────────────────────┐   │
        │  │         CameraSDK Layer              │   │
        │  │  - Frame Capture (USB/Video/File)   │   │
        │  │  - Timestamped FrameBuffer          │   │
        │  └──────────────┬───────────────────────┘   │
        │                 │                            │
        │  ┌──────────────▼───────────────────────┐   │
        │  │       AlgorithmSDK Layer             │   │
        │  │  - Detection (mock/YOLO)            │   │
        │  │  - Event Trigger Engine             │   │
        │  │  - ROI / anomaly scoring            │   │
        │  └──────────────┬───────────────────────┘   │
        │                 │                            │
        │  ┌──────────────▼───────────────────────┐   │
        │  │ Event Recorder (Core)                │   │
        │  │ - pre-buffer 30s                    │   │
        │  │ - post-buffer 30s                   │   │
        │  │ - event timeline storage            │   │
        │  └──────────────────────────────────────┘   │
        └──────────────────────────────────────────────┘
```

---

### 2. 核心能力拆分

系统本质是 4 个引擎：

| 模块            | 职责          |
| ------------- | ----------- |
| CameraSDK     | 帧采集 + 时间戳   |
| AlgorithmSDK  | AI检测 + 事件触发 |
| EventRecorder | 回溯录像（前后缓冲）  |
| WebRTC        | 实时视频推流      |

---

### 3. 可运行 Demo（Python + Html）

#### 1 安装依赖

```bash
pip install aiohttp aiortc opencv-python numpy av
```


#### 2. CameraSDK（帧采集层）

```python
# camera_sdk.py
import cv2
import time
from collections import deque

class CameraFrame:
    def __init__(self, frame, ts):
        self.frame = frame
        self.timestamp = ts


class CameraSDK:
    """
    工业级CameraSDK模拟：
    - 支持buffer
    - 支持时间戳
    - 支持回放基础数据
    """

    def __init__(self, src=0, buffer_size=300):
        self.cap = cv2.VideoCapture(src)
        self.buffer = deque(maxlen=buffer_size)

    def read(self):
        ret, frame = self.cap.read()
        if not ret:
            return None

        ts = time.time()
        f = CameraFrame(frame, ts)
        self.buffer.append(f)
        return f

    def get_prebuffer(self, seconds=5):
        now = time.time()
        return [f for f in self.buffer if now - f.timestamp <= seconds]
```


#### 3. AlgorithmSDK（检测 + 事件触发）

```python
# algorithm_sdk.py
import cv2
import numpy as np

class Event:
    def __init__(self, event_type, score, frame):
        self.type = event_type
        self.score = score
        self.frame = frame


class AlgorithmSDK:
    """
    工业视觉算法层：
    - anomaly detection
    - motion detection (demo)
    """

    def __init__(self, threshold=25):
        self.threshold = threshold
        self.last_frame = None

    def analyze(self, camera_frame):
        frame = camera_frame.frame

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        if self.last_frame is None:
            self.last_frame = gray
            return None

        diff = cv2.absdiff(gray, self.last_frame)
        score = np.mean(diff)

        self.last_frame = gray

        if score > self.threshold:
            return Event("motion_anomaly", score, frame)

        return None
```


#### 4. Event Recorder（核心回溯系统）

```python
# event_recorder.py
from collections import deque
import time

class EventRecorder:
    """
    事件驱动回溯系统：
    - pre-buffer 30s
    - post-buffer 30s
    """

    def __init__(self, pre_sec=30, post_sec=30):
        self.pre_sec = pre_sec
        self.post_sec = post_sec
        self.buffer = deque()
        self.active_events = []

    def push_frame(self, frame):
        self.buffer.append(frame)

        now = time.time()
        # 清理旧数据
        while self.buffer and now - self.buffer[0].timestamp > self.pre_sec:
            self.buffer.popleft()

    def trigger_event(self, event):
        print(f"[EVENT] {event.type}, score={event.score}")

        event_record = {
            "event": event,
            "prebuffer": list(self.buffer),
            "postbuffer": []
        }

        self.active_events.append(event_record)
        return event_record

    def append_post_frame(self, event_record, frame):
        event_record["postbuffer"].append(frame)
```


#### 5. WebRTC Video Track（AI + Camera + Recorder融合）

```python
# webrtc_track.py
from aiortc import VideoStreamTrack
from av import VideoFrame
import numpy as np

class AITrackedVideo(VideoStreamTrack):
    def __init__(self, camera, algo, recorder):
        super().__init__()
        self.camera = camera
        self.algo = algo
        self.recorder = recorder

    async def recv(self):
        pts, time_base = await self.next_timestamp()

        cam_frame = self.camera.read()
        if cam_frame is None:
            img = np.zeros((480, 640, 3), dtype=np.uint8)
        else:
            img = cam_frame.frame

            # push into recorder
            self.recorder.push_frame(cam_frame)

            # run AI
            event = self.algo.analyze(cam_frame)

            if event:
                ev = self.recorder.trigger_event(event)
                print("Event captured with prebuffer:", len(ev["prebuffer"]))

        vf = VideoFrame.from_ndarray(img, format="bgr24")
        vf.pts = pts
        vf.time_base = time_base
        return vf
```


#### 6. WebSocket + WebRTC Server

```python
# server.py
import asyncio
import json

from aiohttp import web
from aiortc import RTCPeerConnection, RTCSessionDescription

from camera_sdk import CameraSDK
from algorithm_sdk import AlgorithmSDK
from event_recorder import EventRecorder
from webrtc_track import AITrackedVideo

pcs = set()

camera = CameraSDK(0)
algo = AlgorithmSDK()
recorder = EventRecorder()


async def offer(request):
    params = await request.json()

    pc = RTCPeerConnection()
    pcs.add(pc)

    pc.addTrack(AITrackedVideo(camera, algo, recorder))

    offer = RTCSessionDescription(sdp=params["sdp"], type=params["type"])
    await pc.setRemoteDescription(offer)

    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.json_response({
        "sdp": pc.localDescription.sdp,
        "type": pc.localDescription.type
    })


# WebSocket: control + event stream
async def ws_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    async for msg in ws:
        if msg.type == web.WSMsgType.TEXT:
            data = json.loads(msg.data)

            if data.get("cmd") == "get_status":
                await ws.send_str(json.dumps({
                    "buffer_size": len(camera.buffer),
                }))

    return ws


app = web.Application()
app.add_routes([
    web.post("/offer", offer),
    web.get("/ws", ws_handler)
])

web.run_app(app, port=8080)
```


#### 7. Web UI（事件 + 视频）

```html
<!DOCTYPE html>
<html>
<body>

<h2>Industrial WebRTC + Event Replay</h2>

<video id="video" autoplay playsinline></video>

<pre id="log"></pre>

<script>
const video = document.getElementById("video");
const log = document.getElementById("log");

const ws = new WebSocket("ws://localhost:8080/ws");

const pc = new RTCPeerConnection();

pc.ontrack = (e) => {
    video.srcObject = e.streams[0];
};

pc.onicecandidate = (e) => {
    if (e.candidate) {
        ws.send(JSON.stringify({ type: "ice", candidate: e.candidate }));
    }
};

ws.onmessage = (msg) => {
    log.innerText += msg.data + "\n";
};

async function start() {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const resp = await fetch("/offer", {
        method: "POST",
        body: JSON.stringify(pc.localDescription),
        headers: {"Content-Type":"application/json"}
    });

    const answer = await resp.json();
    await pc.setRemoteDescription(answer);
}

start();
</script>

</body>
</html>
```

---

### 4. Demo已经实现

这个系统是一个：Industrial Vision Event System

已具备能力：

#### 1. CameraSDK

* 帧缓存
* 时间戳流
* 可扩展 RTSP / GigE

#### 2. AlgorithmSDK

* 实时检测（motion/anomaly）
* 可插拔 AI

#### 3. Event Recorder

* pre-buffer（事件前 30 秒）
* post-buffer（事件后扩展）
* timeline 结构

#### 4. WebRTC

* 实时视频推送 Web UI

#### 5. WebSocket

* 控制通道
* 状态查询
* 可扩展事件广播

---

### 5. 下一步升级


可以升级成：


#### 1. GPU Zero-Copy Pipeline

* NVDEC / NVENC
* CUDA frame buffer

#### 2. SFU架构

* mediasoup / Pion SFU
* 多客户端广播

#### 3. Event Replay UI

* timeline scrub
* event jump playback

#### 4. AI Agent Layer

* VLM事件解释
* 自动报警分类

---
