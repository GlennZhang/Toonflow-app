# 视频模式、模型模板与声音知识

用于视频准备与验收。先读取已确认分镜、制作单元及真实参考，再只读本文件中本次适用模板；风格使用 [视觉风格](visualStyles.md) 的当前确认条目，镜头、计时与连续性用 [镜头知识](shotCraft.md)。本文件吸收 v1.1.8 的四份模型提示词，另按 MiniMax H3 官方提示词技能（[h3PromptWriting](../../../h3PromptWriting/SKILL.md)）补充 H3 模板；不引入其他 workflow 的 Seedance 路由或默认模型。

## 先选实际输入模式

| 已确认能力与路线 | 可采用的旧版模板 | 制作单位 |
|---|---|---|
| Seedance 2.0，实际可用的文本多参输入 | 下文中文三段式 | 一个确认片段，包含原有全部子镜头 |
| Wan 2.6，实际支持单图首帧 | 下文英文叙事单首帧 | 一个确认镜头及一张首帧 |
| 已确认首帧/首尾帧，要求连续镜头 | 下文 Visual/Motion/Camera/Audio/Narrative | 一个已确认连续动作单元；本流程首帧路线默认每镜一单元 |
| 其他实际可用的多参模式 | 下文 References/Instruction | 一个确认片段；真实分镜图可有可无 |
| MiniMax H3 系（官方 API / 秘塔 / ComfyUI），T2VA/I2VA/FL2VA/L2VA 输入 | 下文 H3 三核心字段 | 一个确认镜头（FL2VA/L2VA 单镜优先） |
| MiniMax H3 系，Ref2VA 多参考（图/视频/音频） | 下文 H3 Ref2VA 六段式 | 一个确认片段；可承载跨镜单元与音频参考 |

这张表是内容模板选择，不是模型兼容性白名单。先查模型支持的媒体类型/数量、模式、时长、分辨率、声音与当前节点配置。未指定模型先确认，不因出现“短剧”就选 Seedance；2.5 或其他版本不能冒称已被 v1.1.8 模板验证。

旧 generateVideoPrompt 路由实际优先级为：数据库已绑定且可读的自定义模型提示词 → 模型名包含 wan 和 2.6 → 名称匹配 Seedance 2.0/2-0 → 首尾帧相关 mode → 字符串数组形式的多参 mode → 通用提示词配置备选。Wan 分支注释写“首尾帧”，实际加载文件和正文都是单图首帧，不能据注释要求尾帧。这些是旧路由事实，当前不访问旧数据库或拼旧 mode 字符串；用户明确选择的模板与当前 schema 优先。

旧通用模板假定收到 12 项 videoDesc 字段、分镜图标志等，真实路由最终只注入 videoDesc 和 duration。迁移时直接读取本集保存的完整分镜、节点输出和采用记录，不因旧模板写过某字段就认为它实际存在。

## 所有模板共用的内容约束

1. 先列单元来源、原镜号顺序、完整台词、声音、动作起终状态、实际参考及总时长；不重新分组、不合并已确认镜头。
2. 一份提示词只服务当前制作单元。开头或正文的说明要与实际输入一致；资产图负责身份/外观，分镜图负责该镜构图，不把角色三视图说成首帧画面。
3. 图像、视频、音频必须是真的媒体输入，不是 URL 字符串、文件名或虚构编号。统一输入序列与供应商分类型请求的映射按 [画布执行](../canvasOperations.md) 核对；无法证明映射时停在待确认，不自行改编号。
4. 模板出现 {{ref N}} 时只是宿主执行引用占位，编号须回读后填写。旧 @图N / @图片N 不直接照抄；尤其不能沿用旧模板把音频称为“图片”。
5. 说话者与声音归属明确。普通对白有对应口型；OS/VO 不让画面人物跟着张嘴，听者反应镜也不转移说话人。所有台词保持原语言原字句。
6. 动作写可见过程、速度和结束状态，情绪通过姿态/视线/呼吸体现；不添加台词、动机、地点、人物或装饰事件。
7. 继承已采用场景光照和视觉风格；不根据旧英文示例另造黄昏、冷调、服装或风向。旧模板光影段仅在确认输入确有相应信息时保留。
8. 默认只用真实环境声、动作声，不自行配乐。画内文字与画外字幕分开；不能为了默认“无文字”删掉剧本中的信件、招牌、屏幕信息或用户明确字幕需求。
9. 时长在画布配置与台词容量中必须明确，即使所选写作模板不在 prompt 正文写秒数，也不能交给模型随意推断。单元上限为本流程 15 秒与实际模型能力较小者；不兼容则回分镜确认。

