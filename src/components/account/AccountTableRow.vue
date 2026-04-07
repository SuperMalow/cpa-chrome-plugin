<template>
  <tr class="border-t border-slate-200/80 text-[12px] text-slate-600 dark:border-slate-800/80 dark:text-slate-300">
    <td class="px-4 py-4 align-top">
      <label class="inline-flex cursor-pointer items-center">
        <input
          :checked="selected"
          class="checkbox checkbox-sm rounded-[6px] border-slate-300 bg-white text-blue-500 [--chkbg:theme(colors.blue.500)] [--chkfg:white] dark:border-slate-600 dark:bg-slate-900"
          type="checkbox"
          :disabled="busy"
          @change="$emit('toggle', item.id)"
        />
      </label>
    </td>

    <td class="px-4 py-4 align-top">
      <div class="min-w-[240px]">
        <p class="truncate font-semibold text-slate-800 dark:text-slate-100">
          {{ item.fileName }}
        </p>
        <p class="mt-1 truncate text-[11px] text-slate-500 dark:text-slate-400">
          {{ item.email || item.account }}
        </p>
      </div>
    </td>

    <td class="px-4 py-4 align-top">
      <div class="min-w-[110px]">
        <span
          :class="[
            'inline-flex min-h-7 items-center rounded-full border px-3 text-[10px] font-semibold whitespace-nowrap',
            statusClass,
          ]"
        >
          {{ item.statusLabel }}
        </span>
        <p class="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          {{ statusNote }}
        </p>
      </div>
    </td>

    <td class="px-4 py-4 align-top">
      <div class="min-w-[120px]">
        <p class="font-semibold text-slate-700 dark:text-slate-100">
          {{ item.providerLabel }}
        </p>
        <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {{ providerNote }}
        </p>
      </div>
    </td>

    <td class="px-4 py-4 align-top">
      <div class="min-w-[220px]">
        <p class="truncate font-semibold text-slate-700 dark:text-slate-100">
          {{ item.account }}
        </p>
        <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          {{ item.accountTypeLabel }}
        </p>
      </div>
    </td>

    <td class="px-4 py-4 align-top">
      <div class="min-w-[130px]">
        <p class="font-semibold tabular-nums text-slate-700 dark:text-slate-100">
          {{ item.updatedAtText }}
        </p>
        <p class="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
          创建于 {{ item.createdAtText }}
        </p>
      </div>
    </td>

    <td class="px-4 py-4 align-top">
      <div class="flex min-w-[110px] items-center gap-2">
        <button
          :class="[
            'inline-flex h-7 cursor-pointer items-center rounded-full border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
            item.disabled
              ? 'border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-300 dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-300'
              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300',
          ]"
          type="button"
          :disabled="busy"
          @click="$emit(item.disabled ? 'enable' : 'disable', item.id)"
        >
          {{ item.disabled ? "启用" : "停用" }}
        </button>

        <button
          class="inline-flex h-7 cursor-pointer items-center rounded-full border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-500 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300"
          type="button"
          :disabled="busy"
          @click="$emit('remove', item.id)"
        >
          删除
        </button>
      </div>
    </td>
  </tr>
</template>

<script setup>
import { computed } from "vue";

defineEmits(["toggle", "disable", "enable", "remove"]);

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
  busy: {
    type: Boolean,
    default: false,
  },
});

const statusClassMap = {
  neutral: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300",
  success: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300",
  warning: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300",
  danger: "border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300",
};

const statusClass = computed(
  () => statusClassMap[props.item.statusTone] || statusClassMap.neutral,
);

const statusNote = computed(() => {
  if (props.item.statusMessage) {
    return props.item.statusMessage;
  }

  if (props.item.unavailable) {
    return "当前不可用";
  }

  if (props.item.disabled) {
    return "当前已停用";
  }

  return "当前可用";
});

const providerNote = computed(() => `${props.item.sourceLabel} / ${props.item.sizeText}`);
</script>
