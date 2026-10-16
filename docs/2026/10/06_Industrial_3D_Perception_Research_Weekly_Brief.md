# 工业三维感知每周研究简报｜Industrial 3D Perception Weekly Brief

author：周均扬

date：2026.10.16

---

**覆盖窗口 / Coverage:** 2026-10-10 — 2026-10-16；同时纳入上一期截稿后首次被可靠检索到的实质性工作。  
**关注范围 / Focus:** ToF/iToF、RGB-D/IR-D 标定与配准、深度/点云、3D 定位、AI 空间推理。  
**证据边界 / Evidence boundary:** 所有性能数字均为作者或厂商公开陈述，不能替代独立 V&V、功能安全认证或现场验收。

## 一页结论 / Executive takeaways

| 排名 | 工作 | 工程价值 / Engineering value | 建议 |
|---|---|---|---|
| **1** | **DepthWorld / DROID-3D** | 将同一机器人跨任务数据放入联合因子图，协同估计共享运动学参数、场景外参与米制深度；直接启发产线相机“跨批次标定”与数字孪生数据治理。 | **复现 / Reproduce** |
| **2** | **RoTA-Bench** | 证明 VLM 能改善投影外观却恶化真实 3D 位姿；为 VLA/空间智能体增加“图像成功≠物理成功”的可执行测试。 | **集成评测 / Integrate evaluation** |
| **3** | **Good Visual Representation for Spatial Understanding** | 分离“传什么几何表示”和“如何传入 MLLM”，说明显式深度/点图简单拼接收益有限，必须保留可解码几何监督。 | **跟踪并基准 / Track + benchmark** |

**本周仍未发现达到入选门槛的纯 ToF/iToF 新算法、RGB-D/IR-D 工业标定标准或安全级深度相机 SDK 更新。** 新出现的贺赛 Kosmo 属空间数据采集产品，但公开资料尚不足以判断测距精度、同步、标定、SDK、环境光与高反/低反性能，因此暂不纳入 Top 3。

## Top 1 — DepthWorld: 3D World Model for Robot Manipulation / DROID-3D

