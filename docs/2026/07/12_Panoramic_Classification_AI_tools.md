# AI主流工具全景分类

author: 周均扬

date: 2026.07.29

---

**更新日期：2026年7月29日。**

下表按主要应用场景整理。由于多数产品同时覆盖多个场景，分类以其最核心、最常用的功能为准。

## 1. 标识说明

| 标识        | 含义                                   |
| --------- | ------------------------------------ |
| **开源**    | 核心软件代码采用 MIT、Apache 2.0、GPL 等开源许可证发布 |
| **开放权重**  | 模型参数可以下载和部署，但许可证未必满足严格的开源定义          |
| **源代码可见** | 可以查看和自托管，但许可证存在商业使用或再分发限制            |
| **闭源**    | 核心代码、模型或平台未公开，主要通过网站、客户端或API使用       |
| **免费增值**  | 有免费版或免费额度，高级模型、更多额度、团队功能收费           |
| **按量收费**  | 根据Token、图片、视频、分钟数、算力或任务执行次数计费        |

特别注意：**开源软件免费，不代表模型、GPU、云服务器和企业运维免费。**

---

## 2. 通用AI助手、问答与研究

| 产品                    | 厂商            | 主要功能                               | 开放属性          | 收费模式                                            |
| --------------------- | ------------- | ---------------------------------- | ------------- | ----------------------------------------------- |
| **ChatGPT**           | OpenAI        | 通用问答、推理、写作、数据分析、图片、语音、深度研究、Agent   | 闭源            | 免费增值；Free、Go、Plus、Pro及企业版 ([OpenAI][1])         |
| **Claude**            | Anthropic     | 长文档分析、复杂推理、编程、科研和知识工作              | 闭源            | 免费增值；Free、Pro、Max、Team、Enterprise ([Claude][2]) |
| **Gemini**            | Google        | 通用助手、搜索、文档、图片、视频、Google生态集成        | 闭源            | 免费增值；Google AI Pro、Ultra等订阅 ([Gemini][3])       |
| **Microsoft Copilot** | Microsoft     | 通用问答、Web搜索、Windows及Microsoft 365集成 | 闭源            | 基础功能免费；高级能力和办公集成收费 ([Microsoft][4])             |
| **Perplexity**        | Perplexity AI | 联网搜索、答案溯源、深度研究、企业知识搜索              | 闭源            | 免费增值；个人Pro和企业版收费 ([Perplexity AI][5])           |
| **DeepSeek**          | 深度求索          | 中文问答、推理、数学、代码、联网搜索                 | 产品闭源；部分模型开放权重 | 官方聊天服务免费；API按Token收费 ([DeepSeek API Docs][6])   |
| **通义千问/Qwen**         | 阿里巴巴          | 中文问答、多模态、代码、Agent、图像和语音            | 产品闭源；大量模型开放权重 | 消费者产品有免费入口；百炼API提供免费额度后按量收费 ([AlibabaCloud][7]) |
| **豆包**                | 字节跳动          | 问答、写作、翻译、图片、视频、语音和编程               | 闭源            | 个人助手以免费为主；企业模型服务按量收费 ([斗宝][8])                  |
| **Kimi**              | 月之暗面          | 长文本、文件分析、搜索、Agent、代码、文档和网页生成       | 产品闭源          | 基础对话免费；高级Agent和高额度会员收费 ([奇米][9])                |

### 适合场景

* **综合能力和工具生态**：ChatGPT。
* **长文档、推理、代码审查**：Claude。
* **Google办公生态**：Gemini。
* **搜索和引用溯源**：Perplexity。
* **中文、成本敏感和本地模型部署**：DeepSeek、Qwen。
* **国内个人用户和内容创作**：豆包、Kimi。

---

## 3. AI编程、IDE与软件工程Agent

