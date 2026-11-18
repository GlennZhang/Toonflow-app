<template>
  <div class="canvasTaskPanel">
    <div class="panelHeader">
      <div class="headerTitle">
        <icon-list-check :size="16" />
        <span>生成与审阅任务</span>
      </div>
      <el-button
        v-if="unreviewedNodes.length"
        class="headerAction"
        text
        size="small"
        :icon="IconCheck"
        @click="markAllReviewed">
        全部标为已看
      </el-button>
    </div>

    <el-tabs v-model="activeTab" class="taskTabs">
      <el-tab-pane name="outdated">
        <template #label>
          <span class="tabLabel">
            待重新生成
            <span v-if="outdatedNodes.length" class="countBadge outdated">{{ outdatedNodes.length }}</span>
          </span>
        </template>
        <div v-if="outdatedNodes.length" class="taskList">
          <div
            v-for="item in outdatedNodes"
            :key="item.id"
            class="taskItem"
            @click="focusNode(item.id)">
            <div class="itemIcon" :class="item.mediaType">
              <component :is="item.icon" :size="16" />
            </div>
            <div class="itemContent">
              <div class="itemTitle">{{ item.label }}</div>
              <div class="itemPrompt">{{ item.prompt || "暂无提示词" }}</div>
            </div>
            <el-tooltip content="定位到节点" placement="top" :showAfter="300">
              <el-button class="itemAction" text :icon="IconFocusCentered" @click.stop="focusNode(item.id)" />
            </el-tooltip>
          </div>
        </div>
        <el-empty v-else description="所有节点均为最新版本" :imageSize="48" />
      </el-tab-pane>

      <el-tab-pane name="unreviewed">
        <template #label>
          <span class="tabLabel">
            新生成待查看
            <span v-if="unreviewedNodes.length" class="countBadge unreviewed">{{ unreviewedNodes.length }}</span>
          </span>
        </template>
        <div v-if="unreviewedNodes.length" class="taskList">
          <div
            v-for="item in unreviewedNodes"
            :key="item.id"
            class="taskItem unreviewedItem"
            @click="reviewAndFocusNode(item.id)">
            <div class="itemIcon" :class="item.mediaType">
              <component :is="item.icon" :size="16" />
            </div>
            <div class="itemContent">
              <div class="itemTitle">
                <span>{{ item.label }}</span>
                <span class="newBadge">NEW</span>
              </div>
              <div class="itemPrompt">{{ item.prompt || "暂无提示词" }}</div>
            </div>
            <el-tooltip content="标记为已看并定位" placement="top" :showAfter="300">
              <el-button class="itemAction" text :icon="IconCheck" @click.stop="reviewNode(item.id)" />
            </el-tooltip>
          </div>
        </div>
        <el-empty v-else description="暂无新生成待查看项" :imageSize="48" />
      </el-tab-pane>

      <el-tab-pane v-if="generatingNodes.length" name="generating">
        <template #label>
          <span class="tabLabel">
            生成中
            <span class="countBadge generating">{{ generatingNodes.length }}</span>
          </span>
        </template>
        <div class="taskList">
          <div
            v-for="item in generatingNodes"
            :key="item.id"
            class="taskItem"
            @click="focusNode(item.id)">
            <div class="itemIcon generatingIcon" :class="item.mediaType">
              <icon-loader-2 class="spinIcon" :size="16" />
            </div>
            <div class="itemContent">
              <div class="itemTitle">{{ item.label }}</div>
              <div class="itemPrompt">正在后台生成中…</div>
            </div>
            <el-button class="itemAction" text :icon="IconFocusCentered" @click.stop="focusNode(item.id)" />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from "vue";
import { useVueFlow } from "@vue-flow/core";
import { ElTabs, ElTabPane, ElButton, ElEmpty, ElTooltip } from "element-plus";
import {
  IconListCheck,
  IconFocusCentered,
  IconCheck,
  IconCameraAi,
  IconPhotoAi,
  IconMusicBolt,
  IconLoader2,
} from "@tabler/icons-vue";

const flow = useVueFlow();
const activeTab = ref<"outdated" | "unreviewed" | "generating">("outdated");

type TaskNodeItem = {
  id: string;
  label: string;
  prompt: string;
  mediaType: "video" | "image" | "audio";
  icon: Component;
  isOutdated: boolean;
  isUnreviewed: boolean;
  isGenerating: boolean;
};

