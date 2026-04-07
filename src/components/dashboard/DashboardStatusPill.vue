<template>
  <span
    :class="[
      'inline-flex min-h-8 items-center rounded-full border px-3 text-[13px] font-semibold whitespace-nowrap',
      toneClass,
    ]"
  >
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  tone: {
    type: String,
    default: "neutral",
  },
});

const toneClassMap = {
  neutral: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300",
  success: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300",
  warning: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300",
  danger: "border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300",
  accent: "border-blue-200 bg-blue-50 text-blue-600 dark:border-sky-900/70 dark:bg-sky-950/50 dark:text-sky-300",
};

const toneClass = computed(() => toneClassMap[props.tone] || toneClassMap.neutral);
</script>