| 产品                 | 产品形态                        | 主要功能                              | 开放属性               | 收费模式                                                              |
| ------------------ | --------------------------- | --------------------------------- | ------------------ | ----------------------------------------------------------------- |
| **Cursor**         | AI原生IDE                     | 代码补全、仓库理解、多文件修改、云端Agent、代码审查      | 闭源                 | Hobby免费；Pro、Pro+、Ultra和团队版收费 ([Cursor][10])                       |
| **Windsurf**       | AI原生IDE                     | Cascade Agent、代码生成、仓库理解、编辑器内执行    | 闭源                 | 提供试用及个人、团队、企业付费方案 ([Devin][11])                                   |
| **GitHub Copilot** | IDE插件、CLI、GitHub Agent      | 代码补全、聊天、Agent、PR审查、云端编码           | 闭源                 | 有Free版；Pro、Pro+、Max、Business、Enterprise收费 ([GitHub][12])          |
| **OpenAI Codex**   | CLI、桌面端、云端编码Agent           | 编写代码、执行测试、修改仓库、处理Issue、生成PR       | 闭源                 | 包含于部分ChatGPT套餐；超额或团队使用按Token/Credits收费 ([OpenAI Help Center][13]) |
| **Claude Code**    | CLI、IDE和桌面编码Agent           | 代码库分析、终端操作、调试、重构、测试、MCP           | 闭源                 | 主要通过Claude Pro、Max、Team或API使用 ([Claude][14])                      |
| **TRAE IDE/Work**  | AI IDE和工作Agent              | 代码生成、Agent开发、需求到软件交付、知识工作         | 闭源                 | Free、Lite、Pro、Pro+、Ultra；提供试用，按额度分层收费 ([Trae][15])                |
| **Qoder**          | IDE、CLI、JetBrains插件         | 代码补全、Quest任务、Repo Wiki、Agent和项目记忆 | 闭源                 | 社区版免费；Pro、Pro+、Ultra收费，可购买Credits ([Qoder][16])                   |
| **CodeBuddy**      | 腾讯AI IDE、CLI、插件             | 对话编程、代码补全、需求规划、测试、部署和Agent Team   | 闭源                 | 以Pro和团队订阅为主，按Credits增加用量 ([CodeBuddy][17])                        |
| **Cline**          | VS Code、JetBrains、CLI Agent | 读取和修改文件、运行终端、调用MCP、浏览器操作          | 开源，Apache 2.0      | 软件免费；模型API或本地算力另付 ([GitHub][18])                                  |
| **OpenHands**      | 自托管开发Agent平台                | 编码Agent、终端、自动化、远程和云端开发环境          | 核心MIT开源；部分企业模块商业许可 | 自托管核心免费；云服务、模型API和企业功能收费 ([GitHub][19])                           |

### 编程工具选型

| 需求              | 优先考虑                       |
| --------------- | -------------------------- |
| 日常代码补全和快速修改     | GitHub Copilot、Cursor      |
| 仓库级重构和复杂开发任务    | Claude Code、Codex、Cursor   |
| AI原生IDE和交互式开发   | Cursor、Windsurf、TRAE、Qoder |
| 国内网络和中文研发环境     | Qoder、CodeBuddy、TRAE       |
| 私有部署或自主模型选择     | Cline、OpenHands、Ollama     |
| 企业GitHub流程和PR治理 | GitHub Copilot             |
| 多模型交叉开发和审查      | Codex + Claude Code        |

---

## 4. 办公、写作、文档和知识管理

| 产品                              | 主要场景                                     | 开放属性 | 收费模式                                                                   |
| ------------------------------- | ---------------------------------------- | ---- | ---------------------------------------------------------------------- |
| **Microsoft 365 Copilot**       | Word、Excel、PowerPoint、Outlook、Teams、企业搜索 | 闭源   | Microsoft 365 Copilot及相关套装收费；部分Copilot Chat能力随合格账号提供 ([Microsoft][20]) |
| **Gemini for Google Workspace** | Gmail、Docs、Sheets、Slides、Meet、Notebook   | 闭源   | 随相应Workspace商业套餐提供，企业套餐收费 ([Google Workspace][21])                     |
| **Notion AI**                   | 文档、Wiki、数据库、知识问答、会议记录和自定义Agent           | 闭源   | Notion有免费版；完整AI及Agent能力主要通过付费套餐或Credits使用 ([Notion][22])               |
| **Grammarly**                   | 英文语法、改写、语气调整、生成和查重                       | 闭源   | Free免费；Pro和企业版收费 ([Grammarly][23])                                     |
| **Canva AI/Magic Studio**       | 文案、海报、社交内容、演示文稿、图片和视频                    | 闭源   | Free可使用部分AI能力；Pro、Business、Enterprise提高额度 ([Canva][24])                |
| **Gamma**                       | AI演示文稿、文档、网页和社交媒体内容                      | 闭源   | Free免费；Plus、Pro、Ultra收费 ([Gamma][25])                                  |
| **Beautiful.ai**                | 智能排版、商务演示、销售和汇报PPT                       | 闭源   | 以付费订阅为主，提供试用 ([美丽的.ai][26])                                            |

