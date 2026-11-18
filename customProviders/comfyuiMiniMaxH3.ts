const rules = [
  {
    type: "input",
    field: "baseUrl" as const,
    title: "ComfyUI 服务地址",
    value: "http://127.0.0.1:8188",
    props: { placeholder: "例如 http://192.168.1.10:8188" },
  },
  {
    type: "input",
    field: "workflowT2v" as const,
    title: "t2v 工作流（文生视频，可选覆盖）",
    value: "",
    props: { type: "textarea", rows: 4, placeholder: "留空直接使用内置官方工作流；需自定义时粘贴 API JSON" },
  },
  {
    type: "input",
    field: "workflowI2v" as const,
    title: "i2v 工作流（首帧图生视频，可选覆盖）",
    value: "",
    props: { type: "textarea", rows: 4, placeholder: "留空直接使用内置官方工作流；需自定义时粘贴 API JSON" },
  },
  {
    type: "input",
    field: "workflowR2v" as const,
    title: "r2v 工作流（多参考图生视频，可选覆盖）",
    value: "",
    props: { type: "textarea", rows: 4, placeholder: "留空直接使用内置官方工作流；需自定义时粘贴 API JSON" },
  },
  {
    type: "input",
    field: "workflowR2vTurbo" as const,
    title: "r2v Turbo 工作流（LoRA 快速版，可选覆盖）",
    value: "",
    props: { type: "textarea", rows: 4, placeholder: "留空直接使用内置官方工作流；需自定义时粘贴 API JSON" },
  },
  {
    type: "input",
    field: "clientId" as const,
    title: "client_id（可选）",
    value: "",
    props: { placeholder: "留空自动生成" },
  },
  {
    type: "inputNumber",
    field: "pollIntervalMs" as const,
    title: "轮询间隔（毫秒）",
    value: 5000,
    props: { min: 1000, max: 60000 },
  },
  {
    type: "inputNumber",
    field: "timeoutMinutes" as const,
    title: "单个视频实际渲染超时（分钟，排队时不计）",
    value: 20,
    props: { min: 1, max: 120 },
  },
] as const;

const version = "1.1.0";

