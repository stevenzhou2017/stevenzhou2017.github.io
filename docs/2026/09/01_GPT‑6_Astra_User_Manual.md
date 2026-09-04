# GPT‑6 Astra 使用手册 V1.0

author: 周均扬

date： 2026.09.04

---

> 文档日期：2026-09-04  
> 适用范围：ChatGPT Work、Codex、OpenAI API  
> 信息口径：仅依据 OpenAI 官方公开资料；功能与可用范围可能随分批发布、订阅计划、地区及管理员设置变化。

## 1. 产品概述

GPT‑6 Astra 是 OpenAI 面向高难度端到端工作的旗舰模型，重点服务于复杂推理、软件工程、计算机操作、浏览与研究、专业知识工作和文档交付。它适合将“理解目标—制定计划—调用工具—执行任务—检查结果—形成交付物”串成一个持续的工作流。

官方模型标识：`gpt-6-astra`

### 1.1 发布时间与开放状态

- 发布日期：2026 年 9 月 3 日。
- 首批开放：Trusted Access Program 中的企业用户。
- 后续开放：API、Plus、Pro、Business 和 Enterprise 计划将在随后数日逐步获得访问权限。
- Enterprise：除处于开放范围内，还需要管理员启用。
- 实际可用性：取决于账号、计划、客户端、地区、组织设置和发布进度。

## 2. 核心规格

| 项目 | GPT‑6 Astra |
|---|---|
| 模型 ID | `gpt-6-astra` |
| 上下文窗口 | 1,050,000 tokens |
| 最大输出 | 128,000 tokens |
| 知识截止日期 | 2026-04-30 |
| 输入模态 | 文本、图像 |
| 输出模态 | 文本 |
| 音频 / 视频原生输入 | 不支持 |
| 推理等级 | `low`、`medium`、`high`、`xhigh`、`max` |
| `none` 推理等级 | 不支持 |
| API | Responses API、Chat Completions |
| 工具调用 | 支持，但 Astra 的工具调用须使用 Responses API |
| Structured Outputs | 支持 |
| Streaming | 支持 |
| Fine-tuning | 不支持 |

## 3. 新特性与新功能

### 3.1 更强的端到端复杂工作能力

Astra 将高级推理、计算机操作、浏览、编码、研究和专业内容生产组合为持续工作流。相较只回答单个问题，它更适合：

- 跨代码库、网页、应用和文档执行多步骤任务；
- 在长任务中保持原始目标、约束和上下文；
- 根据中途反馈调整方向并继续完成工作；
- 对结果执行检查、验证，再生成文档、表格或演示材料。

### 3.2 异步工具调用（Async tool calling）

应用程序执行耗时工具时，Astra 可以继续推理、调用其他工具，或处理任务中互不依赖的部分，无需完全阻塞等待。

实现要点：

1. 在函数工具或自定义工具上设置 `async: true`。
2. 应用负责实际执行工具，并维护待完成调用。
3. 工具完成后，使用原始 `call_id` 返回结果。
4. 适合数据库查询、长时间编译、远程作业、批量检索等耗时操作。

### 3.3 回合中途引导（Mid-turn steering）

模型工作期间，用户可以发送纠正意见、新要求或范围变更。通过 Responses API 的 WebSocket 连接，系统可以保留已完成工作，将新指令合并到继续执行的响应中。

典型用途：

- “停止分析方案 B，集中完善方案 A”；
- “新增 ISO 13849 约束，但保留现有结构”；
- “把交付物改成中文 Markdown 和 Excel”；
- “先回答这个侧问题，之后继续原任务”。

### 3.4 对话中动态调整推理强度

可通过 `configuration_update` 输入项，在同一对话中提高或降低推理强度，同时尽量保留缓存的提示词前缀。

- 常规整理：`low` 或 `medium`；
- 复杂架构、算法、诊断：`high`；
- 高难度、多约束工作：`xhigh` 或 `max`。

更新后的推理配置持续生效，直到新的 `configuration_update` 覆盖它。