### 办公生态选择原则

* 企业使用Microsoft 365：优先选择 **Microsoft 365 Copilot**，避免再购买多个重叠的写作和会议工具。
* 企业使用Google Workspace：优先选择 **Gemini for Workspace**。
* 知识库、项目文档和团队协作：选择 **Notion AI**。
* 快速制作汇报材料：选择 **Gamma或Canva**。
* 对品牌模板和商务版式要求较高：选择 **PowerPoint Copilot、Canva或Beautiful.ai**。

---

## 5. 会议记录、语音转写和会话分析

| 产品                       | 主要功能                          | 开放属性 | 收费模式                                                  |
| ------------------------ | ----------------------------- | ---- | ----------------------------------------------------- |
| **Otter.ai**             | 会议录音、实时转写、摘要、行动项和会议搜索         | 闭源   | Basic免费；Pro、Business、Enterprise收费 ([Otter.ai][27])    |
| **Fireflies.ai**         | 会议机器人、转写、摘要、话题分析、CRM集成        | 闭源   | Free免费；Pro、Business、Enterprise收费 ([Fireflies.ai][28]) |
| **Fathom**               | Zoom、Meet、Teams录制、摘要、片段和CRM同步 | 闭源   | 个人版长期保留免费方案；Premium和Team收费 ([Fathom 视频帮助中心][29])      |
| **Teams Copilot**        | Teams会议摘要、问答、任务和上下文分析         | 闭源   | 通常需要Microsoft 365 Copilot或相关商业套餐 ([Microsoft][30])    |
| **Google Meet + Gemini** | 自动会议记录、摘要、行动项和Workspace集成     | 闭源   | 随相应Google Workspace套餐提供 ([Google Workspace Help][31]) |

对于涉及客户机密、研发讨论和商业合同的会议，应重点检查：**录音授权、数据存储区域、模型训练政策、管理员删除能力和保留周期**。

---

## 6. AI图片生成、编辑和设计

| 产品                           | 主要功能                              | 开放属性       | 收费模式                                                |
| ---------------------------- | --------------------------------- | ---------- | --------------------------------------------------- |
| **Midjourney**               | 高质量艺术图、概念设计、广告和视觉创意               | 闭源         | 基本为纯付费订阅；Basic、Standard、Pro、Mega ([Midjourney][32]) |
| **Adobe Firefly**            | 图片生成、局部重绘、扩图、设计、视频和Adobe软件集成      | 闭源         | 有限免费版；Standard、Pro、Pro Plus、Premium收费 ([Adobe][33]) |
| **ChatGPT图片生成**              | 对话式生成、文字排版、图片修改和多轮编辑              | 闭源         | 免费版有限额度；付费套餐提高额度和复杂度 ([OpenAI][1])                  |
| **Canva Magic Media/Design** | 海报、PPT、营销图、社交媒体和品牌模板              | 闭源         | 免费增值 ([Canva][34])                                  |
| **ComfyUI**                  | 节点式图片和视频生成工作流、ControlNet、LoRA、批处理 | 开源，GPL-3.0 | 本地软件免费；模型、插件许可证、GPU和云算力另计 ([GitHub][35])            |

### 图片类工具特点

* **视觉艺术和风格表现**：Midjourney。
* **商业设计和Adobe工作流**：Firefly。
* **准确理解修改指令、文字和结构**：ChatGPT图片生成。
* **海报、PPT、社交媒体批量制作**：Canva。
* **可控生成、私有部署和复杂工作流**：ComfyUI。

---

## 7. AI视频生成和视频制作

