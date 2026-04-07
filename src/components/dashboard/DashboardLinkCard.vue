<template>
  <article class="rounded-3xl border border-slate-200 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/78">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-2 text-slate-700 dark:text-slate-100">
        <el-icon class="text-base text-slate-500 dark:text-slate-400">
          <component :is="icon" />
        </el-icon>
        <span class="font-semibold">{{ name }}</span>
      </div>

      <DashboardStatusPill :label="status" :tone="tone" />
    </div>

    <p class="mt-3 min-h-11 text-sm leading-6 text-slate-500 dark:text-slate-400">{{ description }}</p>

    <div class="mt-3 flex items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
      <span>{{ endpoint }}</span>
      <strong class="text-slate-700 dark:text-slate-200">{{ metric }}</strong>
    </div>
  </article>
</template>

<script setup>
import { ElIcon } from "element-plus";
import DashboardStatusPill from "@/components/dashboard/DashboardStatusPill.vue";

defineProps({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  endpoint: {
    type: String,
    default: "",
  },
  metric: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    default: "",
  },
  tone: {
    type: String,
    default: "neutral",
  },
  icon: {
    type: [Object, Function],
    required: true,
  },
});
</script>
