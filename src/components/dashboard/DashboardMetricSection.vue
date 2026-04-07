<template>
  <article class="min-w-0 rounded-[22px] border border-slate-200 bg-gradient-to-b from-slate-50/90 to-slate-100/70 p-4 dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-950/72">
    <div class="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 class="m-0 text-[24px] font-bold leading-tight tracking-[-0.03em] text-slate-800 dark:text-slate-100">
          {{ title }}
        </h3>
        <p class="mt-1 text-[13px] text-slate-500 dark:text-slate-400">{{ description }}</p>
      </div>

      <slot name="header-extra" />
    </div>

    <div :class="['min-w-0 grid gap-3', gridClass]">
      <DashboardMetricCard
        v-for="metric in metrics"
        :key="metric.label"
        v-bind="metric"
      />
    </div>

    <slot />
  </article>
</template>

<script setup>
import DashboardMetricCard from "@/components/dashboard/DashboardMetricCard.vue";

defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  metrics: {
    type: Array,
    default: () => [],
  },
  gridClass: {
    type: String,
    default: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4",
  },
});
</script>