// 内置官方验证通过的工作流 JSON，留空时自动作为默认预设使用，免去重复粘贴。
const defaultWorkflows = {
  t2v: "{\"92\": {\"inputs\": {\"filename_prefix\": \"video/MiniMax_H3\", \"format\": \"auto\", \"codec\": \"auto\", \"video\": [\"105:91\", 0]}, \"class_type\": \"SaveVideo\", \"_meta\": {\"title\": \"\u4fdd\u5b58\u89c6\u9891\"}}, \"115\": {\"inputs\": {\"aspect_ratio\": \"16:9 (Widescreen)\", \"megapixels\": 0.4, \"multiple\": 32}, \"class_type\": \"ResolutionSelector\", \"_meta\": {\"title\": \"\u5206\u8fa8\u7387\u9009\u62e9\u5668\"}}, \"105:11\": {\"inputs\": {\"vae_name\": \"minimax_h3_video_vae_fp16.safetensors\"}, \"class_type\": \"VAELoader\", \"_meta\": {\"title\": \"\u52a0\u8f7dVAE\"}}, \"105:24\": {\"inputs\": {\"vae_name\": \"minimax_h3_audio_vae_fp32.safetensors\"}, \"class_type\": \"VAELoader\", \"_meta\": {\"title\": \"\u52a0\u8f7dVAE\"}}, \"105:23\": {\"inputs\": {\"samples\": [\"105:14\", 0], \"vae\": [\"105:24\", 0]}, \"class_type\": \"VAEDecodeAudio\", \"_meta\": {\"title\": \"VAE\u89e3\u7801\uff08\u97f3\u9891\uff09\"}}, \"105:10\": {\"inputs\": {\"samples\": [\"105:14\", 0], \"vae\": [\"105:11\", 0]}, \"class_type\": \"VAEDecode\", \"_meta\": {\"title\": \"VAE\u89e3\u7801\"}}, \"105:17\": {\"inputs\": {\"sampler_name\": \"res_multistep\"}, \"class_type\": \"KSamplerSelect\", \"_meta\": {\"title\": \"K\u91c7\u6837\u5668\u9009\u62e9\"}}, \"105:9\": {\"inputs\": {\"scheduler\": \"simple\", \"steps\": 20, \"denoise\": 1, \"model\": [\"105:6\", 0]}, \"class_type\": \"BasicScheduler\", \"_meta\": {\"title\": \"\u57fa\u672c\u8c03\u5ea6\u5668\"}}, \"105:14\": {\"inputs\": {\"noise\": [\"105:15\", 0], \"guider\": [\"105:16\", 0], \"sampler\": [\"105:17\", 0], \"sigmas\": [\"105:9\", 0], \"latent_image\": [\"105:104\", 1]}, \"class_type\": \"SamplerCustomAdvanced\", \"_meta\": {\"title\": \"\u81ea\u5b9a\u4e49\u91c7\u6837\u5668\uff08\u9ad8\u7ea7\uff09\"}}, \"105:16\": {\"inputs\": {\"model\": [\"105:6\", 0], \"conditioning\": [\"105:104\", 0]}, \"class_type\": \"BasicGuider\", \"_meta\": {\"title\": \"\u57fa\u672c\u5f15\u5bfc\u5668\"}}, \"105:6\": {\"inputs\": {\"unet_name\": \"minimax_h3_fl2va_pruned_int8_convrot.safetensors\", \"weight_dtype\": \"default\"}, \"class_type\": \"UNETLoader\", \"_meta\": {\"title\": \"UNet\u52a0\u8f7d\u5668\"}}, \"105:13\": {\"inputs\": {\"clip_name\": \"qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors\", \"type\": \"minimax\", \"device\": \"default\"}, \"class_type\": \"CLIPLoader\", \"_meta\": {\"title\": \"\u52a0\u8f7dCLIP\"}}, \"105:15\": {\"inputs\": {\"noise_seed\": 672701440293503}, \"class_type\": \"RandomNoise\", \"_meta\": {\"title\": \"\u968f\u673a\u566a\u6ce2\"}}, \"105:91\": {\"inputs\": {\"fps\": 24, \"bit_depth\": 8, \"images\": [\"105:10\", 0], \"audio\": [\"105:23\", 0]}, \"class_type\": \"CreateVideo\", \"_meta\": {\"title\": \"\u521b\u5efa\u89c6\u9891\"}}, \"105:104\": {\"inputs\": {\"prompt\": \"A hyper-realistic, high-end boudoir photography of a stunning Chinesewoman with delicate East Asian features, almond-shaped eyes, and smoothporcelain skin. She is posed elegantly in a dimly lit luxury bedroom. Thecomposition focuses on her natural curves; she wears sheer, semi-transparent silk fabric that drapes diagonally across her body,strategically revealing the soft contours of her cleavage and the curve ofher hips while maintaining an artistic aesthetic. Dramatic chiaroscurolighting (moonlight style) casts deep shadows and bright highlightsdirectly onto her exposed skin areas to emphasize anatomy and sensuality.Intimate atmosphere, 85mm portrait lens, cinematic color grading, ultra-detailedtexture.\", \"width\": [\"115\", 0], \"height\": [\"115\", 1], \"length\": [\"105:107\", 1], \"clip\": [\"105:13\", 0], \"vae\": [\"105:11\", 0]}, \"class_type\": \"MiniMaxH3ImageToVideo\", \"_meta\": {\"title\": \"MiniMax H3 Image to Video\"}}, \"105:107\": {\"inputs\": {\"expression\": \"max(5, round(a * 24)) + (5 - (max(5, round(a * 24)) % 17)) % 17\", \"values.a\": [\"105:111\", 0]}, \"class_type\": \"ComfyMathExpression\", \"_meta\": {\"title\": \"\u6570\u5b66\u8868\u8fbe\u5f0f\"}}, \"105:111\": {\"inputs\": {\"value\": 5}, \"class_type\": \"PrimitiveFloat\", \"_meta\": {\"title\": \"Float (duration)\"}}}",
  i2v: "{\"92\": {\"inputs\": {\"filename_prefix\": \"video/MiniMax_H3\", \"format\": \"auto\", \"codec\": \"auto\", \"video\": [\"105:91\", 0]}, \"class_type\": \"SaveVideo\", \"_meta\": {\"title\": \"\u4fdd\u5b58\u89c6\u9891\"}}, \"114\": {\"inputs\": {\"image\": \"ChatGPT Image 2026\u5e748\u67085\u65e5 08_44_18.png\"}, \"class_type\": \"LoadImage\", \"_meta\": {\"title\": \"\u52a0\u8f7d\u56fe\u50cf\"}}, \"115\": {\"inputs\": {\"aspect_ratio\": \"16:9 (Widescreen)\", \"megapixels\": 0.6, \"multiple\": 32}, \"class_type\": \"ResolutionSelector\", \"_meta\": {\"title\": \"\u5206\u8fa8\u7387\u9009\u62e9\u5668\"}}, \"119\": {\"inputs\": {\"upscale_method\": \"nearest-exact\", \"megapixels\": 1, \"resolution_steps\": 32}, \"class_type\": \"ImageScaleToTotalPixels\", \"_meta\": {\"title\": \"\u7f29\u653e\u56fe\u50cf\uff08\u50cf\u7d20\uff09\"}}, \"120\": {\"inputs\": {\"image\": [\"119\", 0]}, \"class_type\": \"GetImageSize\", \"_meta\": {\"title\": \"\u83b7\u53d6\u56fe\u50cf\u5c3a\u5bf8\"}}, \"105:11\": {\"inputs\": {\"vae_name\": \"minimax_h3_video_vae_fp16.safetensors\"}, \"class_type\": \"VAELoader\", \"_meta\": {\"title\": \"\u52a0\u8f7dVAE\"}}, \"105:24\": {\"inputs\": {\"vae_name\": \"minimax_h3_audio_vae_fp32.safetensors\"}, \"class_type\": \"VAELoader\", \"_meta\": {\"title\": \"\u52a0\u8f7dVAE\"}}, \"105:23\": {\"inputs\": {\"samples\": [\"105:14\", 0], \"vae\": [\"105:24\", 0]}, \"class_type\": \"VAEDecodeAudio\", \"_meta\": {\"title\": \"VAE\u89e3\u7801\uff08\u97f3\u9891\uff09\"}}, \"105:10\": {\"inputs\": {\"samples\": [\"105:14\", 0], \"vae\": [\"105:11\", 0]}, \"class_type\": \"VAEDecode\", \"_meta\": {\"title\": \"VAE\u89e3\u7801\"}}, \"105:17\": {\"inputs\": {\"sampler_name\": \"res_multistep\"}, \"class_type\": \"KSamplerSelect\", \"_meta\": {\"title\": \"K\u91c7\u6837\u5668\u9009\u62e9\"}}, \"105:9\": {\"inputs\": {\"scheduler\": \"simple\", \"steps\": 20, \"denoise\": 1, \"model\": [\"105:6\", 0]}, \"class_type\": \"BasicScheduler\", \"_meta\": {\"title\": \"\u57fa\u672c\u8c03\u5ea6\u5668\"}}, \"105:14\": {\"inputs\": {\"noise\": [\"105:15\", 0], \"guider\": [\"105:16\", 0], \"sampler\": [\"105:17\", 0], \"sigmas\": [\"105:9\", 0], \"latent_image\": [\"105:104\", 1]}, \"class_type\": \"SamplerCustomAdvanced\", \"_meta\": {\"title\": \"\u81ea\u5b9a\u4e49\u91c7\u6837\u5668\uff08\u9ad8\u7ea7\uff09\"}}, \"105:16\": {\"inputs\": {\"model\": [\"105:6\", 0], \"conditioning\": [\"105:104\", 0]}, \"class_type\": \"BasicGuider\", \"_meta\": {\"title\": \"\u57fa\u672c\u5f15\u5bfc\u5668\"}}, \"105:6\": {\"inputs\": {\"unet_name\": \"minimax_h3_fl2va_pruned_int8_convrot.safetensors\", \"weight_dtype\": \"default\"}, \"class_type\": \"UNETLoader\", \"_meta\": {\"title\": \"UNet\u52a0\u8f7d\u5668\"}}, \"105:13\": {\"inputs\": {\"clip_name\": \"qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors\", \"type\": \"minimax\", \"device\": \"default\"}, \"class_type\": \"CLIPLoader\", \"_meta\": {\"title\": \"\u52a0\u8f7dCLIP\"}}, \"105:15\": {\"inputs\": {\"noise_seed\": 10613538915467}, \"class_type\": \"RandomNoise\", \"_meta\": {\"title\": \"\u968f\u673a\u566a\u6ce2\"}}, \"105:91\": {\"inputs\": {\"fps\": 24, \"bit_depth\": 8, \"images\": [\"105:10\", 0], \"audio\": [\"105:23\", 0]}, \"class_type\": \"CreateVideo\", \"_meta\": {\"title\": \"\u521b\u5efa\u89c6\u9891\"}}, \"105:104\": {\"inputs\": {\"prompt\": \"Use the uploaded reference image as the exact character reference. Lock her facial identity, eye color, skin tone, hairstyle, makeup, body proportions, and overall appearance throughout the entire video. She has long black hair tied in a low ponytail, soft natural makeup, expressive grey-green eyes, and wears the same fitted white graphic baby tee, oversized denim shorts, white crew socks, chunky sneakers, silver hoop earrings, layered necklaces, rings, and an oversized black bomber jacket hanging loosely off her shoulders. Maintain perfect character consistency in every shot. Create a high-end American hip-hop/rap music video inside a premium photography studio transformed into a modern urban performance space. The set features a blue cyclorama backdrop, minimalist graffiti walls, a professional drum kit, vintage brown leather sofa, polished concrete floor, blue neon tube lights, industrial spotlights, subtle atmospheric haze, and cinematic contrast. The aesthetic should feel like a mainstream Western rap music video with luxury production value. The video opens with an ultra-wide close-up as she looks directly into the camera with a confident expression and folded arms. The camera quickly cuts to a dramatic side silhouette where she lowers her head, then raises it while making relaxed hip-hop hand gestures. A full-body wide-angle shot reveals her casually grooving to the beat, shoulders bouncing naturally as her oversized jacket shifts with realistic fabric movement. The camera circles around her in a handheld shoulder-mounted tracking shot while she confidently lip-syncs to the music with expressive facial performance. She points toward the lens, smiles slightly, then steps forward with effortless swagger. A dramatic low-angle hero shot emphasizes her presence as she spreads her arms confidently beneath glowing blue lights. She walks toward a professional drum kit, sits down naturally, and begins striking the drums energetically in perfect rhythm with the music. Fast cuts alternate between overhead, side, and close-up angles showing realistic stick movement, expressive reactions, and synchronized performance. The scene transitions to a blue roller shutter covered in minimalist graffiti where she squats casually with elbows resting on her knees, maintaining eye contact with the camera while continuing to rap confidently. The camera slowly pushes in from the side before cutting to her lounging effortlessly on a vintage brown leather sofa. She leans back comfortably, one arm stretched along the backrest, nodding naturally with the rhythm while continuing her performance. A dramatic side silhouette sequence follows with atmospheric haze and strong blue backlighting as she performs smooth body movements, expressive hand gestures, and confident lip-sync. Her hair moves naturally with subtle airflow while the camera glides around her using wide-angle lenses that enhance depth and energy. The final sequence returns to a full-stage performance. She stands center stage beneath powerful spotlights surrounded by drums, graffiti, neon tubes, and blue studio lighting. The camera slowly pulls backward while she delivers the final lyrics with bold attitude, ending in a confident pose as the lights fade behind her. Professional rap music video cinematography, cinematic handheld movement, wide-angle lens distortion, premium studio lighting, realistic skin texture, natural eye reflections, detailed hair strands, physically accurate lighting and shadows, authentic lip-sync performance, expressive body language, smooth choreography, realistic fabric simulation, high-end fashion editorial styling, luxury commercial quality, immersive urban atmosphere, 16:9 widescreen, no subtitles, no logos, no watermarks, no on-screen text.\", \"width\": [\"115\", 0], \"height\": [\"115\", 1], \"length\": [\"105:107\", 1], \"clip\": [\"105:13\", 0], \"vae\": [\"105:11\", 0], \"first_frame\": [\"114\", 0]}, \"class_type\": \"MiniMaxH3ImageToVideo\", \"_meta\": {\"title\": \"MiniMax H3 Image to Video\"}}, \"105:107\": {\"inputs\": {\"expression\": \"max(5, round(a * 24)) + (5 - (max(5, round(a * 24)) % 17)) % 17\", \"values.a\": [\"105:111\", 0]}, \"class_type\": \"ComfyMathExpression\", \"_meta\": {\"title\": \"\u6570\u5b66\u8868\u8fbe\u5f0f\"}}, \"105:111\": {\"inputs\": {\"value\": 15}, \"class_type\": \"PrimitiveFloat\", \"_meta\": {\"title\": \"Float (duration)\"}}}",
  r2v: "{\"92\": {\"inputs\": {\"filename_prefix\": \"video/MiniMax_H3\", \"format\": \"auto\", \"codec\": \"auto\", \"video\": [\"130\", 0]}, \"class_type\": \"SaveVideo\", \"_meta\": {\"title\": \"\u4fdd\u5b58\u89c6\u9891\"}}, \"115\": {\"inputs\": {\"aspect_ratio\": \"16:9 (Widescreen)\", \"megapixels\": 0.4, \"multiple\": 32}, \"class_type\": \"ResolutionSelector\", \"_meta\": {\"title\": \"Resolution Selector (Size)\"}}, \"119\": {\"inputs\": {\"vae_name\": \"minimax_h3_video_vae_fp16.safetensors\"}, \"class_type\": \"VAELoader\", \"_meta\": {\"title\": \"\u52a0\u8f7dVAE\"}}, \"120\": {\"inputs\": {\"vae_name\": \"minimax_h3_audio_vae_fp32.safetensors\"}, \"class_type\": \"VAELoader\", \"_meta\": {\"title\": \"\u52a0\u8f7dVAE\"}}, \"121\": {\"inputs\": {\"samples\": [\"125\", 0], \"vae\": [\"120\", 0]}, \"class_type\": \"VAEDecodeAudio\", \"_meta\": {\"title\": \"VAE\u89e3\u7801\uff08\u97f3\u9891\uff09\"}}, \"122\": {\"inputs\": {\"samples\": [\"125\", 0], \"vae\": [\"119\", 0]}, \"class_type\": \"VAEDecode\", \"_meta\": {\"title\": \"VAE\u89e3\u7801\"}}, \"123\": {\"inputs\": {\"sampler_name\": \"res_multistep\"}, \"class_type\": \"KSamplerSelect\", \"_meta\": {\"title\": \"K\u91c7\u6837\u5668\u9009\u62e9\"}}, \"124\": {\"inputs\": {\"scheduler\": \"simple\", \"steps\": 20, \"denoise\": 1, \"model\": [\"127\", 0]}, \"class_type\": \"BasicScheduler\", \"_meta\": {\"title\": \"\u57fa\u672c\u8c03\u5ea6\u5668\"}}, \"125\": {\"inputs\": {\"noise\": [\"129\", 0], \"guider\": [\"126\", 0], \"sampler\": [\"123\", 0], \"sigmas\": [\"124\", 0], \"latent_image\": [\"136\", 1]}, \"class_type\": \"SamplerCustomAdvanced\", \"_meta\": {\"title\": \"\u81ea\u5b9a\u4e49\u91c7\u6837\u5668\uff08\u9ad8\u7ea7\uff09\"}}, \"126\": {\"inputs\": {\"model\": [\"127\", 0], \"conditioning\": [\"136\", 0]}, \"class_type\": \"BasicGuider\", \"_meta\": {\"title\": \"\u57fa\u672c\u5f15\u5bfc\u5668\"}}, \"127\": {\"inputs\": {\"unet_name\": \"minimax_h3_ref2va_pruned_int8_convrot.safetensors\", \"weight_dtype\": \"default\"}, \"class_type\": \"UNETLoader\", \"_meta\": {\"title\": \"UNet\u52a0\u8f7d\u5668\"}}, \"128\": {\"inputs\": {\"clip_name\": \"qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors\", \"type\": \"minimax\", \"device\": \"default\"}, \"class_type\": \"CLIPLoader\", \"_meta\": {\"title\": \"\u52a0\u8f7dCLIP\"}}, \"129\": {\"inputs\": {\"noise_seed\": 534971592679275}, \"class_type\": \"RandomNoise\", \"_meta\": {\"title\": \"\u968f\u673a\u566a\u6ce2\"}}, \"130\": {\"inputs\": {\"fps\": 24, \"bit_depth\": 8, \"images\": [\"122\", 0], \"audio\": [\"121\", 0]}, \"class_type\": \"CreateVideo\", \"_meta\": {\"title\": \"\u521b\u5efa\u89c6\u9891\"}}, \"131\": {\"inputs\": {\"expression\": \"max(5, round(a * 24)) + (5 - (max(5, round(a * 24)) % 17)) % 17\", \"values.a\": [\"132\", 0]}, \"class_type\": \"ComfyMathExpression\", \"_meta\": {\"title\": \"\u6570\u5b66\u8868\u8fbe\u5f0f\"}}, \"132\": {\"inputs\": {\"value\": 8}, \"class_type\": \"PrimitiveFloat\", \"_meta\": {\"title\": \"Float (Duration)\"}}, \"136\": {\"inputs\": {\"prompt\": [\"138\", 0], \"width\": [\"115\", 0], \"height\": [\"115\", 1], \"length\": [\"131\", 1], \"ref_image_size\": \"match\", \"clip\": [\"128\", 0], \"vae\": [\"119\", 0], \"audio_vae\": [\"120\", 0], \"ref_images.ref_image_0\": [\"137\", 0], \"ref_images.ref_image_1\": [\"139\", 0], \"ref_images.ref_image_2\": [\"141\", 0]}, \"class_type\": \"MiniMaxH3ReferenceToVideo\", \"_meta\": {\"title\": \"MiniMax H3 Reference to Video\"}}, \"137\": {\"inputs\": {\"image\": \"\u5c71\u75302.png\"}, \"class_type\": \"LoadImage\", \"_meta\": {\"title\": \"\u52a0\u8f7d\u56fe\u50cf\"}}, \"138\": {\"inputs\": {\"value\": \"Use the provided references with strict continuity.\\n\\n<Picture 1> = GIRL identity and appearance reference.\\n<Picture 2> = BOY identity and appearance reference.\\n<Picture 3> = genkan environment and visual-style reference ONLY.\\n<Picture 4> = EXACT starting frame and physical-state reference.\\n\\nIMPORTANT:\\nThis is the REALITY version of the moment.\\n\\nThe previous romantic conversation existed only in the BOY'S imagination.\\n\\nIn reality:\\nthe BOY never manages to speak,\\nthe GIRL never hears an invitation,\\nand after putting on her shoes, she simply leaves.\\n\\nThe video begins directly from <Picture 4>.\\n\\nBoth characters are ALREADY seated.\\n\\nThe GIRL is already putting on her shoes.\\nThe BOY is already seated beside her, quietly looking toward her.\\n\\nDo not replay her arrival or sitting-down action.\\n\\nUse <Picture 3> only for the school genkan architecture, lighting, wooden shoe lockers, raised wooden floor, concrete entrance floor, and cinematic atmosphere.\\n\\nPreserve the exact identities of the GIRL from <Picture 1> and the BOY from <Picture 2>.\\n\\n\\nSCENE\\n\\nCreate a 12\u201315 second silent Japanese coming-of-age film scene.\\n\\nThe emotional idea is:\\n\\nthe BOY desperately wants to say something,\\nbut loses his courage.\\n\\nThe GIRL does not realize what he is thinking.\\n\\nThe moment simply passes.\\n\\n\\nSHOT 1 \u2014 SAME MOMENT, REALITY\\n0\u20133s\\n\\nBegin directly from the exact seated state in <Picture 4>.\\n\\nBoth remain seated at the genkan step.\\n\\nThe GIRL quietly continues putting on her shoes,\\nhead slightly lowered.\\n\\nThe BOY watches her from beside her.\\n\\nHe looks as if he is about to speak.\\n\\nA small inhale.\\nHis lips part slightly.\\n\\nHis fingers tense for a moment.\\n\\nHe glances toward her.\\n\\nBut no words come out.\\n\\nOnly quiet school ambience.\\n\\n\\nSHOT 2 \u2014 BOY HESITATES\\n3\u20136s\\n\\nTight close-up of the BOY <Picture 2>.\\n\\nThis framing subtly resembles the imagined scene in which he would have invited her to walk home.\\n\\nHe gathers courage for a moment.\\n\\nHis expression:\\n\\nhesitation\\n\u2192 almost determined\\n\u2192 uncertainty\\n\u2192 loses courage.\\n\\nHis lips move slightly as though preparing to say something,\\nbut he remains completely silent.\\n\\nHe lowers his eyes.\\n\\nA small breath escapes.\\n\\nHis shoulders relax slightly in resignation.\\n\\nNO dialogue.\\n\\n\\nSHOT 3 \u2014 GIRL FINISHES HER SHOES\\n6\u20139s\\n\\nCut to the GIRL <Picture 1>.\\n\\nShe has noticed nothing unusual.\\n\\nShe finishes putting on her shoes naturally.\\n\\nShe adjusts the heel,\\nsmooths her skirt slightly,\\nthen lifts her head.\\n\\nHer expression is calm and ordinary.\\n\\nNo romantic reaction.\\nNo waiting for him to speak.\\n\\nShe simply prepares to leave.\\n\\n\\nSHOT 4 \u2014 SHE STANDS AND LEAVES\\n9\u201312s\\n\\nMedium-wide shot preserving the genkan layout.\\n\\nThe GIRL stands up naturally.\\n\\nThe BOY remains seated.\\n\\nShe turns toward the exit and begins walking away.\\n\\nShe does not stop.\\n\\nShe does not turn back toward him.\\n\\nThe BOY watches her leave,\\nbut still says nothing.\\n\\nKeep the movement simple and realistic.\\n\\n\\nSHOT 5 \u2014 BOY LEFT BEHIND\\n12\u201315s\\n\\nHold on the BOY alone at the genkan step.\\n\\nThe GIRL moves farther away and leaves the frame.\\n\\nThe camera slowly pushes toward the BOY.\\n\\nHe looks toward the direction she left.\\n\\nFor a brief moment,\\nhis expression carries the faint trace of the smile from his imagined conversation.\\n\\nThen it disappears.\\n\\nHe lowers his eyes.\\n\\nHis hand rests quietly near the shoelace he had been pretending to adjust.\\n\\nHold the silence.\\n\\nThe final emotional state is:\\n\\nhe imagined everything,\\nbut in reality,\\nhe never said anything.\\n\\n\\nPERFORMANCE\\n\\nExtremely restrained naturalistic acting.\\n\\nThe BOY'S emotion should come from:\\n\\nsmall eye movements,\\na quiet inhale,\\nslightly parted lips,\\nfinger tension,\\nhesitation,\\nlowered gaze,\\nand silence.\\n\\nDo not make him visibly devastated.\\n\\nHe is simply disappointed with himself.\\n\\nThe GIRL behaves naturally and casually.\\nShe does not know that anything meaningful almost happened.\\n\\nNo exaggerated sadness.\\nNo dramatic reaction.\\nNo crying.\\n\\n\\nCAMERA\\n\\nPoetic Japanese coming-of-age cinematography.\\n\\nUse:\\n\\n- seated two-shot\\n- boy close-up\\n- girl shoe / facial close-up\\n- medium-wide departure shot\\n- final boy close-up\\n\\nSubtle handheld movement.\\nSlow push-ins.\\nShallow depth of field.\\nNatural focus transitions.\\nPatient editing.\\n\\nThe reality scene should feel slightly quieter and more static than the imagined scene.\\n\\n\\nVISUAL STYLE\\n\\nLate-1990s / early-2000s Japanese youth-film atmosphere.\\n\\nSoft afternoon daylight.\\nCool muted color palette.\\nFine 35mm film grain.\\nSubtle halation.\\nNatural skin texture.\\nSoft cinematic contrast.\\n\\nQuiet,\\nmelancholic,\\nrestrained,\\nand slightly lonely.\\n\\n\\nAUDIO\\n\\nNO dialogue.\\nNO narration.\\nNO background music.\\n\\nNatural sound only:\\n\\nquiet school ambience,\\nsoft fabric movement,\\nshoe movement,\\nshoelaces,\\nwooden floor sounds,\\nthe GIRL'S footsteps gradually moving away,\\nfaint outdoor ambience.\\n\\nAfter she leaves,\\nlet the remaining silence become noticeable.\\n\\n\\nFINAL CONTINUITY\\n\\nThe scene starts from <Picture 4>:\\n\\nboth characters already seated,\\nGIRL already putting on her shoes.\\n\\nThe BOY never speaks.\\n\\nThe GIRL finishes putting on her shoes,\\nstands,\\nwalks away,\\nand leaves the frame.\\n\\nThe BOY remains seated.\\n\\nNo imagined dialogue occurs in reality.\\n\\nNo subtitles.\\nNo text.\\nNo logo.\\nNo watermark.\"}, \"class_type\": \"PrimitiveStringMultiline\", \"_meta\": {\"title\": \"Input Text (Prompt)\"}}, \"139\": {\"inputs\": {\"image\": \"\u56fe\u7247\u8282\u70b9 5.jpg\"}, \"class_type\": \"LoadImage\", \"_meta\": {\"title\": \"\u52a0\u8f7d\u56fe\u50cf\"}}, \"141\": {\"inputs\": {\"image\": \"ChatGPT Image 2026\u5e748\u67087\u65e5 12_57_47.png\"}, \"class_type\": \"LoadImage\", \"_meta\": {\"title\": \"\u52a0\u8f7d\u56fe\u50cf\"}}, \"143\": {\"inputs\": {\"image\": \"ChatGPT Image 2026\u5e748\u67087\u65e5 09_37_43.png\"}, \"class_type\": \"LoadImage\", \"_meta\": {\"title\": \"\u52a0\u8f7d\u56fe\u50cf\"}}}",
  r2vTurbo: "{\"92\": {\"inputs\": {\"filename_prefix\": \"video/MiniMax_H3\", \"format\": \"auto\", \"format.codec\": \"auto\", \"codec\": \"auto\", \"video\": [\"130\", 0]}, \"class_type\": \"SaveVideo\", \"_meta\": {\"title\": \"\u4fdd\u5b58\u89c6\u9891\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"115\": {\"inputs\": {\"aspect_ratio\": \"16:9 (Widescreen)\", \"megapixels\": 0.4, \"multiple\": 32}, \"class_type\": \"ResolutionSelector\", \"_meta\": {\"title\": \"Resolution Selector (Size)\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"119\": {\"inputs\": {\"vae_name\": \"minimax_h3_video_vae_int8_convrot.safetensors\"}, \"class_type\": \"VAELoader\", \"_meta\": {\"title\": \"\u52a0\u8f7dVAE\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"120\": {\"inputs\": {\"vae_name\": \"minimax_h3_audio_vae_fp32.safetensors\"}, \"class_type\": \"VAELoader\", \"_meta\": {\"title\": \"\u52a0\u8f7dVAE\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"121\": {\"inputs\": {\"samples\": [\"125\", 0], \"vae\": [\"120\", 0]}, \"class_type\": \"VAEDecodeAudio\", \"_meta\": {\"title\": \"VAE\u89e3\u7801\uff08\u97f3\u9891\uff09\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"122\": {\"inputs\": {\"samples\": [\"125\", 0], \"vae\": [\"119\", 0]}, \"class_type\": \"VAEDecode\", \"_meta\": {\"title\": \"VAE\u89e3\u7801\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"123\": {\"inputs\": {\"sampler_name\": \"res_multistep\"}, \"class_type\": \"KSamplerSelect\", \"_meta\": {\"title\": \"K\u91c7\u6837\u5668\u9009\u62e9\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"124\": {\"inputs\": {\"scheduler\": \"simple\", \"steps\": [\"142\", 0], \"denoise\": 1, \"model\": [\"127\", 0]}, \"class_type\": \"BasicScheduler\", \"_meta\": {\"title\": \"\u57fa\u672c\u8c03\u5ea6\u5668\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"125\": {\"inputs\": {\"noise\": [\"129\", 0], \"guider\": [\"126\", 0], \"sampler\": [\"123\", 0], \"sigmas\": [\"124\", 0], \"latent_image\": [\"136\", 1]}, \"class_type\": \"SamplerCustomAdvanced\", \"_meta\": {\"title\": \"\u81ea\u5b9a\u4e49\u91c7\u6837\u5668\uff08\u9ad8\u7ea7\uff09\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"126\": {\"inputs\": {\"model\": [\"141\", 0], \"conditioning\": [\"136\", 0]}, \"class_type\": \"BasicGuider\", \"_meta\": {\"title\": \"\u57fa\u672c\u5f15\u5bfc\u5668\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"127\": {\"inputs\": {\"unet_name\": \"minimax_h3_ref2va_pruned_int8_convrot.safetensors\", \"weight_dtype\": \"default\"}, \"class_type\": \"UNETLoader\", \"_meta\": {\"title\": \"UNet\u52a0\u8f7d\u5668\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"128\": {\"inputs\": {\"clip_name\": \"qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors\", \"type\": \"minimax\", \"device\": \"default\"}, \"class_type\": \"CLIPLoader\", \"_meta\": {\"title\": \"\u52a0\u8f7dCLIP\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"129\": {\"inputs\": {\"noise_seed\": 261662374822964}, \"class_type\": \"RandomNoise\", \"_meta\": {\"title\": \"\u968f\u673a\u566a\u6ce2\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"130\": {\"inputs\": {\"fps\": 24, \"bit_depth\": 8, \"color_space\": \"sRGB\", \"codec\": \"none\", \"images\": [\"122\", 0], \"audio\": [\"121\", 0]}, \"class_type\": \"CreateVideo\", \"_meta\": {\"title\": \"\u521b\u5efa\u89c6\u9891\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"131\": {\"inputs\": {\"expression\": \"max(5, round(a * 24)) + (5 - (max(5, round(a * 24)) % 17)) % 17\", \"values.a\": [\"132\", 0]}, \"class_type\": \"ComfyMathExpression\", \"_meta\": {\"title\": \"\u6570\u5b66\u8868\u8fbe\u5f0f\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"132\": {\"inputs\": {\"value\": 5}, \"class_type\": \"PrimitiveFloat\", \"_meta\": {\"title\": \"Float (Duration)\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"136\": {\"inputs\": {\"prompt\": [\"138\", 0], \"width\": [\"115\", 0], \"height\": [\"115\", 1], \"length\": [\"131\", 1], \"ref_image_size\": \"match\", \"clip\": [\"128\", 0], \"vae\": [\"119\", 0], \"audio_vae\": [\"120\", 0], \"ref_images.ref_image_0\": [\"137\", 0], \"ref_images.ref_image_1\": [\"139\", 0]}, \"class_type\": \"MiniMaxH3ReferenceToVideo\", \"_meta\": {\"title\": \"MiniMax H3 \u53c2\u8003\u8f6c\u89c6\u9891\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"137\": {\"inputs\": {\"image\": \"red_superboy_on_city_roof.png\"}, \"class_type\": \"LoadImage\", \"_meta\": {\"title\": \"\u52a0\u8f7d\u56fe\u50cf\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"138\": {\"inputs\": {\"value\": \"Bold comic-book ink style, heavy linework, red and blue-black palette, night city. Use <Picture 2> and <Picture 1> as reference frames and <Audio 1> exactly as it is.\\nCUT 1: top-down view of the little boy superhero on the rooftop \u2014 red cape fluttering in the wind, hands planted on his hips, freckles and a cocky grin as he looks straight up into the camera. The camera slowly descends toward him as he delivers his line \u2014 as he speaks, comic-book graphic overlay text word by word in sync with his voice: \\\"GET READY TO\\\" - \\\"MEET\\\" \u2014 \\\"YOUR\\\" \u2014 \\\"MAKER\\\" \u2014 huge jagged comic lettering, white with heavy black outlines and red drop shadows, tilted at scrappy angles, until the three words hang stacked in the air above him between his face and the lens.\\nTRANSITION: a violent WHIP PAN off the rooftop that SMEARS the floating words away with it, motion-streaked \u2014\\nCUT 2: low hero angle on the colossal black mech-kaiju towering over the skyline as it rears back and unleashes a GIANT terrifying ROAR \u2014 jaws wide with fangs, red eyes and chest-core flaring blinding bright, blue lightning arcing off its head, the roar's shockwave rippling dust and rattling windows down the buildings, comic-style speed-lines and ink splatter bursting from the impact of the sound. It leans INTO the camera as the roar peaks. Hold on the roar.\"}, \"class_type\": \"PrimitiveStringMultiline\", \"_meta\": {\"title\": \"Input Text (Prompt)\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"139\": {\"inputs\": {\"image\": \"mecha_dragon_lightning.png\"}, \"class_type\": \"LoadImage\", \"_meta\": {\"title\": \"\u52a0\u8f7d\u56fe\u50cf\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"141\": {\"inputs\": {\"switch\": [\"146\", 0], \"on_false\": [\"127\", 0], \"on_true\": [\"145\", 0]}, \"class_type\": \"ComfySwitchNode\", \"_meta\": {\"title\": \"If/Else Switch (model)\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"142\": {\"inputs\": {\"switch\": [\"146\", 0], \"on_false\": [\"143\", 0], \"on_true\": [\"144\", 0]}, \"class_type\": \"ComfySwitchNode\", \"_meta\": {\"title\": \"If/Else Switch (Steps)\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"143\": {\"inputs\": {\"value\": 20}, \"class_type\": \"PrimitiveInt\", \"_meta\": {\"title\": \"Int (Full)\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"144\": {\"inputs\": {\"value\": 4}, \"class_type\": \"PrimitiveInt\", \"_meta\": {\"title\": \"Int (Lightning LoRA)\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"145\": {\"inputs\": {\"lora_name\": \"minimax_h3_ref2v_turbo_4step_v0.1_comfyui_bf16.safetensors\", \"strength_model\": 1, \"model\": [\"127\", 0]}, \"class_type\": \"LoraLoaderModelOnly\", \"_meta\": {\"title\": \"LoRA\u52a0\u8f7d\u5668\uff08\u4ec5\u6a21\u578b\uff09\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}, \"146\": {\"inputs\": {\"value\": false}, \"class_type\": \"PrimitiveBoolean\", \"_meta\": {\"title\": \"Boolean (Enable Lightning LoRA)\", \"cnr_id\": \"comfy-core\", \"ver\": \"0.33.0\"}}}",
};

