<template>
  <section
    class="mt-4 rounded-[22px] border border-slate-200 bg-gradient-to-b from-slate-50/90 to-slate-100/70 p-4 dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-950/72">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0">
        <h3 class="text-[20px] font-bold leading-tight tracking-[-0.03em] text-slate-800 dark:text-slate-100">图表监控</h3>
        <p class="mt-1 text-[12px] text-slate-500 dark:text-slate-400">请求数量基于 models 明细按小时统计；Token 依赖后端是否返回带时间的明细。</p>
      </div>
    </div>

    <div class="mt-4 grid gap-3 xl:grid-cols-2">
      <DashboardTimelineBars title="请求数量" :description="requestSummary.note" :items="requestItems"
        button-class="rounded-t-[3px] bg-sky-400/85" track-class="h-24 items-end"
        :get-aria-label="resolveRequestAriaLabel" :get-bar-style="resolveBarStyle">
        <template #summary="{ activeItem }">
          <DashboardTimelineDetailCard :eyebrow="resolveRequestEyebrow(activeItem)"
            :primary="formatValue(activeItem?.value)" :secondary="activeItem?.rangeLabel || activeItem?.label || '暂无时段数据'"
            :tone="activeItem?.value > 0 ? 'accent' : 'neutral'" />
        </template>
      </DashboardTimelineBars>

      <DashboardTimelineBars title="Token 消耗" :description="tokenSummary.note" :items="tokenItems"
        button-class="rounded-t-[3px] bg-amber-300/90" track-class="h-24 items-end"
        :get-aria-label="resolveTokenAriaLabel" :get-bar-class="resolveTokenBarClass" :get-bar-style="resolveBarStyle">
        <template #summary="{ activeItem }">
          <DashboardTimelineDetailCard :eyebrow="resolveTokenEyebrow(activeItem)"
            :primary="resolveTokenPrimary(activeItem)"
            :secondary="resolveTokenSecondary(activeItem)"
            :tone="resolveTokenTone(activeItem)" />
        </template>
      </DashboardTimelineBars>
    </div>
  </section>
</template>

<script setup>
import DashboardTimelineBars from "@/components/dashboard/DashboardTimelineBars.vue";
import DashboardTimelineDetailCard from "@/components/dashboard/DashboardTimelineDetailCard.vue";
import { formatNumber } from "@/utils/dashboardData";

defineProps({
  requestItems: {
    type: Array,
    default: () => [],
  },
  requestSummary: {
    type: Object,
    default: () => ({
      label: "当前 0",
      note: "",
      tone: "neutral",
    }),
  },
  tokenItems: {
    type: Array,
    default: () => [],
  },
  tokenSummary: {
    type: Object,
    default: () => ({
      label: "当前 0",
      note: "",
      tone: "neutral",
    }),
  },
});

const formatValue = (value) => formatNumber(value || 0);

const resolveBarStyle = (item) => {
  const height = item.value > 0
    ? Math.max(Math.round(item.ratio * 100), 14)
    : 8;

  return {
    height: `${height}%`,
  };
};

const resolveRequestEyebrow = (item) => {
  if (item?.isCurrent) {
    return "当前小时请求";
  }

  return "悬浮时段请求";
};

const resolveTokenEyebrow = (item) => {
  if (item?.isUnavailable) {
    return "Token 时序缺失";
  }

  if (item?.isCurrent) {
    return "当前小时 Tokens";
  }

  return "悬浮时段 Tokens";
};

const resolveTokenBarClass = (item) =>
  item?.isUnavailable ? "bg-slate-300/90 dark:bg-slate-700/90" : "";

const resolveTokenPrimary = (item) =>
  item?.isUnavailable ? "--" : formatValue(item?.value);

const resolveTokenSecondary = (item) =>
  item?.isUnavailable
    ? "后端未返回带时间的 Token 明细"
    : item?.rangeLabel || item?.label || "暂无时段数据";

const resolveTokenTone = (item) => {
  if (item?.isUnavailable) {
    return "neutral";
  }

  return item?.value > 0 ? "warning" : "neutral";
};

const resolveRequestAriaLabel = (item) =>
  `${item?.rangeLabel || item?.label || "--"}，请求 ${formatValue(item?.value)} 次`;

const resolveTokenAriaLabel = (item) =>
  item?.isUnavailable
    ? "后端未返回带时间的 Token 明细，暂无法统计最近 24 小时 Token"
    : `${item?.rangeLabel || item?.label || "--"}，Tokens ${formatValue(item?.value)}`;
</script>
