<template>
  <teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-3 md:px-6">
      <div class="pointer-events-auto mx-auto max-w-[1040px] rounded-[24px] border border-slate-200/85 bg-white/74 p-2.5 shadow-[0_18px_44px_rgba(134,154,192,0.16)] backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/68 dark:shadow-[0_18px_44px_rgba(2,6,23,0.34)]">
        <div class="flex flex-nowrap items-center justify-between gap-2.5 overflow-hidden">
          <div class="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div class="inline-flex min-w-max items-center gap-2 pr-1">
              <button
                v-for="tab in tabs"
                :key="resolveTabKey(tab)"
                :class="[
                  'inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-[11px] font-semibold whitespace-nowrap transition',
                  resolveTabKey(tab) === activeTab
                    ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-[0_12px_24px_rgba(59,130,246,0.12)] dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-200'
                    : 'border-slate-200 bg-white/82 text-slate-600 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_20px_rgba(112,136,181,0.1)] dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]',
                ]"
                type="button"
                @click="handleTabClick(tab)"
              >
                {{ resolveTabLabel(tab) }}
              </button>
            </div>
          </div>

          <div class="hidden shrink-0 items-center gap-2 sm:inline-flex">
            <button
              v-for="action in actions"
              :key="action.label"
              class="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white/82 px-3 text-[11px] font-semibold text-slate-600 whitespace-nowrap transition hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_20px_rgba(112,136,181,0.1)] dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]"
              type="button"
              @click="$emit('action', action)"
            >
              <el-icon class="text-[12px]">
                <component :is="action.icon" />
              </el-icon>
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ElIcon } from "element-plus";

const emit = defineEmits(["select-tab", "action"]);

defineProps({
  tabs: {
    type: Array,
    default: () => [],
  },
  activeTab: {
    type: String,
    default: "",
  },
  actions: {
    type: Array,
    default: () => [],
  },
});

const resolveTabKey = (tab) => {
  if (typeof tab === "string") {
    return tab;
  }

  return tab?.key || tab?.routeName || tab?.label || "";
};

const resolveTabLabel = (tab) => {
  if (typeof tab === "string") {
    return tab;
  }

  return tab?.label || tab?.routeName || tab?.key || "";
};

const handleTabClick = (tab) => {
  emit("select-tab", tab);
};
</script>
