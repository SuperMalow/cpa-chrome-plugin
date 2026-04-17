<template>
  <section class="mt-4 rounded-[22px] border border-slate-200 bg-gradient-to-b from-slate-50/90 to-slate-100/70 p-4 dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-950/72">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div class="min-w-0">
        <h3 class="text-[20px] font-bold leading-tight tracking-[-0.03em] text-slate-800 dark:text-slate-100">服务健康监测</h3>
        <p class="mt-1 text-[12px] text-slate-500 dark:text-slate-400">基于 models 明细里的 failed 字段，按小时计算成功率。</p>
      </div>
    </div>

    <DashboardTimelineBars
      class="mt-4"
      title="服务成功率"
      description="悬浮到时段条上，可查看成功、失败与成功率。"
      :items="items"
      button-class="h-7 rounded-[2px]"
      track-class="items-center"
      :get-aria-label="resolveBarAriaLabel"
      :get-bar-class="resolveBarClass"
    >
      <template #summary="{ activeItem }">
        <DashboardTimelineDetailCard
          :class="SERVICE_HEALTH_SUMMARY_CARD_CLASS"
          :eyebrow="activeItem?.isCurrent ? '当前成功率' : '悬浮时段'"
          :primary="activeItem?.total ? activeItem.successRateText : '--'"
          :row-item-class="SERVICE_HEALTH_SUMMARY_ROW_CLASS"
          :rows="buildSummaryRows(activeItem)"
          :rows-wrap-class="SERVICE_HEALTH_SUMMARY_ROWS_CLASS"
          :secondary="activeItem?.label || '暂无请求明细'"
          :tone="resolveCardTone(activeItem)"
        />
      </template>
    </DashboardTimelineBars>

    <p class="mt-3 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
      {{ summary.note }}
    </p>
  </section>
</template>

<script setup>
import DashboardTimelineBars from "@/components/dashboard/DashboardTimelineBars.vue";
import DashboardTimelineDetailCard from "@/components/dashboard/DashboardTimelineDetailCard.vue";
import {
  SERVICE_HEALTH_SUMMARY_CARD_CLASS,
  SERVICE_HEALTH_SUMMARY_ROW_CLASS,
  SERVICE_HEALTH_SUMMARY_ROWS_CLASS,
  SERVICE_HEALTH_SUMMARY_STATUS_ROW_CLASS,
} from "@/utils/dashboardTimelineLayout";

defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  summary: {
    type: Object,
    default: () => ({
      label: "等待同步",
      note: "",
      tone: "neutral",
    }),
  },
});

const toneBarClassMap = {
  neutral: {
    base: "bg-slate-300/90 dark:bg-slate-700/90",
    current: "bg-slate-300 ring-1 ring-slate-200 dark:bg-slate-700 dark:ring-slate-500/60",
  },
  critical: {
    base: "bg-red-800",
    current: "bg-red-800 ring-1 ring-red-200/80",
  },
  "high-risk": {
    base: "bg-red-600",
    current: "bg-red-600 ring-1 ring-red-200/70",
  },
  attention: {
    base: "bg-orange-600",
    current: "bg-orange-600 ring-1 ring-orange-200/70",
  },
  caution: {
    base: "bg-yellow-700",
    current: "bg-yellow-700 ring-1 ring-yellow-200/70",
  },
  good: {
    base: "bg-lime-600",
    current: "bg-lime-600 ring-1 ring-lime-200/70",
  },
  excellent: {
    base: "bg-green-800",
    current: "bg-green-800 ring-1 ring-green-200/80",
  },
};

const statusDotClassMap = {
  neutral: "bg-slate-400/70 dark:bg-slate-500",
  critical: "bg-red-800",
  "high-risk": "bg-red-600",
  attention: "bg-orange-600",
  caution: "bg-yellow-700",
  good: "bg-lime-600",
  excellent: "bg-green-800",
};

const statusValueClassMap = {
  neutral: "font-semibold text-slate-700 dark:text-slate-100",
  critical: "font-semibold text-red-800 dark:text-red-300",
  "high-risk": "font-semibold text-red-600 dark:text-red-300",
  attention: "font-semibold text-orange-600 dark:text-orange-300",
  caution: "font-semibold text-yellow-700 dark:text-yellow-300",
  good: "font-semibold text-lime-600 dark:text-lime-300",
  excellent: "font-semibold text-green-800 dark:text-green-300",
};

const resolveItemTone = (item) => item?.status?.tone || "neutral";

const resolveBarClass = (item) => {
  const toneMeta = toneBarClassMap[resolveItemTone(item)] || toneBarClassMap.neutral;

  return item.isCurrent ? toneMeta.current : toneMeta.base;
};

const resolveBarAriaLabel = (item) =>
  item?.total
    ? `${item.label}，成功 ${item.success} 次，失败 ${item.failed} 次，成功率 ${item.successRateText}，状态 ${item.status?.label || "暂无数据"}`
    : `${item.label}，暂无请求`;

const resolveCardTone = (item) => resolveItemTone(item);

const buildSummaryRows = (item) => [
  {
    className: `${SERVICE_HEALTH_SUMMARY_ROW_CLASS} ${SERVICE_HEALTH_SUMMARY_STATUS_ROW_CLASS}`,
    dotClass: statusDotClassMap[resolveItemTone(item)] || statusDotClassMap.neutral,
    label: "状态",
    value: item?.status?.label || "暂无数据",
    valueClass: statusValueClassMap[resolveItemTone(item)] || statusValueClassMap.neutral,
  },
  {
    className: SERVICE_HEALTH_SUMMARY_ROW_CLASS,
    dotClass: "bg-emerald-400",
    label: "成功",
    value: `${item?.success || 0} 次`,
    valueClass: "font-semibold text-emerald-600 dark:text-emerald-300",
  },
  {
    className: SERVICE_HEALTH_SUMMARY_ROW_CLASS,
    dotClass: "bg-rose-400",
    label: "失败",
    value: `${item?.failed || 0} 次`,
    valueClass: "font-semibold text-rose-500 dark:text-rose-300",
  },
];
</script>
