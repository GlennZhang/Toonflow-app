---
name: minimaxMusicWriting
description: Write MiniMax Music 3.0 / 海螺音乐 generation prompts for background music (BGM), cinematic soundtracks, and original songs. Use when generating BGM for drama scenes, translating script atmosphere into musical structures, composing Global Metadata, Vocal Details, and Arrangement sections, or creating instrumental background audio nodes on the canvas.
compatibility: Portable to any agent with access to audio generation and canvas nodes.
---

# MiniMax Music Prompt Writing

## 用途与触发条件
当用户需要为短剧、动画或视频分镜制作背景配乐（BGM）、生成场景氛围音乐、编写主题曲（OST），或要求根据剧情“给这段戏配乐 / 生成背景音乐”时触发本技能。

---

## 核心输出结构：官方三段式模板

MiniMax Music 3.0 需采用标准的英文结构化分块模板编写。无论用户使用中文还是英文描述剧情，均将其翻译并归纳为以下三个段落：

```text
Global Metadata: [音乐流派/风格，如 Traditional Chinese cinematic score, ambient suspense]. [速度，如 75 BPM], [调式，如 D minor / 宫调]. [核心情绪，如 Dark, mysterious, tense, sorrowful]. [应用场景氛围，如 Late-night deserted alley, cold rain, psychological suspense]. [混音与制作质感，如 Organic acoustic texture, deep spatial reverb, film score mix].

Vocal Details: [人声设置。纯 BGM 必填: Instrumental only, strictly no vocals, no singing, no choir. 若为主题曲则描述演唱者音色与唱腔]

Arrangement: 
- Core instruments: [核心乐器，如 Low cello drone, guzheng plucks, haunting xiao flute, slow heartbeat sub-bass].
- Intro: [前奏编排与引子乐器].
- Main / Development: [主干旋律、节奏推进与铺垫].
- Climax: [情绪高潮点配器加厚或打击乐加入].
- Outro: [尾奏衰减方式，如余音消散在雨声中].
```

---

## 模式区分

### 1. 纯背景音乐模式（纯 BGM / Instrumental - 绝大多数短剧默认）
* **规则**：
  * `Vocal Details:` 必须显式声明为：`Instrumental only, strictly no vocals, no speech, no singing, no hums.`
  * 歌词（Lyrics）部分统一输入：`[Instrumental]`
* **乐器选择建议（古风短剧）**：
  * 悬疑/紧张：古筝单音点拨（Guzheng）、箫（Xiao）、低音大提琴底噪垫音（Cello drone）、弱心跳低频鼓（Sub-bass / Taiko）。
  * 战斗/对峙：中国大鼓（War drums）、琵琶扫弦（Pipa tremolo）、急促竹笛（Rapid dizi）、快板打击乐。
  * 凄美/抒情：二胡（Erhu solo）、古琴（Guqin）、轻柔弦乐合奏、雨声质感。

### 2. 带歌词的主题曲模式（OST / 歌曲）
* **规则**：
  * 在 `Vocal Details:` 中详述歌手性别、声线特点（如 *Breathy female vocal, emotional and resonant, traditional Chinese folk vocal style*）。
  * 歌词采用标准的曲式标签分段，例如：
    ```text
    [Intro]
    (Instrumental / ambient hums)

    [Verse 1]
    秋风卷落叶，长巷雨未歇...

    [Chorus]
    问君何所安，提灯踏雪行...

    [Outro]
    (Fade out)
    ```

---

## 画布联动指南
当为用户在画布上创建背景音乐节点时：
1. 创建或定位节点类型为 `remote-audioGenerationNode` 的节点；
2. 模型参数选择 `MiniMax-Music-03`；
3. 将按照本模板生成好的标准提示词写入节点的 `prompt` 字段中；
4. 纯 BGM 模式下，保持时长为 30~60 秒，完成后连入分镜视频节点或供剪辑统一使用。