// ResolutionSelector 的显示值映射；节点里没有 aspect_ratio 字段时不写入。
const aspectRatioValues: Record<string, string> = {
  "16:9": "16:9 (Widescreen)",
  "9:16": "9:16 (Portrait)",
  "1:1": "1:1 (Square)",
  "4:3": "4:3 (Standard)",
  "3:4": "3:4 (Portrait)",
  "3:2": "3:2 (Classic)",
  "2:3": "2:3 (Portrait)",
  "21:9": "21:9 (Ultrawide)",
};

// MiniMax H3 的 ResolutionSelector 用兆像素而不是 480p / 720p 字符串。
const resolutionMegapixels: Record<string, number> = { "480p": 0.4, "720p": 0.7, "1080p": 1.2 };

const genNodePattern = /MiniMaxH3ReferenceToVideo|MiniMaxH3ImageToVideo|MinimaxTextToVideoNode|MiniMaxHailuo|Hailuo.*(Video|Frame|Reference)/i;

type workflowNode = { class_type?: string; inputs?: Record<string, unknown>; _meta?: { title?: string } };
type workflow = Record<string, workflowNode>;
type mediaInput =
  | { type: "url"; url: string; mimeType?: string; name?: string }
  | { type: "base64"; data: string; mimeType: string; name?: string }
  | { type: "binary"; data: Uint8Array; mimeType: string; name?: string };
