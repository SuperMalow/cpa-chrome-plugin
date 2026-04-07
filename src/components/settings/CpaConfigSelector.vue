<template>
  <button :class="[
    'inline-flex h-8 max-w-[180px] cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[10px] font-semibold whitespace-nowrap transition',
    active
      ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-[0_12px_24px_rgba(59,130,246,0.12)] dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-200'
      : 'border-slate-200 bg-white/82 text-slate-600 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_20px_rgba(112,136,181,0.1)] dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]',
  ]" type="button">
    <span :class="[
      'h-1.5 w-1.5 shrink-0 rounded-full',
      indicatorClass || (enabled
        ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.16)]'
        : 'bg-slate-300 dark:bg-slate-500'),
    ]"></span>
    <span class="truncate text-xs">{{ name }}</span>
  </button>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    required: true,
  },
  active: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  indicatorClass: {
    type: String,
    default: "",
  },
});
</script>
