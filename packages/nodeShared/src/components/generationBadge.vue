<template>
  <div v-if="isOutdated || isUnreviewed" class="generationBadge nodrag nopan">
    <el-tooltip
      v-if="isOutdated"
      content="提示词已被修改，当前展示为历史版本，建议重新生成"
      placement="top"
      :showAfter="200">
      <span class="badgeItem badgeOutdated">
        <span class="badgeDot" />
        <span class="badgeText">待重新生成</span>
      </span>
    </el-tooltip>
    <el-tooltip
      v-else-if="isUnreviewed"
      content="新生成内容尚未查看，点击可标为已查看"
      placement="top"
      :showAfter="200">
      <span class="badgeItem badgeUnreviewed" role="button" tabindex="0" @click.stop="emit('reviewed')">
        <span class="badgeDot" />
        <span class="badgeText">新生成</span>
      </span>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ElTooltip } from "element-plus";

defineProps<{
  isOutdated?: boolean;
  isUnreviewed?: boolean;
}>();

const emit = defineEmits<{
  reviewed: [];
}>();
</script>

<style scoped lang="scss">
.generationBadge {
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  user-select: none;

  .badgeItem {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 18px;
    padding: 0 6px;
    font-size: 11px;
    font-weight: 500;
    line-height: 18px;
    border-radius: 9px;
    cursor: default;
    transition: all 0.2s ease;

    .badgeDot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .badgeText {
      line-height: 1;
    }

    &.badgeOutdated {
      color: var(--el-color-warning-dark-2, #b88230);
      background-color: var(--el-color-warning-light-9, #fdf6ec);
      border: 1px solid var(--el-color-warning-light-5, #f3d19e);

      .badgeDot {
        background-color: var(--el-color-warning, #e6a23c);
        box-shadow: 0 0 0 2px var(--el-color-warning-light-7, #faecd8);
      }
    }

    &.badgeUnreviewed {
      color: var(--el-color-success-dark-2, #529b2e);
      background-color: var(--el-color-success-light-9, #f0f9eb);
      border: 1px solid var(--el-color-success-light-5, #b3e19d);
      cursor: pointer;

      &:hover {
        background-color: var(--el-color-success-light-8, #e1f3d8);
      }

      .badgeDot {
        background-color: var(--el-color-success, #67c23a);
        box-shadow: 0 0 0 2px var(--el-color-success-light-7, #d1edc4);
        animation: badgePulse 2s infinite;
      }
    }
  }
}

@keyframes badgePulse {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}
</style>
