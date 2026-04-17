<template>
  <article
    :class="[
      'stats min-w-0 w-full max-w-full overflow-hidden rounded-3xl border shadow-sm',
      wrapperToneClass,
    ]"
  >
    <div class="stat min-w-0 gap-1 px-4 py-4 md:px-5">
      <div class="stat-figure self-start">
        <span :class="['mt-1 inline-flex h-2.5 w-2.5 rounded-full', dotToneClass]"></span>
      </div>

      <div class="stat-title max-w-full pr-1 text-[13px] font-semibold leading-5 text-slate-500 whitespace-normal break-words dark:text-slate-400">
        {{ label }}
      </div>

      <div
        :class="[
          'stat-value max-w-full overflow-hidden tabular-nums text-[clamp(1.65rem,1.6vw,2.05rem)] font-bold leading-none tracking-[-0.05em]',
          valueToneClass,
        ]"
      >
        {{ value }}
      </div>

      <div :class="['stat-desc mt-1 max-w-full text-[13px] leading-5 whitespace-normal break-words', descToneClass]">
        {{ note }}
      </div>
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

const wrapperToneClassMap = {
  neutral: "border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/80",
  success: "border-emerald-100 bg-emerald-50/85 dark:border-emerald-900/60 dark:bg-emerald-950/50",
  warning: "border-amber-100 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/50",
  danger: "border-rose-100 bg-rose-50/85 dark:border-rose-900/60 dark:bg-rose-950/50",
  accent: "border-blue-100 bg-blue-50/90 dark:border-sky-900/60 dark:bg-sky-950/50",
  critical: "border-red-200 bg-red-50/90 dark:border-red-900/60 dark:bg-red-950/50",
  "high-risk": "border-red-100 bg-red-50/88 dark:border-red-900/60 dark:bg-red-950/50",
  attention: "border-orange-100 bg-orange-50/90 dark:border-orange-900/60 dark:bg-orange-950/50",
  caution: "border-yellow-100 bg-yellow-50/90 dark:border-yellow-900/60 dark:bg-yellow-950/50",
  good: "border-lime-100 bg-lime-50/90 dark:border-lime-900/60 dark:bg-lime-950/50",
  excellent: "border-green-100 bg-green-50/90 dark:border-green-900/60 dark:bg-green-950/50",
};

const valueToneClassMap = {
  neutral: "text-slate-800 dark:text-slate-100",
  success: "text-emerald-600 dark:text-emerald-300",
  warning: "text-amber-600 dark:text-amber-300",
  danger: "text-rose-500 dark:text-rose-300",
  accent: "text-blue-600 dark:text-sky-300",
  critical: "text-red-800 dark:text-red-300",
  "high-risk": "text-red-600 dark:text-red-300",
  attention: "text-orange-600 dark:text-orange-300",
  caution: "text-yellow-700 dark:text-yellow-300",
  good: "text-lime-600 dark:text-lime-300",
  excellent: "text-green-800 dark:text-green-300",
};

const descToneClassMap = {
  neutral: "text-slate-500 dark:text-slate-400",
  success: "text-emerald-700/80 dark:text-emerald-300/80",
  warning: "text-amber-700/80 dark:text-amber-300/80",
  danger: "text-rose-700/80 dark:text-rose-300/80",
  accent: "text-blue-700/80 dark:text-sky-300/80",
  critical: "text-red-800/80 dark:text-red-300/80",
  "high-risk": "text-red-700/80 dark:text-red-300/80",
  attention: "text-orange-700/80 dark:text-orange-300/80",
  caution: "text-yellow-800/80 dark:text-yellow-300/80",
  good: "text-lime-700/80 dark:text-lime-300/80",
  excellent: "text-green-800/80 dark:text-green-300/80",
};

const dotToneClassMap = {
  neutral: "bg-slate-300",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-rose-400",
  accent: "bg-blue-400",
  critical: "bg-red-800",
  "high-risk": "bg-red-600",
  attention: "bg-orange-600",
  caution: "bg-yellow-700",
  good: "bg-lime-600",
  excellent: "bg-green-800",
};

const wrapperToneClass = computed(
  () => wrapperToneClassMap[props.tone] || wrapperToneClassMap.neutral,
);
const valueToneClass = computed(
  () => valueToneClassMap[props.tone] || valueToneClassMap.neutral,
);
const descToneClass = computed(
  () => descToneClassMap[props.tone] || descToneClassMap.neutral,
);
const dotToneClass = computed(
  () => dotToneClassMap[props.tone] || dotToneClassMap.neutral,
);
</script>
