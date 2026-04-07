<template>
  <teleport to="body">
    <div class="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-4 pb-3 md:px-6">
      <div class="pointer-events-auto mx-auto max-w-[1040px] rounded-[28px] border border-white/55 bg-white/42 p-3 shadow-[0_24px_60px_rgba(134,154,192,0.20)] ring-1 ring-white/35 backdrop-blur-2xl dark:border-slate-700/70 dark:bg-slate-950/45 dark:ring-slate-700/30 dark:shadow-[0_24px_60px_rgba(2,6,23,0.38)]">
        <div class="flex flex-nowrap items-center justify-between gap-3 overflow-hidden">
          <div class="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div class="inline-flex min-w-max items-center gap-2.5 pr-1">
              <button
                v-for="tab in tabs"
                :key="tab"
                :class="[
                  'inline-flex min-h-10 cursor-pointer items-center rounded-2xl border px-4 text-sm font-semibold whitespace-nowrap transition hover:shadow-[0_10px_24px_rgba(112,136,181,0.1)]',
                  tab === activeTab
                    ? 'border-blue-200/90 bg-blue-50/90 text-blue-600 hover:border-blue-300 hover:bg-blue-50 dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-300 dark:hover:border-sky-600 dark:hover:bg-sky-500/24'
                    : 'border-white/70 bg-white/52 text-slate-700 backdrop-blur-md hover:border-slate-200 hover:bg-white/66 dark:border-slate-700/70 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900/56',
                ]"
                type="button"
                @click="$emit('select-tab', tab)"
              >
                {{ tab }}
              </button>
            </div>
          </div>

          <div class="hidden h-8 w-px shrink-0 bg-white/55 dark:bg-slate-700/70 sm:block"></div>

          <div class="hidden shrink-0 items-center gap-2.5 sm:inline-flex">
            <button
              v-for="action in actions"
              :key="action.label"
              class="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-2xl border border-white/70 bg-white/52 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap backdrop-blur-md transition hover:border-slate-200 hover:bg-white/66 hover:shadow-[0_10px_24px_rgba(112,136,181,0.1)] dark:border-slate-700/70 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900/56 dark:hover:shadow-[0_10px_24px_rgba(2,6,23,0.28)]"
              type="button"
              @click="$emit('action', action)"
            >
              <el-icon>
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

defineEmits(["select-tab", "action"]);

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
</script>