### 3.5 更强的指令遵循与任务边界判断

Astra 更善于：

- 遵循长指令和多项约束；
- 在上下文足够时补齐常规细节；
- 仅在缺失信息会显著改变结果时提出聚焦问题；
- 接收新增要求并改变路线，同时保留原任务；
- 更谨慎地尊重授权范围和安全边界。

注意：它也会更敏感地遵循 `AGENTS.md`、技能文件和工作区说明。应定期审计这些文件，避免冲突、过时或隐藏指令影响结果。

### 3.6 更高效的输出

OpenAI 官方说明指出，Astra 在若干评测中以更少的输出 tokens 获得更强结果。虽然单 token 价格更高，但复杂任务的单任务估算成本可能低于早期模型。实际成本仍取决于上下文长度、输出量、推理等级、工具调用和服务层级。

### 3.7 更强的安全与对齐

Astra 增强了越狱鲁棒性、提示注入防护、浏览及工作场景中的授权边界判断，并在受支持的 Responses API 请求中加入异步失配监测。监测可能产生安全警报，或使会话停止并进入审核。

需要特别注意：OpenAI 将 Astra 的网络安全能力评定为 Preparedness Framework 下的 Critical 级别，因此部署了更严格的防护、访问控制与监测。

### 3.8 继承的成熟能力

Astra 继续支持 GPT‑5.6 已有的主要能力，包括：

- Computer use；
- Structured Outputs；
- 流式输出；
- Programmatic Tool Calling；
- 多智能体编排；
- Prompt caching；
- Persisted reasoning；
- Compaction；
- Pro mode；
- Web search、File search、Image generation、Code Interpreter；
- Hosted shell、Apply patch、Skills、MCP、Tool search。

## 4. 如何选择 Astra

### 4.1 适合使用 Astra 的任务

- 需要跨多个步骤、工具或应用完成的复杂工作；
- 大型代码库的架构分析、实现、调试和验证；
- 深度研究、来源核验和专业报告；
- 高约束的文档、表格、演示文稿交付；
- 科学、工程、财务、法律等需要较强判断的专业工作；
- 需要长上下文、持续推理与中途修正的任务。

### 4.2 不一定需要 Astra 的任务

- 简单改写、短摘要、格式转换；
- 大批量、规则清晰、低复杂度任务；
- 对延迟或成本极度敏感的高频请求。

此类任务可考虑 GPT‑5.6 Terra；成本敏感和高吞吐工作可考虑 GPT‑5.6 Luna；复杂但不需要 Astra 全部能力的工作可考虑 GPT‑5.6 Sol。

## 5. ChatGPT Work 使用指南

### 5.1 选择模型

1. 打开 ChatGPT Work 对话。
2. 在输入框附近打开模型选择器。
3. 账号获得开放资格后，选择 Astra。
4. 先使用默认推理强度；只有任务确实需要更深分析时再提高。

不同计划和发布阶段可显示不同选项。符合条件的 Pro、Business（100 美元档）和 Enterprise 账号，Power 选项可能更新为 Terra Light、Sol Light、Sol Medium、Astra Light、Astra Medium 和 Astra Extra High。

### 5.2 推荐任务写法

高质量任务说明应包含：

- 目标：最终要解决什么问题；
- 背景：业务、项目、读者和使用场景；
- 输入：文件、链接、代码、模板或数据；
- 约束：范围、规范、权限、禁止项；
- 交付物：文件格式、结构、命名和语言；
- 验收标准：正确性、完整性、测试和引用要求。

示例：

```text
基于所附 SRS、ICD 和测试记录，审查 Safety Supervisor 的状态机设计。
重点检查：安全动作优先级、通信超时、故障降级、恢复条件及 Trace 可追溯性。
输出：
1. 问题清单，按严重度排序；
2. 修改后的状态迁移表；
3. 缺失测试用例；
4. Markdown 审查报告。
所有结论必须指出证据来源；不确定项单独标注。
```

### 5.3 长任务中的中途修正