## Seedance 2.0 中文文本多参

沿用旧模板“三段式”：先定义主体/场景/道具，再依原镜号写全部镜头，最后给简短风格与稳定性约束。只适用于本次确认采用该模型及输入模式时；不强制其他模型改成这套语法。

### 填写方法

- 第一段把每个实际参考与两三个核实过的稳定特征绑定，角色用 <主体1>、场景用 <场景1>、道具用 <道具1>；三类标签分别编号。标签是 prompt 内部指代，不是节点 ID。
- 同场已有确认承接说明，原样放在定义之后，作为首镜起始状态。新场首片段不强行写承接；实际上一段输出还未采用时只记规划状态。
- 一镜对应原分镜一条，不跳镜、不调序。每镜按“景别及主要运镜 → 动作/表情 → 位置与朝向 → 台词/音效”组织。
- 一镜使用一个主要运镜；正文用原镜号，不写绝对时间轴。旧模板认为精确秒数表达不稳定，因此采用此写法；真实时长仍配置在节点并留在单元说明。
- 台词用花括号，音效用尖括号；不把内部资产 ID、工具调用、审核说明塞进执行 prompt。

~~~text
将 {{ref 1}} 中的[已核实的稳定身份特征]定义为 <主体1>（角色A）；
将 {{ref 2}} 中的[已确认空间锚点]定义为 <场景1>（场景名）；
将 {{ref 3}} 中的[已确认结构特征]定义为 <道具1>（道具名）。

[有则逐字保留：承接上镜的确认说明]

镜头1：[景别 + 一个主要运镜]。<主体1> 在 <场景1> 的[位置]面朝[方向]，
[确认动作及表情的可见演进]，与 <道具1> [真实互动]。
<主体1> 说 {原台词}，音色：[已确认声音特征或真实音频引用]。<[具体声源]>。
镜头2：[原分镜的下一镜，沿用身份、道具归属与前镜结束状态]。
[无台词镜只写无台词及实际音效；OS/VO使用对应标注并保持人物不对口型]

[当前已确认风格的必要短标签]；主体身份与脸部稳定，动作连贯，
保持明确的角色差异和空间关系，无无依据分身、水印或画外覆盖文字。
~~~

音色只在有语音时安排。已有确认音频样本且模型支持该输入时，绑定该角色真实音频；无样本不强制用户提供。可按“年龄感、音高、清亮/沙哑等质感、厚薄、发音、气息、语速、情绪特征”提出简洁声音方案，未经确认不把旧表按性别/反派身份给出的默认声音当事实。无需九个维度都堆满，也不能给没有声音能力的模型许诺音色控制。

~~~text
普通对白：<主体1> 说 {原台词}，音色：[确认描述]；只有该说话者口型对应。
内心独白：<主体1> 内心OS {原台词}，音色：[确认描述]；嘴部不随声音开合。
画外音：画外音VO {原台词}，[明确声音来源]；在画人物不跟随旁白对口型。
无台词：无台词，<[需要的环境声或动作声]>。
~~~

约束包只加本单元需要的项。普通多主体场景可明确人数与辨识特征，防止克隆；剧情确有双胞胎不能套旧“禁止外形相同人物”删角色。不能因旧模板多人动态例子写“固定机位”就覆盖用户确认的跟拍。

## Wan 2.6 单图首帧

输入是一张已采用首帧和一个确认镜头。用英文叙事段落：风格基调 → 主体动作和环境 → 摄像机收尾。没有尾帧，不使用参考编号；首帧仍通过真实图像输入传入。

人物只写由首帧核实的少量识别特征，重点放在接下来怎么动。情绪用动作暗示，例如“目光下落、肩膀缓慢沉下”须是确认表演，不能用模板凭空增加。不用 4K、cinematic、high quality 反复堆砌，不靠英文翻译更改台词语言。

~~~text
[A concise sentence expressing the approved visual style.]
[Character name and a few verified identity features] begins in [the exact adopted first-frame state],
then [the confirmed action, pace and emotional progression], ending in [the confirmed end state].
[The verified setting, relevant object and spatial relationship; no invented scenery.]
[Only an already approved and consistent lighting constraint, if necessary.]
"[原语言完整台词]" — [Speaker] (dialogue / inner monologue, OS / voiceover, VO).
[Specific environmental and action sounds, or No dialogue where applicable.]
Captured in [starting shot size and angle], [the confirmed camera movement and endpoint],
as one continuous shot.
~~~

