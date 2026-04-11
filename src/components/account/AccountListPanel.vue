<template>
  <section
    class="rounded-[28px] border border-slate-200/90 bg-white/62 p-4 shadow-[0_24px_64px_rgba(134,154,192,0.16)] backdrop-blur-xl md:p-5 dark:border-slate-800 dark:bg-slate-900/54 dark:shadow-[0_24px_64px_rgba(2,6,23,0.34)]">
    <div class="flex flex-col gap-4 text-xs">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <h2 class="text-[20px] font-bold leading-tight tracking-[-0.03em] text-slate-800 dark:text-slate-100">认证文件
          </h2>
          <p class="mt-1 text-[12px] leading-5 text-slate-500 dark:text-slate-400">
            保留搜索、筛选和分页，支持调整每页显示数量。
          </p>
        </div>

        <div class="flex shrink-0 items-center justify-start gap-2 sm:justify-end">
          <button
            class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white/84 text-slate-500 transition hover:border-slate-300 hover:bg-white hover:text-slate-700 hover:shadow-[0_10px_20px_rgba(112,136,181,0.1)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:text-slate-100 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]"
            type="button" :disabled="busy || refreshing" @click="handleRefresh">
            <RefreshRight :class="['h-3.5 w-3.5', refreshing ? 'animate-spin' : '']" />
          </button>

          <span
            class="inline-flex min-h-8 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-[11px] font-semibold text-amber-600 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300">
            问题 {{ issueCount }}
          </span>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-3 sm:justify-between">
        <div class="flex flex-wrap items-center gap-2.5 text-xs">
          <button v-for="tab in tabs" :key="tab.key" :class="[
            'inline-flex h-7 cursor-pointer items-center rounded-full border px-4 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
            activeTab === tab.key
              ? 'border-blue-500 bg-blue-500 text-white shadow-[0_10px_24px_rgba(59,130,246,0.16)] dark:border-sky-500 dark:bg-sky-500 dark:text-slate-950'
              : 'border-slate-200 bg-white/84 text-slate-600 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_20px_rgba(112,136,181,0.1)] dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]',
          ]" type="button" :disabled="busy" @click="activeTab = tab.key">
            <span class="text-xs">{{ tab.label }}</span>
          </button>
        </div>

        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
          问题 {{ issueCount }} / 停用 {{ disabledCount }} / 总数 {{ totalCount }}
        </span>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap gap-3 text-xs">
      <label class="min-w-[260px] flex-[1_1_320px] space-y-2">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-200">错误</span>
        <div
          class="flex min-h-8 items-center gap-2 rounded-full border border-white/65 bg-white/72 px-3.5 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white dark:border-slate-700/70 dark:bg-slate-950/46 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-950/66">
          <input v-model.trim="errorKeyword"
            class="w-full bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="搜索错误说明" :disabled="busy" />
        </div>
      </label>

      <label class="min-w-[260px] flex-[1_1_320px] space-y-2">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-200">账号</span>
        <div
          class="flex min-h-8 items-center gap-2 rounded-full border border-white/65 bg-white/72 px-3.5 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white dark:border-slate-700/70 dark:bg-slate-950/46 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-950/66">
          <input v-model.trim="accountKeyword"
            class="w-full bg-transparent text-[12px] text-slate-700 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            placeholder="账号 / 邮箱 / 文件" :disabled="busy" />
        </div>
      </label>

      <label class="min-w-[180px] flex-[1_1_210px] space-y-2">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-200">状态</span>
        <div
          class="flex min-h-8 items-center rounded-full border border-white/65 bg-white/72 px-3.5 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white dark:border-slate-700/70 dark:bg-slate-950/46 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-950/66">
          <select :value="statusFilter"
            class="w-full bg-transparent text-[12px] text-slate-700 outline-none dark:text-slate-100" :disabled="busy"
            @change="statusFilter = $event.target.value">
            <option value="all">全部状态</option>
            <option value="active">活跃</option>
            <option value="disabled">已停用</option>
            <option value="unavailable">不可用</option>
            <option value="other">待确认</option>
          </select>
        </div>
      </label>

      <label class="min-w-[180px] flex-[1_1_210px] space-y-2">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-200">启停状态</span>
        <div
          class="flex min-h-8 items-center rounded-full border border-white/65 bg-white/72 px-3.5 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white dark:border-slate-700/70 dark:bg-slate-950/46 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-950/66">
          <select :value="enabledFilter"
            class="w-full bg-transparent text-[12px] text-slate-700 outline-none dark:text-slate-100" :disabled="busy"
            @change="enabledFilter = $event.target.value">
            <option value="all">全部</option>
            <option value="enabled">已启用</option>
            <option value="disabled">已停用</option>
          </select>
        </div>
      </label>

      <label class="min-w-[180px] flex-[1_1_210px] space-y-2">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-200">
          每页显示
        </span>
        <div
          class="flex min-h-8 items-center rounded-full border border-white/65 bg-white/72 px-3.5 shadow-sm transition focus-within:border-blue-300 focus-within:bg-white dark:border-slate-700/70 dark:bg-slate-950/46 dark:focus-within:border-sky-400 dark:focus-within:bg-slate-950/66">
          <select :value="String(pageSize)"
            class="w-full bg-transparent text-[12px] text-slate-700 outline-none dark:text-slate-100" :disabled="busy"
            @change="handlePageSizeChange">
            <option v-for="size in pageSizeOptions" :key="size" :value="String(size)">
              {{ size }} 条
            </option>
          </select>
        </div>
      </label>
    </div>

    <div
      class="mt-4 flex flex-col gap-3 rounded-[22px] border border-slate-200/90 bg-slate-50/84 p-4 dark:border-slate-800 dark:bg-slate-950/40 xl:flex-row xl:items-center xl:justify-between">
      <div class="min-w-0">
        <p class="text-xs font-bold text-slate-700 dark:text-slate-100">
          已选 {{ selectedCount }} 项
        </p>
        <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
          当前页 {{ rangeText }} / 总数 {{ totalCount }} 条。
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button
          class="inline-flex h-7 cursor-pointer items-center rounded-full border border-slate-200 bg-white/84 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_20px_rgba(112,136,181,0.1)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]"
          type="button" :disabled="busy || !pagedItems.length" @click="selectCurrentPage">
          <span class="text-xs">全选本页</span>
        </button>

        <button
          class="inline-flex h-7 cursor-pointer items-center rounded-full border border-slate-200 bg-white/84 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_20px_rgba(112,136,181,0.1)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]"
          type="button" :disabled="busy || !selectedCount" @click="clearSelection">
          <span class="text-xs">清空选择</span>
        </button>

        <button
          class="inline-flex h-7 cursor-pointer items-center rounded-full border border-slate-200 bg-white/84 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_20px_rgba(112,136,181,0.1)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]"
          type="button" :disabled="busy || !selectedCount" @click="emitBulkAction('disable-items')">
          <span class="text-xs">停用所选</span>
        </button>

        <button
          class="inline-flex h-7 cursor-pointer items-center rounded-full border border-slate-200 bg-white/84 px-3 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_20px_rgba(112,136,181,0.1)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]"
          type="button" :disabled="busy || !selectedCount" @click="emitBulkAction('enable-items')">
          <span class="text-xs">启用所选</span>
        </button>

        <button
          class="inline-flex h-7 cursor-pointer items-center rounded-full border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-500 transition hover:border-rose-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300"
          type="button" :disabled="busy || !selectedCount" @click="emitBulkAction('remove-items')">
          <span class="text-xs">删除所选</span>
        </button>
      </div>
    </div>

    <div class="mt-3 flex flex-col gap-2 text-xs xl:flex-row xl:items-center xl:justify-between">
      <div class="flex flex-wrap items-center gap-2">
        <button v-for="action in paginationActions" :key="action.key" :class="[
          'inline-flex h-7 items-center rounded-full border px-3 text-xs font-semibold transition',
          action.active
            ? 'border-blue-200 bg-blue-50 text-blue-600 dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-300'
            : 'border-slate-200 bg-white/84 text-slate-600 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_20px_rgba(112,136,181,0.1)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]',
        ]" type="button" :disabled="busy || action.disabled" @click="action.handler">
          <span class="text-xs">{{ action.label }}</span>
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2 xl:justify-end">
        <button
          class="inline-flex h-7 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-700 transition hover:border-amber-300 hover:bg-amber-100/80 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:border-amber-800 dark:hover:bg-amber-950/70 cursor-pointer"
          type="button" :disabled="busy || refreshing" @click="emit('disable-usage-limit-items')">
          <span class="text-xs">停用超额账号</span>
        </button>

        <button
          class="inline-flex h-7 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100/80 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/70 cursor-pointer"
          type="button" :disabled="busy || refreshing" @click="emit('enable-stale-disabled-items')">
          <span class="text-xs">恢复超额账号</span>
        </button>
      </div>
    </div>

    <div
      class="mt-4 overflow-x-auto rounded-[22px] border border-slate-200/90 bg-white/78 dark:border-slate-800 dark:bg-slate-950/34">
      <table class="min-w-full border-separate border-spacing-0">
        <thead>
          <tr
            class="bg-slate-50/92 text-left text-xs font-bold text-slate-500 dark:bg-slate-900/72 dark:text-slate-400">
            <th class="px-4 py-4">
              <label class="inline-flex cursor-pointer items-center">
                <input :checked="allCurrentPageSelected"
                  class="checkbox checkbox-sm rounded-[6px] border-slate-300 bg-white text-blue-500 [--chkbg:theme(colors.blue.500)] [--chkfg:white] dark:border-slate-600 dark:bg-slate-900"
                  type="checkbox" :disabled="busy" @change="toggleCurrentPageSelection" />
              </label>
            </th>
            <th class="px-4 py-4">文件</th>
            <th class="px-4 py-4">状态</th>
            <th class="px-4 py-4">提供方</th>
            <th class="px-4 py-4">账号</th>
            <th class="px-4 py-4">更新时间</th>
            <th class="px-4 py-4">操作</th>
          </tr>
        </thead>

        <tbody v-if="pagedItems.length">
          <AccountTableRow v-for="item in pagedItems" :key="item.id" :item="item" :selected="selectedIdSet.has(item.id)"
            :busy="busy" @toggle="toggleItemSelection" @disable="emit('disable-items', [$event])"
            @enable="emit('enable-items', [$event])" @remove="emit('remove-items', [$event])" />
        </tbody>

        <tbody v-else>
          <tr>
            <td colspan="7" class="px-4 py-10 text-center text-xs text-slate-500 dark:text-slate-400">
              当前筛选条件下没有匹配的账号记录。
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { RefreshRight } from "@element-plus/icons-vue";
import AccountTableRow from "@/components/account/AccountTableRow.vue";