模型执行期间可以直接补充：

```text
新增要求：所有安全功能同时对齐 ISO 13849 和 IEC 62061；保留已经完成的分析，更新受影响章节后继续。
```

明确说明“保留什么、改变什么、继续完成什么”，可减少重复工作。

## 6. Codex 使用指南

### 6.1 CLI 选择 Astra

```bash
codex -m gpt-6-astra
```

如果模型尚未出现在账号中，通常表示仍在分批开放、计划不支持、管理员未启用，或当前客户端尚未更新。

### 6.2 推荐工作方式

给 Astra 提供：

- 清晰的完成定义；
- 相关代码库与工作区说明；
- 可运行的构建和测试命令；
- 修改范围、不可修改范围及兼容要求；
- 验证标准与预期交付形式。

示例：

```text
诊断并修复深度帧乱序导致的 Safety Supervisor 误降级问题。
范围仅限 adapter、event_bus 和 supervisor 模块。
先复现问题并确认根因，再修改代码；运行相关单元测试和集成测试。
不要改动公共 ICD。完成后列出变更、验证结果和残余风险。
```

### 6.3 实验性上下文管理

在受支持的 Codex 客户端中，通过 ChatGPT Plus 或 Pro 登录的用户可选择启用实验性上下文管理。Astra 可跨上下文窗口保留笔记，并搜索同一任务更早的消息和工具结果。

在 `config.toml` 中设置：

```toml
[features.context_management]
experimental_mode = true
```

然后启动一个新任务。该功能发布时默认关闭，并且 Business、Enterprise 或 API Key 登录暂不支持。

## 7. OpenAI API 快速入门

### 7.1 推荐：Responses API

Python 示例：

```python
from openai import OpenAI

client = OpenAI()

response = client.responses.create(
    model="gpt-6-astra",
    reasoning={"effort": "medium"},
    input=(
        "分析下面的工业安全需求，输出风险、系统方案、验证用例和残余风险。"
    ),
)

print(response.output_text)
```

JavaScript 示例：

```javascript
import OpenAI from "openai";

const client = new OpenAI();

const response = await client.responses.create({
  model: "gpt-6-astra",
  reasoning: { effort: "medium" },
  input: "审查所附接口契约并输出兼容性风险和修改建议。",
});

console.log(response.output_text);
```

### 7.2 Structured Outputs

当下游系统需要稳定字段时，应使用 Structured Outputs，而不是依赖自然语言格式。

典型结构：

```json
{
  "risk_level": "high",
  "findings": [],
  "recommended_actions": [],
  "evidence": [],
  "uncertainties": []
}
```

Schema 应设置明确类型、必填字段、枚举和嵌套边界，并在应用侧继续做业务验证。

### 7.3 工具调用

Astra 进行工具调用必须使用 Responses API；Chat Completions 可用于非工具型文本请求，但不能用于 Astra 的 function calling。

工具设计建议：

- 工具名称表达明确动作；
- 参数使用严格 JSON Schema；
- 区分只读、写入和高风险操作；
- 在应用层执行权限校验与幂等控制；
- 返回结构化错误、可重试信息及 `call_id`；
- 长耗时工具考虑设置 `async: true`。

### 7.4 推理等级设置

```python
response = client.responses.create(
    model="gpt-6-astra",
    reasoning={"effort": "high"},
    input="完成复杂系统故障树分析。",
)
```

不要设置 `none`，否则会返回 HTTP 400。若旧应用使用 `none` 或 `minimal`，迁移时先改为 `low` 并进行效果、延迟和成本评测。

## 8. 从旧模型迁移

### 8.1 必改项目

1. 将模型设为 `gpt-6-astra`。
2. 工具调用迁移到 Responses API。
3. 删除 `temperature`、`top_p`、`top_logprobs`。
4. Chat Completions 还应删除 `logprobs`。
5. Responses 请求应从 `include` 中删除 `message.output_text.logprobs`。
6. 将 `none` 或 `minimal` 推理等级改为 `low`。