无台词时删台词行，写 No dialogue；有 OS/VO 时明确人物 silent lips。模板正文不写秒数，节点 duration 仍使用已确认值。旧路由只凭名称命中不能证明今天的 Wan 节点支持同样音频或时长，遇能力冲突先调整方案确认。

## 通用首帧/首尾帧五段式

用于用户已确认的连续镜头：首帧给起始状态，尾帧仅在当前模式支持且实际需要时使用。纯文本描述主体，不在正文内编号引用帧；起尾帧位置由真实模式/输入绑定。

~~~text
[Visual]
[Character A]: [verified identity anchors], [starting position and posture], [speaking/silent].
[Character B, if present]: [verified identity anchors], [position], [speaking/silent].
[Confirmed setting, relevant prop and approved style.]

[Motion]
0s-[t1]s: [The first confirmed action and state change].
[t1]s-[total]s: [The subsequent confirmed action ending in the adopted end-frame state if supplied].

[Camera]
[Starting size and angle], [one continuous camera path and final framing],
single continuous take, no cuts.

[Audio]
[Actual planned interval]: "[原语言完整台词]" — [speaker] (dialogue, lip-sync active).
[OS/VO, if present, with silent lips; other characters remain silent].
[Specific environmental and action sounds].

[Narrative]
[The existing dramatic beat and its relation to this confirmed unit; no added event].
~~~

时间轴只在该模板且真实模式适合时使用，每段至少 1 秒、连续覆盖已确认总时长；秒数需按对白容量和动作分配，不平均切块、不捏造精确控制保证。说话状态可以随区间变化；不同人物各有台词时明确谁何时 speaking，其他时段 silent，不把角色永久标 silent。

首尾帧不得表现无法在给定时长内完成的位移/形变，也不能用“无切镜”把原来两场硬拼成一个空间。旧模板示例含多个分镜，但其正文要求一个连续镜头；若现有确认单元包含真实切镜，回模式/分镜确认，不自行删镜去适配。

## 通用多参 References/Instruction

适用于其他真实可用多参模式。保留“参考用途清单 + 英文执行说明”，画面身份由实际参考承担；台词保持原文，时长在节点配置中明确。

~~~text
[References]
{{ref 1}}: [Character A identity reference].
{{ref 2}}: [Confirmed scene reference].
[Only list other real inputs; describe their actual type and purpose.]

