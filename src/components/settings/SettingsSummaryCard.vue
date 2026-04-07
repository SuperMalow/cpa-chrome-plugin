<template>
  <article
    :class="[
      'stats w-full rounded-[24px] border shadow-sm backdrop-blur-sm',
      toneClass,
    ]"
  >
    <div class="stat px-5 py-4">
      <div class="stat-title text-[13px] font-semibold text-slate-500 dark:text-slate-400">{{ label }}</div>
      <div :class="['stat-value text-[clamp(1.8rem,2.6vw,2.2rem)] font-bold tabular-nums', valueClass]">{{ value }}</div>
      <div class="stat-desc text-[13px] text-slate-500 dark:text-slate-400">{{ note }}</div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  note: {
    type: String,
    default: "",
  },
  tone: {
    type: String,
    default: "neutral",
  },
});

const toneMap = {
  neutral: {
    toneClass: "border-slate-200 bg-white/88 dark:border-slate-800 dark:bg-slate-900/76",
    valueClass: "text-slate-800 dark:text-slate-100",
  },
  success: {
    toneClass: "border-emerald-100 bg-emerald-50/88 dark:border-emerald-900/60 dark:bg-emerald-950/52",
    valueClass: "text-emerald-600 dark:text-emerald-300",
  },
  accent: {
    toneClass: "border-blue-100 bg-blue-50/88 dark:border-sky-900/60 dark:bg-sky-950/52",
    valueClass: "text-blue-600 dark:text-sky-300",
  },
  warning: {
    toneClass: "border-amber-100 bg-amber-50/88 dark:border-amber-900/60 dark:bg-amber-950/52",
    valueClass: "text-amber-600 dark:text-amber-300",
  },
  danger: {
    toneClass: "border-rose-100 bg-rose-50/88 dark:border-rose-900/60 dark:bg-rose-950/52",
    valueClass: "text-rose-500 dark:text-rose-300",
  },
};

const toneClass = computed(() => toneMap[props.tone]?.toneClass || toneMap.neutral.toneClass);
const valueClass = computed(() => toneMap[props.tone]?.valueClass || toneMap.neutral.valueClass);
</script>