const emit = defineEmits([
  "disable-items",
  "enable-items",
  "remove-items",
  "refresh",
  "disable-usage-limit-items",
  "enable-stale-disabled-items",
]);

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  busy: {
    type: Boolean,
    default: false,
  },
  refreshing: {
    type: Boolean,
    default: false,
  },
  selectionVersion: {
    type: Number,
    default: 0,
  },
  pageSizeOptions: {
    type: Array,
    default: () => [5, 10, 20, 50, 100],
  },
});

const activeTab = ref("all");
const errorKeyword = ref("");
const accountKeyword = ref("");
const statusFilter = ref("all");
const enabledFilter = ref("all");
const pageSize = ref(5);
const currentPage = ref(1);
const selectedIds = ref([]);

const tabs = [
  { key: "all", label: "全部" },
  { key: "issue", label: "问题" },
  { key: "normal", label: "正常" },
];

const totalCount = computed(() => props.items.length);
const issueCount = computed(() =>
  props.items.filter((item) => item.statusTone === "warning" || item.statusTone === "danger").length,
);
const disabledCount = computed(() =>
  props.items.filter((item) => item.disabled).length,
);

const normalizedErrorKeyword = computed(() => errorKeyword.value.trim().toLowerCase());
const normalizedAccountKeyword = computed(() => accountKeyword.value.trim().toLowerCase());