### 8.2 Prompt caching 变化

从 GPT‑5.5 或更早模型迁移时，将旧的 `prompt_cache_retention` 替换为：

```json
{
  "prompt_cache_options": {
    "ttl": "30m"
  }
}
```

应重新核对缓存边界、缓存写入计费，以及长上下文请求的成本影响。

### 8.3 迁移验证清单

- [ ] 核心任务质量不低于原模型；
- [ ] Structured Outputs 仍通过 Schema 校验；
- [ ] 所有工具调用完成且 `call_id` 正确关联；
- [ ] 延迟、token 用量和单任务成本满足目标；
- [ ] 安全拒绝和授权边界符合业务要求；
- [ ] 长上下文、超时、重试和流式输出正常；
- [ ] 429 `slow_down` 与 503 `server_is_overloaded` 分别处理；
- [ ] 提示词、技能文件和 `AGENTS.md` 无冲突指令。

## 9. 提示词最佳实践

### 9.1 让模型更主动完成任务

如果业务希望模型在常规细节上合理推断并持续执行，可写：

```text
根据任务说明和已有上下文推断用户意图与工作范围。对于不会实质改变结果的常规细节，作出合理假设并继续；只有缺失信息会显著改变结果或涉及额外授权时，才提出聚焦问题。持续工作直到交付物完成并验证。
```

### 9.2 控制输出风格

Astra 默认倾向使用较详细的 Markdown、列表和表格。若希望更简洁，应明确指定：

```text
先给结论，再给必要依据。使用简洁段落；只有并列比较和操作步骤使用列表或表格。避免重复总结，技术术语首次出现时给出简短定义。
```

### 9.3 控制多智能体委派

模型具备多智能体编排能力，但是否委派及委派程度应由应用规则明确约束。例如：

```text
只有存在两个以上互不依赖、可以并行完成的子任务时才使用子智能体；涉及同一文件或共享状态的修改由主智能体统一完成。
```

### 9.4 控制测试范围

```text
运行与变更直接相关且能验证实际行为的测试。测试通过后，只有发现新的失败、依赖影响或未解决风险时才扩大测试范围。
```

## 10. 定价与成本控制

### 10.1 Standard 文本 token 价格

单位：美元 / 100 万 tokens。

| 项目 | 短上下文 | 超过 272K 输入 tokens 的长上下文 |
|---|---:|---:|
| 输入 | $10.00 | $20.00 |
| 缓存输入 | $1.00 | $2.00 |
| 缓存写入 | $12.50 | $25.00 |
| 输出 | $50.00 | $75.00 |

说明：

- 输入超过 272K tokens 时，整个请求按 2 倍输入及缓存费率、1.5 倍输出费率计算。
- 缓存写入按未缓存输入价格的 1.25 倍计费。
- Batch 和 Flex 为 Standard 价格的 50%。
- Fast mode 为适用费率的 2 倍。
- 工具型能力可能另外按工具调用收费。

### 10.2 成本优化建议

- 固定系统提示词、Schema 和公共资料放在上下文前部，提高缓存复用；
- 常规任务优先使用 `low` 或 `medium`；
- 避免重复上传未变化的大文件；
- 先用检索缩小材料范围，再交给 Astra 综合；
- 对高频简单任务使用 Terra 或 Luna；
- 用 Structured Outputs 减少格式返工和二次解析；
- 记录每类任务的输入、输出、缓存命中、延迟和成功率，以单任务成本而非单 token 价格评估。

## 11. 限制与注意事项

- 不支持 `reasoning.effort = none`。
- 不支持自定义 `temperature`、`top_p` 和 log probabilities。
- Astra 工具调用不支持 Chat Completions，须使用 Responses API。
- 不支持 Fine-tuning。
- 模型原生不支持音频和视频输入输出。
- EU 数据驻留下不可使用 Astra 的 Fast mode；官方同时说明 Fast mode 不提供延迟 SLA。
- 知识截止日期为 2026-04-30；涉及此后事件必须使用实时来源或工具核实。
- 超长上下文会显著影响成本，且“能放入”不代表“应该全部放入”。
- 高风险自动化必须在应用层保留权限控制、确认、审计、回滚和安全边界，不能仅依赖模型判断。
- 对安全关键工业场景，模型输出应作为增强层，不应替代经过认证的功能安全回路和最终工程验证。

