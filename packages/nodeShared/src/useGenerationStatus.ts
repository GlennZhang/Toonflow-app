import { computed, watch, type Ref } from "vue";
import { useNode } from "@vue-flow/core";

export type GenerationNodeData = {
  prompt?: string;
  lastGeneratedPrompt?: string;
  unreviewed?: boolean;
  [key: string]: unknown;
};

export function useGenerationStatus(
  data: Ref<GenerationNodeData> | { value: GenerationNodeData },
  hasOutput: Ref<boolean | unknown> | (() => boolean | unknown)
) {
  const { node } = useNode();

  const currentPrompt = computed(() => (data.value.prompt ?? "").trim());
  const lastPrompt = computed(() => (data.value.lastGeneratedPrompt ?? "").trim());
  const outputPresent = computed(() => !!(typeof hasOutput === "function" ? hasOutput() : hasOutput.value));

  // 仅在已有输出物、且记录过历史生成提示词、且当前提示词与历史不一致时判定为已过期
  const isOutdated = computed(() => {
    if (!outputPresent.value) return false;
    if (data.value.lastGeneratedPrompt === undefined) return false;
    return currentPrompt.value !== lastPrompt.value;
  });

  // 判定是否新生成尚未查看
  const isUnreviewed = computed(() => {
    return outputPresent.value && data.value.unreviewed === true;
  });

  function recordGenerated(prompt?: string) {
    const targetPrompt = prompt !== undefined ? prompt : (data.value.prompt ?? "");
    data.value.lastGeneratedPrompt = targetPrompt;
    data.value.unreviewed = true;
  }

  function markAsReviewed() {
    if (data.value.unreviewed) {
      data.value.unreviewed = false;
    }
  }

  return {
    isOutdated,
    isUnreviewed,
    recordGenerated,
    markAsReviewed,
  };
}