const hasFilters = computed(() =>
  activeTab.value !== "all"
  || Boolean(normalizedErrorKeyword.value)
  || Boolean(normalizedAccountKeyword.value)
  || statusFilter.value !== "all"
  || enabledFilter.value !== "all",
);

const filteredItems = computed(() =>
  props.items.filter((item) => {
    if (activeTab.value === "issue" && item.statusTone === "success") {
      return false;
    }

    if (activeTab.value === "normal" && item.statusTone !== "success") {
      return false;
    }

    if (normalizedErrorKeyword.value) {
      const haystack = [
        item.statusMessage,
        item.statusLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(normalizedErrorKeyword.value)) {
        return false;
      }
    }

    if (normalizedAccountKeyword.value) {
      const haystack = [
        item.account,
        item.email,
        item.fileName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(normalizedAccountKeyword.value)) {
        return false;
      }
    }

    if (statusFilter.value === "active" && item.statusTone !== "success") {
      return false;
    }

    if (statusFilter.value === "disabled" && !item.disabled) {
      return false;
    }

    if (statusFilter.value === "unavailable" && !item.unavailable) {
      return false;
    }

    if (statusFilter.value === "other" && ["success", "warning", "danger"].includes(item.statusTone)) {
      return false;
    }

    if (enabledFilter.value === "enabled" && item.disabled) {
      return false;
    }

    if (enabledFilter.value === "disabled" && !item.disabled) {
      return false;
    }

    return true;
  }),
);