## 12. 常见问题与排错

### Q1：模型列表里没有 Astra

检查账号是否已进入分批开放范围、订阅计划是否支持、客户端是否更新、Enterprise 管理员是否启用，以及当前地区或登录方式是否受限。

### Q2：API 返回推理等级错误

确认未使用 `none` 或 `minimal`，改为 `low`、`medium`、`high`、`xhigh` 或 `max`。

### Q3：工具调用失败

确认使用 Responses API。Astra 的 Chat Completions 不支持 function calling。

### Q4：请求参数报错

删除 `temperature`、`top_p`、`top_logprobs`、`logprobs`，并检查 Responses 的 `include` 中是否仍有 `message.output_text.logprobs`。

### Q5：请求返回 429 或 503

- 429 且错误码为 `slow_down`：流量增长过快；按 `Retry-After` 等待，若无该响应头则指数退避。
- 503 且错误码为 `server_is_overloaded`：模型暂时过载；同样优先遵循 `Retry-After`，否则指数退避。

### Q6：模型频繁询问，未继续执行

在提示词中说明允许其对常规细节作合理假设，并清楚定义仅在“会显著改变结果、涉及权限或存在不可逆风险”时询问。

### Q7：输出过长或格式太复杂

明确规定最大篇幅、章节、表格数量和信息密度；要求“结论优先，只保留决策所需依据”。

## 13. 企业部署建议

### 13.1 上线前

- 建立典型任务评测集和旧模型基线；
- 评估正确性、完成率、工具成功率、延迟和单任务成本；
- 审计系统提示词、技能、连接器、`AGENTS.md` 和数据权限；
- 为写入、删除、交易、发布等操作设置明确确认和审批；
- 对提示注入、越权、错误工具参数及恶意文档进行红队测试。

### 13.2 运行中

- 记录模型版本、提示词版本、工具调用、结果和人工干预；
- 区分 429 流量增长与 503 临时过载；
- 监控错误率、回退率、人工接管率和安全告警；
- 对高风险工作设置人工复核和可恢复操作；
- 定期回归验证模型、提示词、工具和知识源变更。


## 14. 快速检查清单

- [ ] 账号已获得 Astra 访问权限；
- [ ] 复杂任务才选择 Astra；
- [ ] 任务中写明目标、约束、交付物和验收标准；
- [ ] API 模型名为 `gpt-6-astra`；
- [ ] 工具调用使用 Responses API；
- [ ] 推理等级不是 `none`；
- [ ] 未传入不支持的采样和 logprobs 参数；
- [ ] 大于 272K 输入 tokens 前已核算长上下文价格；
- [ ] 高风险工具具备授权、审计和回滚；
- [ ] 已用真实业务评测集完成回归验证。

## 15. 官方资料

1. [GPT‑6 Astra 模型规格](https://developers.openai.com/api/docs/models/gpt-6-astra)
2. [GPT‑6 Astra 模型使用与迁移指南](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra)
3. [OpenAI API Changelog](https://developers.openai.com/api/docs/changelog)
4. [ChatGPT Work / Codex 模型选择](https://learn.chatgpt.com/docs/models)
5. [ChatGPT Work / Codex What's New](https://learn.chatgpt.com/docs/whats-new)
6. [OpenAI API 定价](https://developers.openai.com/api/docs/pricing)
7. [GPT‑6 Astra 安全概览](https://openai.com/index/safety-overview-gpt-6-astra/)

---

版权与更新说明：本手册为基于 OpenAI 官方公开资料整理的中文使用指南，不替代官方文档、服务条款、组织政策和安全要求。使用前请复核最新官方文档。