type providerContext = {
  config: Record<string, unknown>;
  signal?: AbortSignal;
  saveTaskData?: (data: Record<string, unknown>) => Promise<void>;
  tool: {
    fetch: typeof globalThis.fetch;
    errorMessage(value: unknown): string;
  };
};

function wait(signal: AbortSignal, ms: number) {
  signal.throwIfAborted();
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}

function numberConfig(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function base64Payload(data: string) {
  const match = /^data:[^;]+;base64,(.*)$/s.exec(data);
  return match ? match[1] : data;
}

async function toBytes(context: providerContext, input: mediaInput): Promise<Uint8Array> {
  if (input.type === "base64") return Buffer.from(base64Payload(input.data), "base64");
  if (input.type === "binary") return input.data;
  const response = await context.tool.fetch(input.url);
  if (!response.ok) throw new Error(`获取参考图片失败：HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}

function imageExtension(mimeType: string | undefined) {
  if (mimeType?.includes("jpeg")) return "jpg";
  if (mimeType?.includes("webp")) return "webp";
  return "png";
}

function audioExtension(mimeType?: string): string {
  if (!mimeType) return "wav";
  if (mimeType.includes("wav")) return "wav";
  if (mimeType.includes("mpeg") || mimeType.includes("mp3")) return "mp3";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("flac")) return "flac";
  return "wav";
}

type multipartField = { name: string; filename?: string; mimeType?: string; value: string | Uint8Array };

function multipart(fields: multipartField[]) {
  const boundary = "----Toonflow" + Date.now().toString(36) + Math.random().toString(36).slice(2);
  const chunks: Buffer[] = [];
  for (const field of fields) {
    let head = `--${boundary}\r\nContent-Disposition: form-data; name="${field.name}"`;
    if (field.filename != null) {
      const safe = field.filename.replace(/[\r\n"\\]/g, "_");
      head += `; filename="${safe}"`;
    }
    if (field.mimeType) head += `\r\nContent-Type: ${field.mimeType}`;
    head += "\r\n\r\n";
    chunks.push(Buffer.from(head, "utf8"), Buffer.from(typeof field.value === "string" ? field.value : field.value), Buffer.from("\r\n", "utf8"));
  }
  chunks.push(Buffer.from(`--${boundary}--\r\n`, "utf8"));
  return { body: Buffer.concat(chunks), contentType: `multipart/form-data; boundary=${boundary}` };
}

async function uploadImage(context: providerContext, base: string, bytes: Uint8Array, filename: string, mimeType: string) {
  const { body, contentType } = multipart([
    { name: "image", filename, mimeType, value: bytes },
    { name: "overwrite", value: "true" },
  ]);
  const response = await context.tool.fetch(`${base}/upload/image`, { method: "POST", headers: { "Content-Type": contentType }, body });
  if (!response.ok) throw new Error(`上传图片失败：HTTP ${response.status} ${(await response.text()).slice(0, 200)}`);
  const data = (await response.json()) as { name?: string };
  if (!data?.name) throw new Error("ComfyUI 上传图片未返回文件名");
  return data.name;
}

function parseWorkflow(source: unknown, fallbackJson: string, title: string): workflow {
  const text = String(source ?? "").trim() || fallbackJson.trim();
  if (!text) throw new Error(`请在供应商设置中粘贴${title}的 API 格式工作流 JSON，或留空使用内置默认值`);
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`${title}工作流 JSON 解析失败，请重新检查或清空输入框以使用内置默认值`);
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    !Object.values(parsed).some((value) => value && typeof value === "object" && "class_type" in value)
  ) {
    throw new Error(`${title}工作流不是 API 格式（顶层应为 {节点id: {class_type, inputs}}）；请在 ComfyUI 勾选开发者模式后用 Save (API Format) 导出`);
  }
  return JSON.parse(JSON.stringify(parsed)) as workflow;
}

function findGenNode(workflow: workflow) {
  for (const [id, node] of Object.entries(workflow)) {
    if (node && typeof node.class_type === "string" && genNodePattern.test(node.class_type)) return { id, node };
  }
  throw new Error("工作流中未找到 MiniMax H3 生成节点（MiniMaxH3ImageToVideo / MiniMaxH3ReferenceToVideo 等）");
}

function patchPrompt(workflow: workflow, prompt: string) {
  const { node } = findGenNode(workflow);
  const inputs = node.inputs ?? (node.inputs = {});
  if (inputs.prompt_text != null) inputs.prompt_text = prompt;
  else inputs.prompt = prompt;
}

function patchFirstFrame(workflow: workflow, imageName: string) {
  for (const node of Object.values(workflow)) {
    if (node?.class_type === "LoadImage") {
      node.inputs ?? (node.inputs = {});
      node.inputs.image = imageName;
      return;
    }
  }
  throw new Error("i2v 工作流中未找到 LoadImage 节点，无法写入首帧图");
}

function patchRefImages(workflow: workflow, names: string[]) {
  const { node } = findGenNode(workflow);
  const inputs = node.inputs ?? (node.inputs = {});
  let prefix = "ref_image_";
  for (const key of Object.keys(inputs)) {
    if (/ref_image_0$/.test(key)) {
      prefix = key.slice(0, -1);
      break;
    }
  }
  const loadIds = Object.entries(workflow)
    .filter(([, n]) => n?.class_type === "LoadImage")
    .map(([id]) => Number(id))
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
  const allIds = Object.keys(workflow)
    .map(Number)
    .filter(Number.isFinite);
  let maxId = allIds.length ? Math.max(...allIds) : 0;
  for (let index = 0; index < names.length; index++) {
    let loadId = loadIds[index];
    if (loadId == null) {
      maxId += 1;
      loadId = maxId;
      workflow[String(loadId)] = { class_type: "LoadImage", inputs: {} };
    }
    workflow[String(loadId)]!.inputs ??= {};
    workflow[String(loadId)]!.inputs!.image = names[index]!;
    inputs[`${prefix}${index}`] = [String(loadId), 0];
  }
  for (let index = names.length; inputs[`${prefix}${index}`] != null; index++) delete inputs[`${prefix}${index}`];
}

function patchRefAudios(workflow: workflow, names: string[]) {
  const { node } = findGenNode(workflow);
  const inputs = node.inputs ?? (node.inputs = {});
  let prefix = "ref_audios.ref_audio_";
  for (const key of Object.keys(inputs)) {
    if (/ref_audio_0$/.test(key)) {
      prefix = key.slice(0, -1);
      break;
    }
  }
  const loadIds = Object.entries(workflow)
    .filter(([, n]) => n?.class_type === "LoadAudio")
    .map(([id]) => Number(id))
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const allIds = Object.keys(workflow)
    .map(Number)
    .filter(Number.isFinite);
  let maxId = allIds.length ? Math.max(...allIds) : 0;

  for (let index = 0; index < names.length; index++) {
    let loadId = loadIds[index];
    if (loadId == null) {
      maxId += 1;
      loadId = maxId;
      workflow[String(loadId)] = { class_type: "LoadAudio", inputs: {} };
    }
    workflow[String(loadId)]!.inputs ??= {};
    workflow[String(loadId)]!.inputs!.audio = names[index]!;
    inputs[`${prefix}${index}`] = [String(loadId), 0];
  }
  for (let index = names.length; inputs[`${prefix}${index}`] != null; index++) delete inputs[`${prefix}${index}`];
}

function patchOptions(workflow: workflow, aspectRatio: string | undefined, resolution: string, duration: number) {
  const resolutionNode = Object.values(workflow).find(
    (node) => node?.class_type === "ResolutionSelector" || (node.inputs?.megapixels != null && node.inputs?.aspect_ratio != null),
  );
  if (!resolutionNode) throw new Error("工作流中未找到 ResolutionSelector（或含 megapixels/aspect_ratio 输入）的分辨率节点");
  resolutionNode.inputs ?? (resolutionNode.inputs = {});
  resolutionNode.inputs.megapixels = resolutionMegapixels[String(resolution).toLowerCase()] ?? resolutionMegapixels["480p"]!;
  if (aspectRatio != null && "aspect_ratio" in resolutionNode.inputs) resolutionNode.inputs.aspect_ratio = aspectRatio;
  const durationNode = Object.values(workflow).find((node) => node.inputs?.value != null && /duration|时长/i.test(String(node._meta?.title ?? "")));
  if (!durationNode) throw new Error("工作流中未找到标题含 Duration/时长 且带 value 输入的时长节点");
  durationNode.inputs!.value = duration > 0 ? duration : 5;
}

function comboOptions(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0) return [];
  if (value.every((item) => typeof item === "string")) return value as string[];
  if (Array.isArray(value[0])) return value[0]!.filter((item) => typeof item === "string");
  const config = value[1];
  if (value[0] === "COMBO" && config && typeof config === "object" && Array.isArray((config as { options?: unknown[] }).options)) {
    return (config as { options: unknown[] }).options.filter((item) => typeof item === "string");
  }
  return [];
}

async function resolveAspectRatio(context: providerContext, base: string, classType: string, ratio: string) {
  try {
    const response = await context.tool.fetch(`${base}/object_info/${encodeURIComponent(classType)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as Record<string, { input?: { required?: Record<string, unknown> } }>;
    const allowed = comboOptions(data[classType]?.input?.required?.aspect_ratio);
    if (allowed.length > 0) {
      const matched = allowed.find((value) => value === ratio || value.startsWith(`${ratio} `) || value.startsWith(`${ratio}(`));
      if (matched) return matched;
      throw new Error(`ResolutionSelector 不支持比例 ${ratio}，可选值：${allowed.slice(0, 12).join("、")}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("不支持比例")) throw error;
  }
  return aspectRatioValues[ratio] ?? aspectRatioValues["16:9"]!;
}

function promptError(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback;
  const record = data as {
    error?: { message?: string; type?: string };
    node_errors?: Record<string, { errors?: { message?: string; details?: string }[] }>;
  };
  const parts: string[] = [];
  if (record.error?.message) parts.push(record.error.type ? `${record.error.message}（${record.error.type}）` : record.error.message);
  for (const [id, node] of Object.entries(record.node_errors ?? {})) {
    for (const error of node.errors ?? [])
      parts.push(`节点 ${id}: ${error.message ?? ""}${error.details ? ` (${error.details.slice(0, 120)})` : ""}`);
  }
  return parts.length ? parts.join("；").slice(0, 500) : fallback;
}

async function submitPrompt(context: providerContext, base: string, workflow: workflow, clientId: string, signal: AbortSignal) {
  const response = await context.tool.fetch(`${base}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: workflow, client_id: clientId }),
    signal,
  });
  const text = await response.text();
  if (!response.ok) {
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {}
    throw new Error(`ComfyUI 提交失败（HTTP ${response.status}）：${promptError(parsed, text.slice(0, 300))}`);
  }
  let data: { prompt_id?: string; data?: { prompt_id?: string } };
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`ComfyUI /prompt 响应非 JSON：${text.slice(0, 200)}`);
  }
  const promptId = data.prompt_id ?? data.data?.prompt_id;
  if (!promptId) throw new Error(`ComfyUI 未返回 prompt_id：${text.slice(0, 200)}`);
  return promptId;
}