const filteredCount = computed(() => filteredItems.value.length);
const totalPages = computed(() =>
  Math.max(Math.ceil(filteredCount.value / pageSize.value), 1),
);
const selectedIdSet = computed(() => new Set(selectedIds.value));

const pagedItems = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  return filteredItems.value.slice(startIndex, startIndex + pageSize.value);
});
const currentPageIds = computed(() => pagedItems.value.map((item) => item.id));
const selectedCount = computed(() => selectedIds.value.length);
const allCurrentPageSelected = computed(() =>
  currentPageIds.value.length > 0
  && currentPageIds.value.every((id) => selectedIdSet.value.has(id)),
);

const rangeText = computed(() => {
  if (!filteredCount.value) {
    return "0 - 0 / 0";
  }

  const start = (currentPage.value - 1) * pageSize.value + 1;
  const end = Math.min(currentPage.value * pageSize.value, filteredCount.value);
  return `${start} - ${end} / ${filteredCount.value}`;
});

const paginationActions = computed(() => [
  {
    key: "first",
    label: "首页",
    disabled: currentPage.value === 1,
    handler: () => goToPage(1),
  },
  {
    key: "prev",
    label: "上一页",
    disabled: currentPage.value === 1,
    handler: () => goToPage(currentPage.value - 1),
  },
  {
    key: "current",
    label: `第 ${currentPage.value} 页`,
    active: true,
    disabled: true,
    handler: () => { },
  },
  {
    key: "next",
    label: "下一页",
    disabled: currentPage.value >= totalPages.value,
    handler: () => goToPage(currentPage.value + 1),
  },
  {
    key: "last",
    label: "末页",
    disabled: currentPage.value >= totalPages.value,
    handler: () => goToPage(totalPages.value),
  },
]);

watch(
  [
    activeTab,
    errorKeyword,
    accountKeyword,
    statusFilter,
    enabledFilter,
    pageSize,
  ],
  () => {
    currentPage.value = 1;
  },
);

watch(
  totalPages,
  (value) => {
    if (currentPage.value > value) {
      currentPage.value = value;
    }
  },
  { immediate: true },
);

watch(
  () => props.items.length,
  () => {
    currentPage.value = 1;
  },
);

watch(
  () => props.items.map((item) => item.id),
  (nextIds) => {
    const availableIds = new Set(nextIds);
    selectedIds.value = selectedIds.value.filter((id) => availableIds.has(id));
  },
  { immediate: true },
);

watch(
  () => props.selectionVersion,
  () => {
    selectedIds.value = [];
  },
);

const goToPage = (page) => {
  currentPage.value = Math.min(Math.max(page, 1), totalPages.value);
};

const handlePageSizeChange = (event) => {
  if (props.busy) {
    return;
  }

  pageSize.value = Number(event.target.value) || 20;
};

const resetFilters = () => {
  activeTab.value = "all";
  errorKeyword.value = "";
  accountKeyword.value = "";
  statusFilter.value = "all";
  enabledFilter.value = "all";
};

const toggleItemSelection = (id) => {
  if (props.busy) {
    return;
  }

  const next = new Set(selectedIds.value);

  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }

  selectedIds.value = [...next];
};

const toggleCurrentPageSelection = () => {
  if (props.busy) {
    return;
  }

  const next = new Set(selectedIds.value);

  if (allCurrentPageSelected.value) {
    currentPageIds.value.forEach((id) => next.delete(id));
  } else {
    currentPageIds.value.forEach((id) => next.add(id));
  }

  selectedIds.value = [...next];
};

const clearSelection = () => {
  if (props.busy) {
    return;
  }

  selectedIds.value = [];
};

const selectCurrentPage = () => {
  if (props.busy) {
    return;
  }

  const next = new Set(selectedIds.value);
  currentPageIds.value.forEach((id) => next.add(id));
  selectedIds.value = [...next];
};

const emitBulkAction = (eventName) => {
  if (props.busy || !selectedIds.value.length) {
    return;
  }

  emit(eventName, [...selectedIds.value]);
};

const handleRefresh = () => {
  if (props.busy || props.refreshing) {
    return;
  }

  emit("refresh");
};
</script>
