<template>
  <article
    class="rounded-[22px] border border-slate-200/90 bg-white/88 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.62),0_10px_30px_rgba(148,163,184,0.12)] dark:border-slate-700 dark:bg-slate-950 dark:shadow-[inset_0_1px_0_rgba(148,163,184,0.08)]"
  >
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0">
        <h4 class="text-[13px] font-bold text-slate-800 dark:text-slate-100">{{ title }}</h4>
        <p
          v-if="description"
          class="mt-1 text-[11px] leading-5 text-slate-500 dark:text-slate-400"
        >
          {{ description }}
        </p>
      </div>

      <slot name="summary" :active-item="activeItem" />
    </div>

    <div
      class="mt-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      @mouseleave="clearActive"
    >
      <div :class="['flex min-w-[320px] gap-1.5', trackClass]">
        <button
          v-for="(item, index) in items"
          :key="item.key"
          :aria-label="resolveAriaLabel(item, index)"
          :class="[
            'flex-1 cursor-pointer transition duration-200 hover:opacity-90 focus:outline-none focus:ring-1 focus:ring-slate-300/80 dark:focus:ring-white/25',
            buttonClass,
            resolveBarClass(item, index),
          ]"
          :style="resolveBarStyle(item, index)"
          type="button"
          @blur="clearActive"
          @click="setActive(item)"
          @focus="setActive(item)"
          @mouseenter="setActive(item)"
        />
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between gap-4 text-[10px] font-semibold tracking-[0.14em] text-slate-400 dark:text-slate-500">
      <span class="max-w-[42%] truncate tabular-nums">
        {{ startLabel }}
      </span>
      <span class="max-w-[42%] truncate text-right tabular-nums">
        {{ endLabel }}
      </span>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  buttonClass: {
    type: String,
    default: "rounded-t-[3px]",
  },
  description: {
    type: String,
    default: "",
  },
  getAriaLabel: {
    type: Function,
    default: (item) => item?.tooltip || item?.label || "图表数据",
  },
  getBarClass: {
    type: Function,
    default: () => "",
  },
  getBarStyle: {
    type: Function,
    default: () => ({}),
  },
  items: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: "",
  },
  trackClass: {
    type: String,
    default: "h-24 items-end",
  },
});

const activeKey = ref("");

const defaultItem = computed(() =>
  props.items.find((item) => item?.isDefaultActive) || props.items.at(-1) || props.items[0] || null,
);

const activeItem = computed(() =>
  props.items.find((item) => item.key === activeKey.value) || defaultItem.value,
);

const startLabel = computed(() => props.items[0]?.label || "--");
const endLabel = computed(() => props.items.at(-1)?.label || "--");

const setActive = (item) => {
  activeKey.value = item?.key || "";
};

const clearActive = () => {
  activeKey.value = "";
};

const resolveBarClass = (item, index) =>
  props.getBarClass?.(item, index) || "";

const resolveBarStyle = (item, index) =>
  props.getBarStyle?.(item, index) || {};

const resolveAriaLabel = (item, index) =>
  props.getAriaLabel?.(item, index) || "图表数据";
</script>