type historyEntry = {
  status?: { status_str?: string; completed?: boolean; messages?: unknown[] };
  outputs?: Record<
    string,
    {
      videos?: { filename: string; subfolder?: string; type?: string }[];
      gifs?: { filename: string; subfolder?: string; type?: string }[];
      images?: { filename: string; subfolder?: string; type?: string }[];
    }
  >;
};

function inQueueList(list: unknown, targetPromptId: string): boolean {
  if (!Array.isArray(list)) return false;
  return list.some((item) => {
    if (Array.isArray(item) && item[1] === targetPromptId) return true;
    if (item && typeof item === "object" && (item as { prompt_id?: string }).prompt_id === targetPromptId) return true;
    return false;
  });
}

// 轮询结果：感知 ComfyUI 的排队状态；在 queue_pending 中排队时不扣除渲染超时，仅在实际运行 (queue_running) 后起算 timeoutMinutes。
async function pollResult(
  context: providerContext,
  base: string,
  promptId: string,
  signal: AbortSignal,
  intervalMs: number,
  timeoutMinutes: number,
) {
  let startedRunningAt: number | null = null;
  const renderTimeoutMs = timeoutMinutes * 60_000;
  const maxTotalWaitMs = 24 * 60 * 60_000; // 整体最大排队等待 24 小时兜底
  const startTime = Date.now();
  let notFoundCount = 0;

  while (true) {
    await wait(signal, intervalMs);

    // 1. 优先查历史记录，看是否已执行完成
    let entry: historyEntry | undefined;
    try {
      const response = await context.tool.fetch(`${base}/history/${encodeURIComponent(promptId)}`, { signal });
      if (response.ok) {
        const history = (await response.json()) as Record<string, historyEntry>;
        entry = history?.[promptId];
      }
    } catch (error) {
      if (signal.aborted) throw error;
    }

    if (entry) {
      const status = entry.status;
      if (status?.status_str?.toLowerCase() === "error") {
        const message = status.messages?.map((item) => (Array.isArray(item) ? item.join(": ") : String(item))).join("; ") ?? "";
        throw new Error(`ComfyUI 执行失败：${message.slice(0, 300) || "未知错误"}`);
      }
      if (status?.completed) {
        for (const output of Object.values(entry.outputs ?? {})) {
          const file = output?.videos?.[0] ?? output?.gifs?.[0] ?? output?.images?.[0];
          if (file) {
            const query = new URLSearchParams({ filename: file.filename, subfolder: file.subfolder ?? "", type: file.type ?? "output" });
            return `${base}/view?${query.toString()}`;
          }
        }
        throw new Error("ComfyUI 任务完成但未找到输出视频；请确认工作流包含 SaveVideo 节点");
      }
    }

    // 2. 检查队列状态（判定是排队中还是已经在跑）
    let isPending = false;
    let isRunning = false;
    try {
      const queueResp = await context.tool.fetch(`${base}/queue`, { signal });
      if (queueResp.ok) {
        const queueData = (await queueResp.json()) as { queue_running?: unknown[]; queue_pending?: unknown[] };
        isRunning = inQueueList(queueData.queue_running, promptId);
        isPending = inQueueList(queueData.queue_pending, promptId);
      }
    } catch (error) {
      if (signal.aborted) throw error;
    }

    if (isRunning) {
      notFoundCount = 0;
      if (startedRunningAt === null) startedRunningAt = Date.now();
      if (Date.now() - startedRunningAt > renderTimeoutMs) {
        throw new Error(`ComfyUI 视频渲染超时（已运行超过 ${timeoutMinutes} 分钟）`);
      }
    } else if (isPending) {
      notFoundCount = 0;
      // 任务正在排队中，重置渲染启动计时，避免排队吃掉生成配额
      startedRunningAt = null;
      if (Date.now() - startTime > maxTotalWaitMs) {
        throw new Error("ComfyUI 任务排队已超过 24 小时，生成中断");
      }
    } else if (!entry) {
      // 既不在队列也不在历史记录中
      notFoundCount++;
      // 允许有数次过渡缓冲（如刚提交入队或刚执行完出队但尚未写入 history 的瞬间）
      if (notFoundCount > 30) {
        throw new Error("ComfyUI 任务在队列中丢失或已被服务端取消");
      }
    }
  }
}

