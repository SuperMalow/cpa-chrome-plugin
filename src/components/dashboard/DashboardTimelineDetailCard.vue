<template>
  <article :class="[
    'w-full rounded-[18px] border px-3.5 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:min-w-[220px] sm:max-w-[260px]',
    toneClass,
  ]">
    <p class="text-[10px] font-semibold tracking-[0.18em] text-slate-500 dark:text-slate-400">
      {{ eyebrow }}
    </p>

    <div class="mt-2 min-w-0">
      <p :class="['text-[18px] font-bold leading-none tabular-nums', primaryClass]">
        {{ primary }}
      </p>
      <p class="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
        {{ secondary }}
      </p>
    </div>

    <div v-if="rows.length" :class="rowsWrapClass">
      <div v-for="row in rows" :key="row.label" :class="row.className || rowItemClass">
        <span :class="[
          'h-1.5 w-1.5 rounded-full',
          row.dotClass || defaultDotClass,
        ]" />
        <span class="text-slate-500 dark:text-slate-400">{{ row.label }}</span>
        <span :class="row.valueClass || 'font-semibold text-slate-700 dark:text-slate-100'">
          {{ row.value }}
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  eyebrow: {
    type: String,
    default: "",
  },
  primary: {
    type: String,
    default: "--",
  },
  rows: {
    type: Array,
    default: () => [],
  },
  rowsWrapClass: {
    type: String,
    default: "mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] tabular-nums",
  },
  rowItemClass: {
    type: String,
    default: "inline-flex items-center gap-2",
  },
  secondary: {
    type: String,
    default: "",
  },
  tone: {
    type: String,
    default: "neutral",
  },
});

const toneClassMap = {
  neutral: "border-slate-200/80 bg-white/72 dark:border-slate-700/80 dark:bg-slate-900/58",
  success: "border-emerald-200/70 bg-emerald-50/68 dark:border-emerald-900/60 dark:bg-emerald-950/24",
  warning: "border-amber-200/70 bg-amber-50/72 dark:border-amber-900/60 dark:bg-amber-950/24",
  danger: "border-rose-200/70 bg-rose-50/68 dark:border-rose-900/60 dark:bg-rose-950/24",
  accent: "border-sky-200/70 bg-sky-50/68 dark:border-sky-900/60 dark:bg-sky-950/24",
  critical: "border-red-200/80 bg-red-50/72 dark:border-red-900/60 dark:bg-red-950/24",
  "high-risk": "border-red-200/70 bg-red-50/68 dark:border-red-900/60 dark:bg-red-950/24",
  attention: "border-orange-200/70 bg-orange-50/72 dark:border-orange-900/60 dark:bg-orange-950/24",
  caution: "border-yellow-200/70 bg-yellow-50/72 dark:border-yellow-900/60 dark:bg-yellow-950/24",
  good: "border-lime-200/70 bg-lime-50/72 dark:border-lime-900/60 dark:bg-lime-950/24",
  excellent: "border-green-200/70 bg-green-50/72 dark:border-green-900/60 dark:bg-green-950/24",
};

const primaryClassMap = {
  neutral: "text-slate-800 dark:text-slate-50",
  success: "text-emerald-600 dark:text-emerald-300",
  warning: "text-amber-600 dark:text-amber-300",
  danger: "text-rose-500 dark:text-rose-300",
  accent: "text-sky-600 dark:text-sky-300",
  critical: "text-red-800 dark:text-red-300",
  "high-risk": "text-red-600 dark:text-red-300",
  attention: "text-orange-600 dark:text-orange-300",
  caution: "text-yellow-700 dark:text-yellow-300",
  good: "text-lime-600 dark:text-lime-300",
  excellent: "text-green-800 dark:text-green-300",
};

const defaultDotClassMap = {
  neutral: "bg-slate-400/70 dark:bg-slate-500",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-rose-400",
  accent: "bg-sky-400",
  critical: "bg-red-800",
  "high-risk": "bg-red-600",
  attention: "bg-orange-600",
  caution: "bg-yellow-700",
  good: "bg-lime-600",
  excellent: "bg-green-800",
};

const toneClass = computed(() => toneClassMap[props.tone] || toneClassMap.neutral);
const primaryClass = computed(() => primaryClassMap[props.tone] || primaryClassMap.neutral);
const defaultDotClass = computed(
  () => defaultDotClassMap[props.tone] || defaultDotClassMap.neutral,
);
</script>