const allTaskNodes = computed<TaskNodeItem[]>(() => {
  return flow.getNodes.value.flatMap((node) => {
    const rawType = node.type?.replace(/^remote-/, "") ?? "";
    let mediaType: "video" | "image" | "audio" | undefined;
    let icon: Component = IconCameraAi;

    if (rawType === "videoGenerationNode") {
      mediaType = "video";
      icon = IconCameraAi;
    } else if (rawType === "imageGenerationNode") {
      mediaType = "image";
      icon = IconPhotoAi;
    } else if (rawType === "audioGenerationNode") {
      mediaType = "audio";
      icon = IconMusicBolt;
    } else {
      return [];
    }

    const data = (node.data ?? {}) as {
      label?: string;
      prompt?: string;
      lastGeneratedPrompt?: string;
      unreviewed?: boolean;
      mediaTask?: { state?: string };
    };

    const prompt = (data.prompt ?? "").trim();
    const lastPrompt = (data.lastGeneratedPrompt ?? "").trim();
    const isOutdated = data.lastGeneratedPrompt !== undefined && prompt !== lastPrompt;
    const isUnreviewed = data.unreviewed === true;
    const taskState = data.mediaTask?.state;
    const isGenerating = taskState === "submitting" || taskState === "running";

    const defaultLabels: Record<string, string> = {
      video: "视频生成",
      image: "图片生成",
      audio: "音频生成",
    };
    const label = (typeof data.label === "string" && data.label.trim())
      ? data.label
      : (typeof node.label === "string" && node.label.trim())
        ? node.label
        : defaultLabels[mediaType];

    return [
      {
        id: node.id,
        label,
        prompt,
        mediaType,
        icon,
        isOutdated,
        isUnreviewed,
        isGenerating,
      },
    ];
  });
});

const outdatedNodes = computed(() => allTaskNodes.value.filter((item) => item.isOutdated && !item.isGenerating));
const unreviewedNodes = computed(() => allTaskNodes.value.filter((item) => item.isUnreviewed && !item.isGenerating));
const generatingNodes = computed(() => allTaskNodes.value.filter((item) => item.isGenerating));

function focusNode(nodeId: string) {
  const target = flow.findNode(nodeId);
  if (!target) return;
  flow.removeSelectedElements();
  flow.addSelectedNodes([target]);
  void flow.fitView({ nodes: [nodeId], padding: 0.5, duration: 250 });
}

function reviewNode(nodeId: string) {
  const target = flow.findNode(nodeId);
  if (target?.data) {
    target.data.unreviewed = false;
  }
}

function reviewAndFocusNode(nodeId: string) {
  reviewNode(nodeId);
  focusNode(nodeId);
}

function markAllReviewed() {
  unreviewedNodes.value.forEach((item) => {
    reviewNode(item.id);
  });
}
</script>

<style scoped lang="scss">
.canvasTaskPanel {
  width: 320px;
  max-height: 420px;
  display: flex;
  flex-direction: column;

  .panelHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px 6px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    .headerTitle {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .headerAction {
      padding: 0 4px;
      height: 22px;
      font-size: 12px;
    }
  }

  .taskTabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    :deep(.el-tabs__header) {
      margin: 0;
      padding: 0 12px;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      overflow-y: auto;
      max-height: 320px;
      padding: 8px 0;
    }

    .tabLabel {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;

      .countBadge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 600;
        line-height: 1;
        color: #fff;

        &.outdated {
          background-color: var(--el-color-warning);
        }

        &.unreviewed {
          background-color: var(--el-color-success);
        }

        &.generating {
          background-color: var(--el-color-primary);
        }
      }
    }
  }

  .taskList {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 0 8px;

    .taskItem {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 8px;
      border-radius: var(--el-border-radius-base);
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: var(--el-fill-color-light);

        .itemAction {
          opacity: 1;
        }
      }

      .itemIcon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        background-color: var(--el-fill-color);
        color: var(--el-text-color-secondary);

        &.video {
          color: var(--el-color-primary);
          background-color: var(--el-color-primary-light-9);
        }

        &.image {
          color: var(--el-color-success);
          background-color: var(--el-color-success-light-9);
        }

        &.audio {
          color: var(--el-color-warning);
          background-color: var(--el-color-warning-light-9);
        }

        .spinIcon {
          animation: iconSpin 1.2s linear infinite;
        }
      }

      .itemContent {
        flex: 1;
        min-width: 0;

        .itemTitle {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: var(--el-text-color-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;

          .newBadge {
            display: inline-block;
            padding: 1px 4px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            line-height: 1;
            background-color: var(--el-color-success-light-8);
            color: var(--el-color-success-dark-2);
          }
        }

        .itemPrompt {
          font-size: 11px;
          color: var(--el-text-color-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      .itemAction {
        flex-shrink: 0;
        opacity: 0.6;
        padding: 4px;
        height: 24px;
      }
    }
  }
}

@keyframes iconSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