| 产品                      | 主要功能                     | 开放属性 | 收费模式                                             |
| ----------------------- | ------------------------ | ---- | ------------------------------------------------ |
| **Runway**              | 文生视频、图生视频、视频编辑、特效和创意制作   | 闭源   | Free有限额度；Standard、Pro、Max和企业版收费 ([Runway][36])   |
| **Google Veo/Flow**     | 高质量视频生成、电影化场景和故事制作       | 闭源   | 主要随Google AI Pro、Ultra及相关Credits提供 ([Gemini][3]) |
| **Adobe Firefly Video** | 文生视频、图生视频、视频扩展和Adobe编辑流程 | 闭源   | 有限免费额度；高级视频生成消耗付费Credits ([Adobe][33])           |
| **豆包/Seedance**         | 中文提示词视频生成、图生视频和短视频制作     | 闭源   | 当前消费者入口提供一定免费使用，企业服务通常按量收费 ([斗宝][37])            |
| **Canva AI Video**      | 营销视频、社交视频、演示动画和模板制作      | 闭源   | 免费增值 ([Canva][24])                               |
| **ComfyUI视频工作流**        | 本地视频模型、节点编排、批量生成和后处理     | 开源框架 | 软件免费；模型、GPU和部署成本另计 ([GitHub][38])                |

---

## 8. AI语音、配音和音乐生成

| 产品                      | 主要功能                     | 开放属性            | 收费模式                                               |
| ----------------------- | ------------------------ | --------------- | -------------------------------------------------- |
| **ElevenLabs**          | 文本转语音、声音克隆、配音、翻译和语音Agent | 闭源              | 有免费版；API、商业授权和高额度收费；免费版通常不含商业许可 ([ElevenLabs][39]) |
| **Suno**                | 歌词、旋律、完整歌曲、分轨和音乐编辑       | 闭源              | Free免费但限制商业使用；Pro和Premier支持更多额度及商业用途 ([Suno][40])  |
| **Adobe Firefly Audio** | 音效、语音、视频配音和多语言翻译         | 闭源              | 有限免费额度；高级使用消耗付费Credits ([Adobe][33])               |
| **Qwen Audio/TTS**      | 多语言语音理解、语音合成、风格化音色       | 产品闭源；部分底层模型开放权重 | 消费者体验及新人额度；企业API按量收费 ([AlibabaCloud][7])           |

---

## 9. AI工作流、Agent平台和自动化

| 产品                       | 主要功能                                 | 开放属性                      | 收费模式                                                         |
| ------------------------ | ------------------------------------ | ------------------------- | ------------------------------------------------------------ |
| **Dify**                 | 可视化Agent、Workflow、RAG、模型管理、工具调用和应用发布 | 开源/可自托管                   | 社区自托管版免费；云服务、企业版和模型API收费 ([Dify][41])                        |
| **n8n**                  | 工作流自动化、AI Agent、系统集成、Webhook和自托管     | 源代码可见、fair-code，并非标准OSI开源 | 社区自托管可免费使用；云版和企业功能收费 ([GitHub][42])                          |
| **Zapier**               | SaaS连接、业务自动化、AI Agent、表单、数据表和MCP     | 闭源                        | Free免费；Professional、Team、Enterprise及Agent额度收费 ([Zapier][43]) |
| **Notion Custom Agents** | 基于知识库执行重复任务、更新数据库和处理文档               | 闭源                        | 可试用；之后按Notion Credits或商业套餐收费 ([Notion][22])                  |
| **OpenHands**            | 面向软件工程的编码Agent、任务调度和自托管自动化           | 核心开源                      | 自托管免费；模型、云端和企业能力收费 ([GitHub][19])                            |

### 平台差异

| 需求                    | 建议            |
| --------------------- | ------------- |
| 快速构建企业知识库和RAG应用       | Dify          |
| 复杂系统集成、API和数据流程       | n8n           |
| 非技术用户连接大量SaaS         | Zapier        |
| 软件研发任务自动化             | OpenHands     |
| 以Notion知识库为中心的办公Agent | Notion Agents |

---

## 10. 本地模型运行与私有化部署

