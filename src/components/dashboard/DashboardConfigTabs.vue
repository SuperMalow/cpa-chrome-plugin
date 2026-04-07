<template>
  <section class="rounded-[22px] border border-slate-200/80 bg-white/62 p-3 shadow-[0_20px_48px_rgba(134,154,192,0.14)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/54 dark:shadow-[0_20px_48px_rgba(2,6,23,0.32)]">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 class="text-sm font-bold text-slate-700 dark:text-slate-100">数据源切换</h3>
        <p class="mt-1 text-[12px] text-slate-500 dark:text-slate-400">切换不同配置，查看对应接入的数据面板。</p>
      </div>

      <span class="inline-flex min-h-7 items-center rounded-full border border-slate-200 bg-white/85 px-3 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900/72 dark:text-slate-300">
        {{ items.length }} 个配置
      </span>
    </div>

    <div class="mt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div class="inline-flex min-w-max items-center gap-2.5 pb-1">
        <CpaConfigSelector
          v-for="item in items"
          :key="item.id"
          :name="item.label"
          :active="item.id === activeId"
          :enabled="item.enabled"
          :indicator-class="resolveIndicatorClass(item)"
          @click="$emit('change', item.id)"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import CpaConfigSelector from "@/components/settings/CpaConfigSelector.vue";

defineEmits(["change"]);

defineProps({
  activeId: {
    type: String,
    default: "",
  },
  items: {
    type: Array,
    default: () => [],
  },
});

const resolveIndicatorClass = (item) => {
  if (item.tone === "danger") {
    return "bg-rose-400";
  }

  if (item.tone === "warning") {
    return "bg-amber-400";
  }

  if (item.tone === "accent") {
    return "bg-sky-400 animate-pulse";
  }

  if (item.tone === "success") {
    return "bg-emerald-400";
  }

  if (item.enabled) {
    return "bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.16)]";
  }

  return "bg-slate-300 dark:bg-slate-600";
};
</script>
