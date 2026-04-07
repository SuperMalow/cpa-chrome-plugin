<template>
  <section class="mx-auto mb-5 flex w-full max-w-[1180px] flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
    <div>
      <span class="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-[0.04em] text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
        {{ kicker }}
      </span>
      <h1 class="mt-3 text-[clamp(2rem,4vw,2.6rem)] leading-none tracking-[-0.04em] text-slate-800 dark:text-slate-100">
        {{ title }}
      </h1>
      <p class="mt-2 text-base text-slate-500 dark:text-slate-400">{{ subtitle }}</p>
    </div>

    <div class="flex flex-wrap gap-3">
      <button
        v-for="action in actions"
        :key="action.label"
        :class="[
          'inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition hover:shadow-[0_10px_24px_rgba(112,136,181,0.1)]',
          action.variant === 'solid'
            ? 'border-transparent bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:brightness-105 hover:shadow-[0_10px_24px_rgba(91,140,255,0.18)]'
            : 'border-slate-200 bg-white/85 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-900/86 dark:hover:shadow-[0_10px_24px_rgba(2,6,23,0.28)]',
        ]"
        type="button"
        @click="$emit('action', action)"
      >
        <el-icon>
          <component :is="action.icon" />
        </el-icon>
        {{ action.label }}
      </button>

      <slot name="extra-actions" />
    </div>
  </section>
</template>

<script setup>
import { ElIcon } from "element-plus";

defineProps({
  kicker: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: "",
  },
  actions: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["action"]);
</script>