| 产品                          | 主要功能                     | 开放属性               | 收费模式                                                         |
| --------------------------- | ------------------------ | ------------------ | ------------------------------------------------------------ |
| **Ollama**                  | 在PC、服务器上下载和运行LLM，提供本地API | CLI核心MIT开源         | 软件免费；硬件、电力和模型许可另计 ([GitHub][44])                             |
| **llama.cpp**               | CPU、GPU和边缘设备上的GGUF模型推理   | MIT开源              | 软件免费；硬件和模型许可另计 ([GitHub][45])                                |
| **vLLM**                    | 高吞吐量GPU推理、批处理和OpenAI兼容服务 | Apache 2.0开源       | 软件免费；GPU服务器和运维成本另计 ([GitHub][46])                            |
| **Hugging Face Hub/Spaces** | 模型、数据集、Demo、部署和推理服务      | 平台闭源；托管大量开源和开放权重资产 | 有免费账号；Pro、Team、Enterprise、推理和Endpoint收费 ([Hugging Face][47]) |
| **ComfyUI**                 | 本地图片、视频和多模态生成引擎          | GPL-3.0开源          | 本地软件免费；云服务、GPU和模型成本另计 ([GitHub][35])                         |

### 本地部署常见组合

```text
个人电脑轻量部署
开放权重模型 → Ollama / llama.cpp → Open WebUI或桌面客户端

企业GPU服务器
开放权重模型 → vLLM → API Gateway → Dify / n8n / 业务系统

图片与视频生成
开放权重生成模型 → ComfyUI → 工作流模板 → 批处理和资产管理
```

这里必须分别检查三层许可证：

```text
运行框架许可证
        +
模型权重许可证
        +
训练数据、插件和LoRA许可证
        =
最终可否商用
```

---

## 11. 模型API与企业AI开发平台

| 平台                         | 主要用途                                    | 开放属性             | 收费模式                                                       |
| -------------------------- | --------------------------------------- | ---------------- | ---------------------------------------------------------- |
| **OpenAI API**             | GPT、推理、语音、图片、Agent及工具调用                 | 闭源               | 按Token、工具调用、图片、语音等用量收费 ([OpenAI][48])                      |
| **Claude API**             | 长上下文、推理、代码、工具调用和Agent                   | 闭源               | 按输入、缓存输入和输出Token收费 ([Claude Platform][49])                 |
| **Gemini Developer API**   | 多模态、长上下文、搜索和开发者应用                       | 闭源               | 提供有限免费层；生产使用按Token和工具调用收费 ([Google AI for Developers][50]) |
| **DeepSeek API**           | 中文、推理、代码及低成本批量处理                        | 模型部分开放权重；API服务闭源 | 按Token收费 ([DeepSeek API Docs][6])                          |
| **阿里云百炼**                  | Qwen及多种模型、RAG、Agent、模型部署                | 平台闭源；支持开放权重模型    | 新用户有免费额度；到期或用完后按量收费 ([AlibabaCloud][7])                    |
| **Amazon Bedrock**         | 多厂商模型托管、企业Agent、知识库和安全治理                | 闭源云平台            | 根据模型、模态、吞吐量和调用量收费 ([Amazon Web Services, Inc.][51])        |
| **Microsoft Foundry**      | OpenAI、DeepSeek、Llama、Mistral等模型和企业AI开发 | 闭源云平台            | Azure免费账号可试用；模型一般按量或预置吞吐收费 ([微软Azure][52])                 |
| **Hugging Face Inference** | 开放模型调用、Endpoint和托管部署                    | 平台闭源；模型属性各异      | 少量免费额度；超额按量或Endpoint算力收费 ([Hugging Face][53])              |

---

## 12. 按组织类型的推荐组合

### 1. 个人知识工作者

```text
ChatGPT或Claude
+ Perplexity
+ Gamma或Canva
+ Fathom
```

覆盖问答、研究、文档、PPT和会议记录，避免购买功能高度重叠的多个通用助手。

### 2. 软件研发团队

```text
主力IDE：Cursor或GitHub Copilot
复杂任务：Claude Code或Codex
国内替代：Qoder、CodeBuddy或TRAE
私有化：Cline / OpenHands + Ollama / vLLM
```

