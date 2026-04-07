<template>
  <article
    :class="[
      'w-full rounded-[18px] border px-3.5 py-3 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:min-w-[220px] sm:max-w-[260px]',
      toneClass,
    ]"
  >
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

    <div
      v-if="rows.length"
      class="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] tabular-nums"
    >
      <div
        v-for="row in rows"
        :key="row.label"
        class="inline-flex items-center gap-2"
      >
        <span
          :class="[
            'h-1.5 w-1.5 rounded-full',
            row.dotClass || defaultDotClass,
          ]"
        />
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
};

const primaryClassMap = {
  neutral: "text-slate-800 dark:text-slate-50",
  success: "text-emerald-600 dark:text-emerald-300",
  warning: "text-amber-600 dark:text-amber-300",
  danger: "text-rose-500 dark:text-rose-300",
  accent: "text-sky-600 dark:text-sky-300",
};

const defaultDotClassMap = {
  neutral: "bg-slate-400/70 dark:bg-slate-500",
  success: "bg-emerald-400",
  warning: "bg-amber-400",
  danger: "bg-rose-400",
  accent: "bg-sky-400",
};

const toneClass = computed(() => toneClassMap[props.tone] || toneClassMap.neutral);
const primaryClass = computed(() => primaryClassMap[props.tone] || primaryClassMap.neutral);
const defaultDotClass = computed(
  () => defaultDotClassMap[props.tone] || defaultDotClassMap.neutral,
);
</script>