[Instruction]
[Approved visual style in a short phrase].
Shot [original number]: [Shot size and camera move].
The character from {{ref 1}} [confirmed action and expression],
[explicit screen position, facing direction and interaction],
in the environment of {{ref 2}}.
"[原语言完整台词]" — [speaker] (dialogue / inner monologue, OS / voiceover, VO).
[Specific physical sounds; other characters' lip-sync state when needed].
Shot [next original number]: [Next confirmed shot with matching continuity].
[Retain the confirmed ending state and exclude only unrequested overlays or duplicates].
~~~

如果实际接入了本镜已采用分镜图，可加“Use {{ref N}} as the composition reference for shot K”；缺分镜图便不写这句、不分配假编号，资产参考仍然有效。若整单元确实无媒体输入且模型允许，使用已确认的纯文本路线与可读主体名，不假装多参参考存在。

旧通用文件同时写“单条分镜不做跨镜”却用跨分镜示例，又在无分镜图时禁止所有引用；迁移保留其参考与正文分离的写法，以本集确认单位与真实输入为准。多镜只在当前模型/模式和已确认分组允许时使用，不能从这个模板推出所有多参模型都支持镜头切换。

## MiniMax H3 三核心字段（T2VA/I2VA/FL2VA/L2VA）

MiniMax H3 官方提示词结构，适用于 H3 系（官方 API / 秘塔 / ComfyUI）。五种模式共享同一正文，只在开头多一行**关键帧对齐指令**：

- T2VA（纯文本）：无指令行，直接从三核心字段开始；
- I2VA（首帧图）：`For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.`；
- FL2VA（首尾帧）：`How the reference pictures align with the target video — Picture 1 (from Shot 1) aligns with the 0.00-second mark of the target video; Picture 2 (from Shot N) aligns with the S.SS-second mark of the target video.`；
- L2VA（尾帧）：`How the reference pictures align with the target video — <Picture 1> (from [Shot N]) aligns with the S.SS-second mark of the target video.`。

`N` 为实际末镜序号，`S.SS` 为有效时长（两位小数）。指令行必须是第一行，后空一行再接正文。正文三字段**顺序固定**：`integrated_multimodal_description`（画面/动作/镜头/说话人/台词/画内音沿时间线展开）→ `overall_soundscape`（1-4 句概括环境声、动作声、人声非语言声）→ `non_diegetic_music`（1-3 句画外配乐；**用户未明确要求配乐时写 `N/A`**，不借字段自行作曲——这是对共用约束 8 的 H3 落地写法）。

写法要点：

- `[Shot 1]` 开头声明风格（Cinematic / live-action / 2D-animated / 3D CG / claymation / watercolor / vintage film 等，关键帧模式从参考图推导）与初始构图；后续镜头 `[Shot 2] At 00:03.500, the camera cuts to ...`，切镜时间戳严格递增且落在已确认 duration 内（首镜不加时间戳）；
- 台词用 `<d>[语言] 原台词</d>` 包裹，说话人用稳定 ID `(S1)`/`(S2)`，首次出现时在 `<d>` 外写清身份与声音特征；台词逐字保留不翻译。OS/VO 用固定短语 `says in an off-screen voiceover` 并紧接说明画面人物嘴唇不动；
- 运镜按官方三要素写：类型（Zoom In/Out、Push In/Pull Out、Pan Left/Right、Truck Left/Right、Tilt Up/Down、Pedestal Up/Down、Arc Shot、Tracking Shot、Static Shot、POV、Roll、Shake）+ 可选幅度（with small/large amplitude）+ 可选速度（at slow/fast speed），写成自然英文动作句而非句尾堆标签，例如 `The camera pushes in with small amplitude at slow speed toward the folded letter in her hands.`；
- 画内可见文字用英文双引号原样保留，如 `A red neon sign reading "营业中" glows above the doorway.`。

~~~text
[关键帧对齐指令行；T2VA 无此行]

integrated_multimodal_description: [Shot 1] [已确认风格], [初始构图与主体外观/位置].
[The camera + 三要素运镜] as [确认动作与表情的可见演进].
[说话人身份描述] (S1) says: <d>[语言] 原台词</d>.
[Shot 2] At 00:0S.SSS, the camera cuts to [新信息：主体/空间/状态/视点/时间],
[沿用身份与前一镜结束状态的确认动作].

overall_soundscape: [环境声、动作声、非语言人声的 1-4 句概括；不重复台词].

non_diegetic_music: [乐器、速度、节奏与动态的 1-3 句描述；无配乐写 N/A].
~~~

I2VA 从 `<Picture 1>` 的主体/构图/场景锚点出发向前发展（首帧锚定 → 动作发生 → 连续发展 → 结果或反应）；FL2VA 重点写首尾帧之间的运动路径，优先单镜插值；L2VA 从合理的前一状态逐渐收敛落到尾帧。完整字段规则、切镜/跨镜台词衔接（`<scenetrans>`/`<cutoff>`）与全部示例见 [h3PromptWriting](../../../h3PromptWriting/references/base-en.txt)。

## MiniMax H3 Ref2VA 六段式

H3 全参考模式（多图/视频/音频参考）的改写格式，六段**顺序固定**，全部用英文写（台词、歌词与画内可见文字保留原语言）：

~~~text
subject_definitions: [逐行定义每个引用标签：标签 + 来源资产 + 引用角色 + 须保持的特征].
summary: [任务类型前缀] + 一段话概括目标视频与引用关系.
retention_analysis: 逐行 [标签] (出现位置/角色): [保留标记] - [具体说明].
detailed_description: [按播放顺序逐镜写全构图、主体、环境光照、动作、运镜、当前声音、引用生效点].
overall_soundscape: [同三核心字段写法].
non_diegetic_music: [同三核心字段写法；无配乐写 N/A].
~~~

- 四类标签全程一致，不在后文引入新标签：`<Subject N>`（从参考资产抽象出的可复用可见内容：人物/场景/服装/道具/风格/动作，同一主体多来源合并为一个标签）；`<Picture N>`（作为具体帧锚或分镜构图锚的参考图）；`<Video N>`（整段视频关系：剪辑源、续接起点、时间结构参考）；`<Audio N>`（音频信号：复制、配乐风格、音色参考、台词/音效引用、节奏连续性）；
- summary 的任务类型前缀按实际角色组合（用 ` + ` 连接、不重复）：`keyframe completion`（图像作具体帧锚）、`reference generation`（资产提供生成引导）、`video editing`、`video continuation`、`audio reuse`、`audio reference`；
- retention_analysis 的关系标记为固定英文值：可见内容用 `fully_preserved` / `partially_preserved` / `attribute_transfer` / `weak_reference`，音频用 `fully_copy` / `partially_copy` / `reference` / `weak_reference`；
- `detailed_description` 要尽量详尽具体，每镜写清当前构图、主体外观与位置、环境光照、动作与状态变化、运镜、当前声音及引用内容实际出现/生效的时点；不得降级为剧情梗概或引用关系清单。

完整标签规则、任务类型判定与完整示例见 [h3PromptWriting](../../../h3PromptWriting/references/ref-en.txt)。

### {{ref N}} 与 H3 标签的换算

宿主 `{{ref N}}` 是统一输入序列占位；写入 H3 prompt 前按用途**重新分类并各自独立编号**，成稿中不得残留 `{{ref N}}` 字面量：

| {{ref N}} 的实际用途 | 换算为 | 说明 |
|---|---|---|
| 首/尾/关键帧锚定图（I2VA/FL2VA/L2VA/分镜构图锚） | `<Picture 1>`、`<Picture 2>` … | 按时间轴位置编号 |
| 身份/场景/服装/道具保持（三视图、场景图、动作/风格参考） | `<Subject N>` | 同一主体来自多个资产时合并定义 |
| 整段视频结构/续接参考 | `<Video N>` | 与 Subject 独立编号 |
| 音频（音色样本、配乐、音效、台词音频） | `<Audio N>` | 与 Speaker ID 对应时写 `<Subject N> (Sx)` |

换算后须回读核对：标签编号、时点与节点实际连线一致，未使用的输入不虚构标签（对齐共用约束 3、4）。

## 动作、声音与镜头词汇

镜头术语要精确表达画面，而非盲套旧映射。大远景可用 extreme wide shot，远景 wide shot，全景 full shot，中景 medium shot，近景 medium close-up，特写 close-up，大特写 extreme close-up。近景不能一律翻成面部特写，构图部位有歧义时写清裁切。

固定为 static camera；推为 push in/dolly in；拉为 pull back/dolly out；跟拍 tracking shot；摇须说明 pan left/right 或 tilt；升降 crane up/down；环绕 orbit around 并说明方向。空间动词如 holding、standing beside、following behind、sitting in 必须与画面和道具归属一致。handheld、slow motion、Dutch angle 只在确认分镜需要时出现。

英文模板中描述语句可英文，台词原文不翻译。对白时间可跨听者反应镜，声音仍归说话人；OS/VO 的有声信息和无口型关系要同时明确。纯文字信息的语音化、逐行点亮或提示音属于需确认的呈现方案，不因旧模板默认添加。

## 本集记录、执行前核对与验收

在本集已有制作说明/阶段记录中保存：

- 采用模板及理由、当前实际模型/模式、片段或镜头范围、目标时长与规格。
- 采用 H3 模板时记录所选模式（T2VA/I2VA/FL2VA/L2VA/Ref2VA）与 {{ref N}} → H3 标签的分配表。
- 全部原镜号对应提示词段落，完整台词与说话人/OS/VO、声音来源和口型要求。
- 实际参考类型、顺序、用途、源资产版本与当前节点；首尾帧注明起终作用，未就绪项不删除后重编号。
- 首镜开始状态、上一片段采用结果或规划依据、结束状态与下一段衔接方式。
- 完整执行 prompt 和用户确认范围；模板正文不混入审核报告，审核意见保存在可读说明。

写入后通过节点函数回读 prompt、配置、连线及输出基线，确认用户批准的是这一实际方案。生成状态遵守 [画布执行](../canvasOperations.md)；“generating”、reload 后 idle 或旧输出不能证明本次成功。

验收时看实际媒体的身份、动作/道具接触、人物左右与视线、镜头顺序、对白完整性、声音来源与口型、末尾是否截断，以及前后片段的实际交界状态。逐项写明已查看的证据与问题位置。当前工具无法播放/理解视频或读取音轨时，由用户预览回报，记录“待用户核验”；文件路径与成功状态不能冒充已经看过、听过。用户采用前，成功视频仍是候选。

依据 v1.1.8（cd3e7c4）中 data/modelPrompt/video/seedance2Multi-parameterMode.md、wan2.6Single-imageFirstFrameMode.md、universalFirstAndLastFrameMode.md、universalMulti-parameterMode.md，以及 src/routes/production/workbench/generateVideoPrompt.ts。旧模板描述的语法和效果不是对当前模型的实测承诺。H3 模板段依据 MiniMax 官方 h3-prompt-writing 技能（[base-en](../../../h3PromptWriting/references/base-en.txt)、[ref-en](../../../h3PromptWriting/references/ref-en.txt)），字段名、段落顺序与标签体系按官方指南原样保留。