Cursor、GitHub Copilot适合高频开发；Claude Code和Codex更适合仓库级任务；开放工具更适合代码不能进入外部SaaS的项目。([Cursor][10])

### 3. 企业办公团队

```text
Microsoft体系：Microsoft 365 Copilot
Google体系：Gemini for Workspace
知识管理：Notion AI
视觉内容：Canva
```

优先选择现有办公套件自带的AI能力，通常比同时采购多个独立AI写作、会议和搜索工具更容易治理。([Microsoft][20])

### 4. 工业AI和制造业研发团队

建议采用分层组合：

```text
闭源前沿模型
ChatGPT / Claude / Gemini
用于研究、架构、代码辅助和复杂推理

开放权重模型
Qwen / DeepSeek等
用于私有知识、现场数据和低成本批处理

应用平台
Dify + n8n
用于RAG、Agent、审批、设备和业务系统集成

推理平台
Ollama / vLLM
用于开发验证和GPU服务器部署

研发Agent
Cursor / Claude Code / Codex / Cline
用于代码生成、测试、重构和CI
```

工业场景不宜只按模型能力选型，还要同时评估：**数据是否出域、源代码是否上传、模型版本能否冻结、输出能否追溯、是否支持离线运行、许可证能否商用，以及故障时能否降级。**

---

## 13. 总结

1. **通用助手市场以闭源免费增值模式为主**：ChatGPT、Claude、Gemini、Kimi、豆包等都有免费入口，但高阶推理、Agent和高额度通常收费。

2. **AI编程正在从“代码补全”转向“软件工程Agent”**：Cursor、Claude Code、Codex、GitHub Copilot、TRAE、Qoder和CodeBuddy都在覆盖规划、编码、测试、审查和交付。

3. **真正适合企业私有化的核心工具主要集中在基础设施层**：Ollama、llama.cpp、vLLM、Dify、Cline、OpenHands和ComfyUI。

4. **“开放权重”不能直接等同于“开源且可自由商用”**：部署Qwen、DeepSeek或其他开放模型前，仍需逐一检查模型许可证。

5. **免费产品通常存在额度、速度、排队、分辨率或商业授权限制**。特别是图片、视频、音乐和声音克隆工具，免费生成内容未必允许商业使用。

6. **企业不应无限叠加AI订阅**。更合理的方案通常是：一个主力通用助手、一个办公生态工具、一个编程工具，再配一套私有化Agent和模型平台。

---

