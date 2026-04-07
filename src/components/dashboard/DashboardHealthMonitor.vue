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
          :eyebrow="activeItem?.isCurrent ? '当前成功率' : '悬浮时段'"
          :primary="activeItem?.total ? activeItem.successRateText : '--'"
          :rows="buildSummaryRows(activeItem)"
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

const resolveBarClass = (item) => {
  if (item.level === 4) {
    return item.isCurrent
      ? "bg-emerald-300 ring-1 ring-emerald-100/70"
      : "bg-emerald-300";
  }

  if (item.level === 3) {
    return item.isCurrent
      ? "bg-emerald-400/85 ring-1 ring-emerald-100/70"
      : "bg-emerald-400/85";
  }

  if (item.level === 2) {
    return item.isCurrent
      ? "bg-amber-300/85 ring-1 ring-amber-100/60"
      : "bg-amber-300/85";
  }

  if (item.level === 1) {
    return item.isCurrent
      ? "bg-rose-400/90 ring-1 ring-rose-100/60"
      : "bg-rose-400/90";
  }

  return item.isCurrent
    ? "bg-slate-300 ring-1 ring-slate-200 dark:bg-slate-700 dark:ring-slate-500/60"
    : "bg-slate-300/90 dark:bg-slate-700/90";
};

const resolveBarAriaLabel = (item) =>
  item?.total
    ? `${item.label}，成功 ${item.success} 次，失败 ${item.failed} 次，成功率 ${item.successRateText}`
    : `${item.label}，暂无请求`;

const resolveCardTone = (item) => {
  if (!item?.total) {
    return "neutral";
  }

  if (item.successRate >= 0.99) {
    return "success";
  }

  if (item.successRate >= 0.95) {
    return "accent";
  }

  if (item.successRate >= 0.85) {
    return "warning";
  }

  return "danger";
};

const buildSummaryRows = (item) => [
  {
    dotClass: "bg-emerald-400",
    label: "成功",
    value: `${item?.success || 0} 次`,
    valueClass: "font-semibold text-emerald-600 dark:text-emerald-300",
  },
  {
    dotClass: "bg-rose-400",
    label: "失败",
    value: `${item?.failed || 0} 次`,
    valueClass: "font-semibold text-rose-500 dark:text-rose-300",
  },
];
</script>