export default {
  id: "comfyuiMiniMaxH3",
  label: "ComfyUI MiniMax H3",
  version,
  readme: `通过远程 ComfyUI 的 MiniMax H3 节点生成视频，支持文生视频（t2v）、首帧图生视频（i2v）与多参考图生视频（r2v，支持最多 10 张图片与最多 4 段参考音频）。

已内置官方完整工作流，无需手动粘贴 JSON；配置项仅在需要定制时选填。
支持排队保护（排队时间不计入渲染超时）以及任务凭据断点复查。`,
  rules,
  models: [
    {
      id: "MiniMax-H3",
      label: "MiniMax H3 (ComfyUI)",
      type: "video",
      mode: ["text", "startFrameOptional", ["imageReference:10", "audioReference:4"]],
      audio: "optional",
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["480p", "720p", "1080p"] }],
    },
    {
      id: "MiniMax-H3-Turbo",
      label: "MiniMax H3 Turbo (ComfyUI, LoRA 4步快速版)",
      type: "video",
      mode: ["text", "startFrameOptional", ["imageReference:10", "audioReference:4"]],
      audio: "optional",
      durationResolutionMap: [{ duration: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], resolution: ["480p", "720p", "1080p"] }],
    },
  ],
  async generateVideo(request: {
    prompt: string;
    model?: string;
    images?: mediaInput[];
    videos?: mediaInput[];
    audios?: mediaInput[];
    firstFrame?: mediaInput;
    lastFrame?: mediaInput;
    duration?: number;
    ratio?: string;
    resolution?: string;
  }) {
    const base = String(this.config.baseUrl ?? "")
      .trim()
      .replace(/\/+$/, "");
    if (!base) throw new Error("请填写 ComfyUI 服务地址");
    if (request.videos?.length) throw new Error("ComfyUI MiniMax H3 工作流不支持视频参考输入，请移除视频素材");
    if (request.lastFrame) throw new Error("当前工作流不支持尾帧输入（FL2VA），请移除尾帧");

    const references = (request.images ?? []).slice(0, 10);
    const audioReferences = (request.audios ?? []).slice(0, 4);
    const hasFirstFrame = !!request.firstFrame;
    const mode = (references.length > 0 || audioReferences.length > 0) ? "r2v" : hasFirstFrame ? "i2v" : "t2v";
    const useTurbo = request.model === "MiniMax-H3-Turbo";

    const workflow = parseWorkflow(
      mode === "r2v"
        ? useTurbo
          ? this.config.workflowR2vTurbo
          : this.config.workflowR2v
        : mode === "i2v"
          ? this.config.workflowI2v
          : this.config.workflowT2v,
      mode === "r2v"
        ? useTurbo
          ? defaultWorkflows.r2vTurbo
          : defaultWorkflows.r2v
        : mode === "i2v"
          ? defaultWorkflows.i2v
          : defaultWorkflows.t2v,
      mode === "r2v" ? (useTurbo ? "r2v Turbo" : "r2v") : mode === "i2v" ? "i2v" : "t2v",
    );

    const timeoutMinutes = numberConfig(this.config.timeoutMinutes, 20);
    const intervalMs = numberConfig(this.config.pollIntervalMs, 5000);
    // ACT: 外部取消信号保持联动，单任务渲染超时由 pollResult 在 GPU 运行后计时，排队时不超时。
    const signal = this.signal ?? new AbortController().signal;
    const stamp = Date.now().toString(36);
    const context: providerContext = this as providerContext;

    let promptText = request.prompt.trim();
    if (audioReferences.length > 0 && !/<Audio\s*\d+/i.test(promptText)) {
      const audioTags = audioReferences.map((_, i) => `<Audio ${i + 1}>`).join(" and ");
      promptText = `Use ${audioTags} as reference audio. ${promptText}`;
    }
    patchPrompt(workflow, promptText);
    const resolutionClassType = Object.values(workflow).find(
      (node) => node?.class_type === "ResolutionSelector" || (node.inputs?.megapixels != null && node.inputs?.aspect_ratio != null),
    )?.class_type;
    const aspectRatio = resolutionClassType ? await resolveAspectRatio(context, base, resolutionClassType, request.ratio || "16:9") : undefined;
    patchOptions(workflow, aspectRatio, String(request.resolution ?? ""), Number(request.duration ?? 0));
    const enableLoraNode = Object.values(workflow).find(
      (node) => node?.class_type === "PrimitiveBoolean" && /enable.*lora/i.test(String(node._meta?.title ?? "")),
    ) ?? workflow["146"];
    if (enableLoraNode?.inputs) {
      enableLoraNode.inputs.value = useTurbo;
    }
    if (mode === "i2v") {
      const bytes = await toBytes(context, request.firstFrame!);
      const name = await uploadImage(context, base, bytes, `toonflow_firstframe_${stamp}.png`, "image/png");
      patchFirstFrame(workflow, name);
    } else if (mode === "r2v") {
      const inputs = [...(hasFirstFrame ? [request.firstFrame!] : []), ...references];
      if (inputs.length > 0) {
        const names: string[] = [];
        for (const [index, input] of inputs.entries()) {
          const bytes = await toBytes(context, input);
          names.push(await uploadImage(context, base, bytes, `toonflow_ref_${stamp}_${index}.${imageExtension(input.mimeType)}`, input.mimeType || "image/png"));
        }
        patchRefImages(workflow, names);
      }
      if (audioReferences.length > 0) {
        const audioNames: string[] = [];
        for (const [index, input] of audioReferences.entries()) {
          const bytes = await toBytes(context, input);
          audioNames.push(await uploadImage(context, base, bytes, `toonflow_ref_audio_${stamp}_${index}.${audioExtension(input.mimeType)}`, input.mimeType || "audio/wav"));
        }
        patchRefAudios(workflow, audioNames);
      }
    }

    const clientId = String(this.config.clientId ?? "").trim() || `toonflow-${stamp}`;
    const promptId = await submitPrompt(context, base, workflow, clientId, signal);
    // 立即持久化任务凭据，支持中断后一键复查恢复
    await this.saveTaskData?.({ promptId, base, intervalMs });
    const videoUrl = await pollResult(context, base, promptId, signal, intervalMs, timeoutMinutes);
    return [{ mediaType: "video" as const, type: "url" as const, url: videoUrl }];
  },
  // 断点恢复：用于页面刷新、网络闪断或超时后的直接复查取回
  async resumeTask(data: Record<string, unknown>) {
    const promptId = typeof data.promptId === "string" ? data.promptId.trim() : "";
    if (!promptId) throw new Error("缺少 ComfyUI promptId 凭据，无法恢复");
    const base = String(this.config.baseUrl || data.base || "").trim().replace(/\/+$/, "");
    if (!base) throw new Error("请填写 ComfyUI 服务地址");
    const timeoutMinutes = numberConfig(this.config.timeoutMinutes, 20);
    const intervalMs = numberConfig(data.intervalMs || this.config.pollIntervalMs, 5000);
    const context: providerContext = this as unknown as providerContext;
    const signal = this.signal ?? new AbortController().signal;
    const videoUrl = await pollResult(context, base, promptId, signal, intervalMs, timeoutMinutes);
    return [{ mediaType: "video" as const, type: "url" as const, url: videoUrl }];
  },
};