- **发布日期 / Date:** 2026-10-06；本周首次可靠浮现，CoRL 2026 接收
- **来源 / Source:** [arXiv:2610.08780](https://arxiv.org/abs/2610.08780) · [项目页 / project page](https://www.jaibardhan.com/depthworld)
- **问题 / Problem:** 机器人视频世界模型常只优化 RGB，生成序列逐帧“看起来合理”，却无法组成一致的米制 3D 世界；大规模机器人数据中的外参与运动学误差又会污染深度监督。
- **核心方法 / Core method:** 用学习式双目深度和联合因子图，把同一物理机器人采集的全部 episode 汇总，联合恢复共享运动学参数与逐场景外参，形成 DROID-3D；随后以 spatial latent tiling 让 Stable Video Diffusion 同时预测多视图 RGB 与深度，而不改动预训练 VAE。
- **证据 / Evidence:** DROID-3D 提供稠密米制深度与重新标定的多视图外参；作者报告外部相机在 **90% episode 上重投影误差 <0.7 px**。在相同训练预算下，加入深度监督使 RGB 预测相对 RGB-only 基线提升 **+1.48 dB PSNR**。
- **局限 / Limitations:** 重投影误差不等于绝对深度/位姿误差；学习式双目深度可能把纹理、反光与遮挡偏差带入因子图。论文未给出面向工业相机的温漂、滚动快门、同步偏差、高反/低反和最坏时延测试；世界模型生成深度可能产生结构合理但物理错误的区域。
- **工程成熟度 / Engineering maturity:** **研究级、数据工程价值高 / Research-grade with high data-engineering value.** 标定思想可落地，生成式世界模型尚不适合安全链。


## Top 2 — RoTA-Bench: Evaluating 3D Spatial Reasoning through Interactive Projection Alignment

- **发布日期 / Date:** 2026-10-13；v2 2026-10-14
- **来源 / Source:** [arXiv:2610.17665](https://arxiv.org/abs/2610.17665)
- **问题 / Problem:** 常规 VLM 评测只看文字答案或最终图像相似度，不能判断模型能否把 2D 观察转换为精确、连续、可闭环的 3D 动作。
- **核心方法 / Core method:** 从 2D 图标构造保持轮廓的 3D 物体，通过可逆初始化保证任务可解；模型观察旋转物体并连续选择旋转动作，使投影匹配目标轮廓。评测同时跟踪图像空间进展、真实位姿进展、动作粒度与历史依赖。
- **证据 / Evidence:** 共 **674 个任务**、分层 100 任务测试集。作者报告 GPT-5.6-Sol 成功率仅 **17%**，20 名本科生合计四轮完成测试集，成功率 **100%**。在匹配状态下，模型“轮廓变好但位姿变差”的比例为 **19.4%**，人类为 **10.9%**；移除交互历史后，**96.8%** 动作停留在粗粒度 30° 步长。
- **局限 / Limitations:** 合成物体、旋转动作和轮廓目标与真实机器人接触任务存在差距；成功率受提示、模型版本、动作接口影响。未涉及传感器噪声、标定误差、碰撞约束、实时周期与安全停止。
- **工程成熟度 / Engineering maturity:** **评测框架级 / Benchmark-grade.** 适合 V&V，不是可部署控制器。


## Top 3 — What Makes a Good Visual Representation for Spatial Understanding in MLLMs?

- **发布日期 / Date:** 2026-10-13（NeurIPS 2025 工作的扩展版）
- **来源 / Source:** [arXiv:2610.17844](https://arxiv.org/abs/2610.17844)
- **问题 / Problem:** 大量方法向 MLLM 注入深度、点图或 3D latent，但常混淆“表示本身好不好”和“融合/蒸馏机制是否合适”，导致工程选型缺乏可比性。
- **核心方法 / Core method:** 对比 3D 几何、自监督图像/视频、VLM 与生成模型的 latent 或显式深度/点图，并分别采用蒸馏或输入融合。用跨视图一致性衡量 latent 的 3D 结构，用深度/重建精度衡量显式几何；再将 latent 与显式几何共同蒸馏到 RGB-video MLLM。
- **证据 / Evidence:** 作者发现表示的 3D 结构与下游增益强相关；latent 通过融合或蒸馏都能获益，而显式几何直接融合收益很小，其蒸馏收益主要依赖几何解码头。联合蒸馏模型仅以 RGB 视频输入，在静态 3D 与动态 4D 空间推理基准上均优于基础模型。
- **局限 / Limitations:** 摘要未给出工业场景绝对精度、推理时延、边缘硬件占用和不确定性校准；RGB-only 仍无法恢复被遮挡或物理不可观测的信息。基准提升不能证明毫米级定位或安全能力。
- **工程成熟度 / Engineering maturity:** **方法论研究级 / Methodological research.** 对模型架构决策有价值，距离 SDK 模块化集成仍远。


## 产品与跨域观察 / Product and cross-domain watchlist

### Hesai Kosmo 3D Spatial Camera

- **公布日期与来源 / Date & source:** 2026-10-14 · [Reuters 报道](https://www.reuters.com/technology/chinas-hesai-launches-spatial-camera-boost-ai-powered-robotics-adoption-2026-10-14/)
- **问题与方案 / Problem & approach:** 将 LiDAR 与相机组合为便携式空间数据采集设备，面向人形机器人训练所需的真实世界 3D 数据。
- **已知证据 / Evidence:** 厂商称已与中国机器人企业达成采用协议，并把 Kosmo 的精细建图用于机器人冰淇淋服务演示；报道引用 **99% 任务成功率**，但该数字无法分离相机、机器人手、策略和场景控制的贡献。
- **限制与成熟度 / Limits & maturity:** 截至本期未检索到足够的官方数据表、测距范围/精度、时间同步、外参稳定性、原始数据接口、SDK、IP 等级或环境/材料失效规格。


### Registration is a Representation Problem（PET/CT 跨域借鉴）

- **发布日期与来源 / Date & source:** 2026-10-13 · [arXiv:2610.18804](https://arxiv.org/abs/2610.18804)
- **方法与证据 / Method & evidence:** 用 3D 基础模型的细粒度体素语义与分割模型的粗结构身份共同驱动 GPU 迭代配准，并加入病灶体积保持约束；无需任务专项训练，获 Learn2Reg 2026 PSMAReg 第一名。
- **局限 / Limitations:** 医学体数据与工业点云域差异很大，不能直接迁移性能结论。


## 技术趋势 / Technology trends

1. **标定从单次作业走向跨数据集联合估计 / Calibration becomes fleet-level estimation:** 共享运动学与逐场景外参共同优化，比每段独立校准更适合长期设备治理，但要求版本、残差与异常 episode 可追溯。
2. **二维成功指标正在失效 / 2D success metrics are insufficient:** 轮廓、PSNR 或 VLM 回答正确不保证 SE(3)、距离与碰撞裕量正确；安全 V&V 必须使用物理指标。
3. **几何表示需要匹配注入机制 / Representation and transfer mechanism must match:** 显式深度/点图简单拼接并不等于空间理解；几何解码头和跨视图一致性更值得投资。
4. **空间数据产品升温，但安全规格缺位 / Spatial-data products rise without safety evidence:** 新设备强调机器人训练数据，却普遍未公开材料失效、环境鲁棒性、同步和安全完整性证据。
