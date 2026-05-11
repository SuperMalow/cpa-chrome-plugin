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
      <div class="min-w-[190px]">
        <template v-if="quotaVisible">
          <div class="max-w-[190px] space-y-2">
            <div
              v-for="line in quotaLineItems"
              :key="line.key"
              :class="line.textClass"
            >
              <div :class="['flex items-center gap-2', line.label ? 'justify-between' : 'justify-start']">
                <span
                  v-if="line.label"
                  class="shrink-0 text-[11px] font-semibold text-slate-500 dark:text-slate-400"
                >
                  {{ line.label }}
                </span>
                <div class="flex min-w-0 items-center gap-1.5">
                  <RefreshRight v-if="line.loading" class="h-3.5 w-3.5 animate-spin" />
                  <span class="truncate text-[13px] font-bold leading-none tabular-nums">
                    {{ line.value }}
                  </span>
                </div>
              </div>
              <div :class="['mt-2 h-1.5 overflow-hidden rounded-full', line.trackClass]">
                <div
                  :class="['h-full rounded-full transition-all duration-300', line.barClass]"
                  :style="{ width: line.width }"
                />
              </div>
              <p class="mt-1.5 max-w-[190px] truncate text-[11px] text-slate-500 dark:text-slate-400">
                {{ line.note }}
              </p>
            </div>
          </div>
        </template>
        <div :class="['flex flex-wrap items-center gap-1.5', quotaVisible ? 'mt-2.5' : '']">
          <button
            class="inline-flex h-6 cursor-pointer items-center gap-1 rounded-full border border-blue-200 bg-blue-50/80 px-2.5 text-[11px] font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-100/80 disabled:cursor-not-allowed disabled:opacity-55 dark:border-sky-800/70 dark:bg-sky-500/14 dark:text-sky-300 dark:hover:border-sky-700 dark:hover:bg-sky-500/22"
            type="button"
            :disabled="quotaActionDisabled"
            @click="$emit('refresh-quota', item)"
          >
            <RefreshRight :class="['h-3 w-3', quotaRefreshing ? 'animate-spin' : '']" />
            <span class="whitespace-nowrap">远端</span>
          </button>

          <button
            class="inline-flex h-6 cursor-pointer items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 text-[11px] font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100/80 disabled:cursor-not-allowed disabled:opacity-55 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/70"
            type="button"
            :disabled="quotaActionDisabled"
            @click="$emit('refresh-local-quota', item)"
          >
            <RefreshRight :class="['h-3 w-3', localQuotaRefreshing ? 'animate-spin' : '']" />
            <span class="whitespace-nowrap">本地</span>
          </button>
        </div>
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
import { RefreshRight } from "@element-plus/icons-vue";

defineEmits(["toggle", "disable", "enable", "remove", "refresh-quota", "refresh-local-quota"]);

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
  quotaRefreshing: {
    type: Boolean,
    default: false,
  },
  localQuotaRefreshing: {
    type: Boolean,
    default: false,
  },
});

const statusClassMap = {
  neutral: "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300",
  accent: "border-blue-200 bg-blue-50 text-blue-600 dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-300",
  success: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300",
  warning: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300",
  danger: "border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300",
};
const quotaClassMap = {
  neutral: {
    bar: "bg-slate-400 dark:bg-slate-500",
    text: "text-slate-600 dark:text-slate-300",
    track: "bg-slate-200/80 dark:bg-slate-800/80",
  },
  accent: {
    bar: "bg-emerald-400 dark:bg-emerald-300",
    text: "text-emerald-700 dark:text-emerald-300",
    track: "bg-emerald-100 dark:bg-emerald-950/70",
  },
  success: {
    bar: "bg-emerald-500 dark:bg-emerald-300",
    text: "text-emerald-700 dark:text-emerald-300",
    track: "bg-emerald-100 dark:bg-emerald-950/70",
  },
  warning: {
    bar: "bg-amber-500 dark:bg-amber-300",
    text: "text-amber-700 dark:text-amber-300",
    track: "bg-amber-100 dark:bg-amber-950/70",
  },
  danger: {
    bar: "bg-rose-500 dark:bg-rose-300",
    text: "text-rose-600 dark:text-rose-300",
    track: "bg-rose-100 dark:bg-rose-950/70",
  },
};

const statusClass = computed(
  () => statusClassMap[props.item.statusTone] || statusClassMap.neutral,
);

const quotaState = computed(() => props.item.quota || {
  label: "",
  lines: [],
  note: "",
  status: "idle",
  tone: "neutral",
  visible: false,
});
const quotaVisible = computed(() =>
  Boolean(quotaState.value.visible || quotaState.value.status === "loading"),
);
const quotaActionDisabled = computed(() =>
  props.busy || props.quotaRefreshing || props.localQuotaRefreshing,
);
const quotaClass = computed(
  () => quotaClassMap[quotaState.value.tone] || quotaClassMap.neutral,
);
const resolveQuotaTone = (percent, fallbackTone = "neutral") => {
  if (percent === null) {
    return fallbackTone;
  }

  if (percent >= 70) {
    return "success";
  }

  if (percent >= 30) {
    return "warning";
  }

  return "danger";
};
const quotaPercentValue = computed(() => {
  const percent = Number(quotaState.value.percent);

  return Number.isFinite(percent)
    ? Math.min(Math.max(percent, 0), 100)
    : null;
});
const quotaPrimaryText = computed(() => {
  if (quotaState.value.status === "loading") {
    return "刷新中";
  }

  if (quotaPercentValue.value !== null) {
    return `${Math.round(quotaPercentValue.value)}%`;
  }

  return quotaState.value.label || "--";
});
const quotaProgressWidth = computed(() => {
  if (quotaState.value.status === "loading") {
    return "38%";
  }

  if (quotaPercentValue.value !== null) {
    return `${quotaPercentValue.value}%`;
  }

  return quotaState.value.tone === "success" ? "100%" : "0%";
});
const quotaLineItems = computed(() => {
  const sourceLines = Array.isArray(quotaState.value.lines) && quotaState.value.lines.length
    ? quotaState.value.lines
    : [
      {
        key: "quota",
        label: "",
        note: quotaState.value.note,
        percent: quotaPercentValue.value,
        tone: quotaState.value.tone,
        value: quotaPrimaryText.value,
      },
    ];

  return sourceLines.map((line, index) => {
    const percent = Number(line.percent);
    const normalizedPercent = Number.isFinite(percent)
      ? Math.min(Math.max(percent, 0), 100)
      : null;
    const resolvedTone = resolveQuotaTone(normalizedPercent, line.tone);
    const lineClass = quotaClassMap[resolvedTone] || quotaClass.value;
    const loading = quotaState.value.status === "loading" && index === 0;

    return {
      barClass: lineClass.bar,
      key: line.key || `quota-${index}`,
      label: line.label || "",
      loading,
      note: line.note || "",
      textClass: lineClass.text,
      trackClass: lineClass.track,
      value: loading
        ? "刷新中"
        : normalizedPercent !== null
          ? `${Math.round(normalizedPercent)}%`
          : line.value || "--",
      width: loading
        ? "38%"
        : normalizedPercent !== null
          ? `${normalizedPercent}%`
          : resolvedTone === "success" ? "100%" : "0%",
    };
  });
});

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