[1]: https://openai.com/chatgpt/pricing/ "Pricing"
[2]: https://claude.com/pricing "Plans & Pricing | Claude by Anthropic"
[3]: https://gemini.google/subscriptions/ "Google AI Pro & Ultra — get access to Gemini 3.1 Pro & more"
[4]: https://www.microsoft.com/en-us/microsoft-365-copilot/business "Microsoft 365 Copilot for Business: Enterprise AI Solutions"
[5]: https://www.perplexity.ai/ "Perplexity"
[6]: https://api-docs.deepseek.com/quick_start/pricing/ "Models & Pricing"
[7]: https://www.aliyun.com/product/tongyi "千问大模型_AI大模型_一站式大模型推理和部署服务-阿里云"
[8]: https://www.doubao.com/ "豆包- 字节跳动旗下AI 智能助手"
[9]: https://www.kimi.com/zh-cn/help/membership/membership-pricing "Kimi 会员套餐价格与权益对比"
[10]: https://cursor.com/en-US/pricing "Cursor · Pricing"
[11]: https://windsurf.com/account/upgrade-prompt "Choose Your Plan | Windsurf"
[12]: https://github.com/features/copilot/plans "GitHub Copilot · Plans & pricing · GitHub"
[13]: https://help-lb.openai.com/en/articles/20001106-codex-rate-card "Codex rate card | OpenAI Help Center"
[14]: https://claude.com/download "Download Claude | Claude by Anthropic"
[15]: https://www.trae.ai/blog/trae_membership_0213 "Upgrading TRAE Membership Benefits | TRAE - Collaborate with Intelligence"
[16]: https://docs.qoder.com/zh/account/pricing "价格 - Qoder"
[17]: https://www.codebuddy.ai/docs/ide/Account/pricing "Pricing | Tencent Cloud Code Assistant CodeBuddy – AI Code Editor"
[18]: https://github.com/cline/cline/blob/main/LICENSE "cline/LICENSE at main · cline/cline · GitHub"
[19]: https://github.com/OpenHands/OpenHands/blob/main/LICENSE "OpenHands/LICENSE at main"
[20]: https://www.microsoft.com/en-us/microsoft-365-copilot/pricing "Microsoft 365 Copilot Plans and Pricing—AI for Business"
[21]: https://workspace.google.com/pricing "Compare Flexible Pricing Plan Options | Google Workspace"
[22]: https://www.notion.com/pricing "Notion Pricing Plans: Free, Plus, Business, & Enterprise."
[23]: https://www.grammarly.com/plans "Grammarly Prices and Plans"
[24]: https://www.canva.com/en/pricing/ "Compare Free, Pro, Business and Enterprise plans"
[25]: https://gamma.app/zh-cn/pricing "计划和定价 | Gamma"
[26]: https://www.beautiful.ai/planpricing "Beautiful.ai Pricing and Plans"
[27]: https://otter.ai/pricing?msockid=17be42d5918b64b52da354ea9090655f "Pricing | Otter.ai"
[28]: https://fireflies.ai/blog/fireflies-pricing-which-plan-is-right-for-you/ "Fireflies Pricing: Which Plan is Right For You?"
[29]: https://help.fathom.video/en/articles/729152 "What does Fathom cost?"
[30]: https://www.microsoft.com/en-us/microsoft-365-copilot/enterprise "AI for Enterprise Productivity | Microsoft 365 Copilot"
[31]: https://knowledge.workspace.google.com/admin/generative-ai/workspace-with-gemini/google-workspace-with-gemini "Google Workspace with Gemini | Generative AI"
[32]: https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans "Comparing Midjourney Plans"
[33]: https://www.adobe.com/products/firefly/plans.html "Compare plans that include generative AI | Adobe Firefly"
[34]: https://www.canva.com/canva-ai/ "Canva AI 2.0 – AI design, writing, and creative tools"
[35]: https://github.com/Comfy-Org/ComfyUI/blob/master/LICENSE "license - Comfy-Org/ComfyUI"
[36]: https://runway.com/pricing "AI Image and Video Pricing from $12/month"
[37]: https://www.doubao.com/download/desktop "下载豆包客户端- 激发创造力，即刻提升工作学习效率"
[38]: https://github.com/comfyanonymous/ComfyUI?via=nextoolai "Comfy-Org/ComfyUI: The most powerful and modular ..."
[39]: https://help.elevenlabs.io/hc/en-us/articles/13315218812177-Do-you-offer-discounted-or-free-plans "Do you offer discounted or free plans? – ElevenLabs"
[40]: https://suno.com/pricing?pos=section1 "Suno | Pricing"
[41]: https://dify.ai/ "Dify - The Platform for Production-Ready Agentic Workflows"
[42]: https://github.com/n8n-io/n8n "n8n – The Platform for AI Agents and Workflow Automation"
[43]: https://zapier.com/pricing?price=free "Plans & Pricing | Zapier"
[44]: https://github.com/ollama/ollama/blob/main/LICENSE "ollama/LICENSE at main"
[45]: https://github.com/ggml-org/llama.cpp/blob/master/LICENSE "llama.cpp/LICENSE at master · ggml-org ..."
[46]: https://github.com/vllm-project/vllm/blob/main/LICENSE "vllm/LICENSE at main"
[47]: https://huggingface.co/pricing "Pricing"
[48]: https://openai.com/api/pricing/ "Business Pricing"
[49]: https://platform.claude.com/docs/en/about-claude/pricing "Pricing - Claude Platform Docs"
[50]: https://ai.google.dev/gemini-api/docs/pricing "Gemini Developer API pricing"
[51]: https://aws.amazon.com/bedrock/pricing/ "Amazon Bedrock Pricing"
[52]: https://azure.microsoft.com/en-us/pricing/details/microsoft-foundry/ "Microsoft Foundry - Pricing"
[53]: https://huggingface.co/docs/inference-providers/pricing "Pricing and Billing"
