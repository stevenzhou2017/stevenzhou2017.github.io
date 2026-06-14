# Python WebSocket服务端 + 浏览器前端示例

author: 周均扬

date 2026.06.14

---

一个 **完整可运行示例**，使用 **Python WebSocket 服务端** + **浏览器前端**，支持：

* 多客户端同时连接
* 任意字符串发送和处理
* 直接在浏览器测试，无需额外安装插件

---

## 1️. Python WebSocket 服务端

```python
# 文件名: server.py
# 安装依赖: pip install websockets
import asyncio
import websockets

connected_clients = set()

async def handler(websocket):
    # 新客户端加入
    connected_clients.add(websocket)
    addr = websocket.remote_address
    print(f"[INFO] 客户端连接: {addr}")
    try:
        async for message in websocket:
            print(f"[RECV] {addr}: {message}")
            
            # 处理消息（示例：命令解析，可自定义逻辑）
            if message.lower() == "hello":
                response = "Hi! This is server."
            else:
                response = f"Server received: {message.upper()}"
            
            # 给当前客户端回传
            await websocket.send(response)

            # 可选：广播给所有其他客户端
            # broadcast = f"[广播] {addr}: {message}"
            # await asyncio.gather(*[c.send(broadcast) for c in connected_clients if c != websocket])

    except websockets.ConnectionClosed:
        print(f"[INFO] 客户端断开: {addr}")
    finally:
        connected_clients.remove(websocket)

async def main():
    server = await websockets.serve(handler, "0.0.0.0", 5000)
    print("[INFO] WebSocket服务器启动 0.0.0.0:5000")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())
```

**特点：**

* `connected_clients` 集合支持多客户端同时连接
* 简单命令示例：输入 `hello` → 返回自定义消息
* 其他输入 → 转大写返回
* 可轻松扩展处理逻辑，比如 JSON 命令解析

---

## 2️. 浏览器前端 HTML

```html
<!-- 文件名: client.html -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>WebSocket Client</title>
</head>
<body>
    <h2>WebSocket 多客户端测试</h2>
    <input type="text" id="inputMsg" placeholder="输入消息">
    <button onclick="sendMessage()">发送</button>
    <div id="log" style="border:1px solid #ccc; padding:10px; margin-top:10px; height:200px; overflow:auto;"></div>

    <script>
        const logDiv = document.getElementById("log");
        const ws = new WebSocket("ws://127.0.0.1:5000/");

        ws.onopen = () => log("已连接到服务器");
        ws.onclose = () => log("服务器已断开");
        ws.onerror = (err) => log("错误: " + err);
        ws.onmessage = (event) => log("收到: " + event.data);

        function sendMessage() {
            const msg = document.getElementById("inputMsg").value;
            ws.send(msg);
            log("发送: " + msg);
        }

        function log(message) {
            const p = document.createElement("p");
            p.innerText = message;
            logDiv.appendChild(p);
            logDiv.scrollTop = logDiv.scrollHeight;
        }
    </script>
</body>
</html>
```

**特点：**

* 可在多个浏览器标签页打开，测试多客户端同时连接
* 实时发送和接收服务器消息
* 日志自动滚动

---

## 3️. 测试步骤

1. 安装依赖：

```bash
pip install websockets
```

2. 启动服务器：

```bash
python server.py
```

3. 打开浏览器，加载 `client.html`
4. 多标签页输入消息测试多客户端同时连接
5. 测试命令：

   * 输入 `hello` → 返回自定义消息
   * 输入其他文字 → 返回大写


这个示例几乎 **零依赖、直接可运行**，适合开发调试或实验多客户端通信逻辑。

---

**这个示例升级成“可识别多条命令的简易后台控制台”**，客户端输入不同命令，后台做不同处理（类似控制机器人、查询状态、触发任务），只需要在 Python 后台添加几行代码就能扩展。
