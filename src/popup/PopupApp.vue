<template>
  <div
    class="w-[400px] min-h-[560px] bg-gradient-to-b from-slate-100 via-blue-50 to-slate-50 p-4 text-slate-700 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100">
    <section class="rounded-[28px] border border-slate-200/90 bg-white/78 p-4 shadow-[0_24px_64px_rgba(134,154,192,0.2)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/62 dark:shadow-[0_24px_64px_rgba(2,6,23,0.34)]">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[11px] font-semibold tracking-[0.14em] text-slate-500 dark:text-slate-400">
            CPA POPUP
          </p>
          <h1 class="mt-1 text-[22px] font-bold leading-tight tracking-[-0.03em] text-slate-800 dark:text-slate-100">
            快捷面板
          </h1>
          <p class="mt-1 text-[12px] leading-5 text-slate-500 dark:text-slate-400">
            常用信息一眼看完，复杂操作跳转完整页面。
          </p>
        </div>

        <div class="flex shrink-0 items-center gap-2">
          <button
            class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white/85 text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-800 hover:shadow-[0_10px_24px_rgba(112,136,181,0.12)] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900/86 dark:hover:text-slate-100 dark:hover:shadow-[0_10px_24px_rgba(2,6,23,0.28)]"
            type="button"
            :disabled="loadingDashboard"
            @click="handleRefresh"
          >
            <el-icon :class="[loadingDashboard ? 'animate-spin' : '']">
              <RefreshRight />
            </el-icon>
          </button>

          <button
            :class="[
              'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-2xl border transition',
              isDarkTheme
                ? 'border-slate-700/80 bg-slate-900/70 text-slate-100 hover:border-slate-600 hover:bg-slate-900/86 hover:shadow-[0_10px_24px_rgba(2,6,23,0.28)]'
                : 'border-slate-200 bg-white/85 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_24px_rgba(112,136,181,0.12)]',
            ]"
            type="button"
            @click="darkModeStore.toggleTheme()"
          >
            <el-icon>
              <Moon v-if="isDarkTheme" />
              <Sunny v-else />
            </el-icon>
          </button>
        </div>
      </div>

      <div class="mt-4">
        <div class="flex items-center justify-between gap-3">
          <span class="text-[11px] font-bold text-slate-700 dark:text-slate-200">当前接入</span>
          <span :class="activeStatusClass">
            {{ activeConfigStatus }}
          </span>
        </div>

        <div
          class="mt-2 flex min-h-10 items-center rounded-2xl border border-white/65 bg-white/72 px-3.5 shadow-sm dark:border-slate-700/70 dark:bg-slate-950/46">
          <select
            :value="activeConfigId"
            class="w-full bg-transparent text-[12px] font-semibold text-slate-700 outline-none dark:text-slate-100"
            @change="setActiveConfig($event.target.value)"
          >
            <option
              v-for="config in configTabs"
              :key="config.id"
              :value="config.id"
            >
              {{ config.label }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-if="!hasConfiguredCpa"
        class="mt-4 rounded-[22px] border border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100/80 p-4 dark:border-amber-900/60 dark:from-amber-950/50 dark:to-amber-950/35"
      >
        <p class="text-[12px] font-bold text-amber-700 dark:text-amber-300">当前接入未完成配置</p>
        <p class="mt-2 text-[12px] leading-5 text-amber-800 dark:text-amber-200/80">
          请先在设置页补全接口地址和密钥，再回来查看快捷信息。
        </p>
      </div>

      <div v-else class="mt-4 grid grid-cols-2 gap-3">
        <article
          v-for="metric in popupMetrics"
          :key="metric.label"
          :class="[
            'rounded-[22px] border p-3 shadow-sm backdrop-blur-sm',
            metricToneClassMap[metric.tone] || metricToneClassMap.neutral,
          ]"
        >
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{{ metric.label }}</p>
          <p class="mt-1 text-[20px] font-bold leading-tight tracking-[-0.03em] tabular-nums" :class="metricValueClassMap[metric.tone] || metricValueClassMap.neutral">
            {{ metric.value }}
          </p>
          <p class="mt-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
            {{ metric.note }}
          </p>
        </article>
      </div>

      <div
        v-if="dashboardError"
        class="mt-4 rounded-[22px] border border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100/80 p-3 dark:border-amber-900/60 dark:from-amber-950/50 dark:to-amber-950/35"
      >
        <p class="text-[12px] font-bold text-amber-700 dark:text-amber-300">最近一次刷新失败</p>
        <p class="mt-1 text-[11px] leading-5 text-amber-800 dark:text-amber-200/80">
          {{ dashboardError }}
        </p>
      </div>

      <div class="mt-4 rounded-[22px] border border-slate-200/90 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-950/40">
        <p class="text-[12px] font-bold text-slate-700 dark:text-slate-100">快捷操作</p>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <button
            v-for="action in quickEntries"
            :key="action.key"
            :class="[
              'inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-2xl border px-3 text-[12px] font-semibold transition',
              action.key === 'panel'
                ? 'col-span-2 border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100/80 dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-200 dark:hover:border-sky-600 dark:hover:bg-sky-500/24'
                : 'border-slate-200 bg-white/84 text-slate-600 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_20px_rgba(112,136,181,0.1)] dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]',
            ]"
            type="button"
            @click="handleQuickAction(action.key)"
          >
            <el-icon class="text-[13px]">
              <component :is="action.icon" />
            </el-icon>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </div>

      <footer class="mt-4 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-3 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span class="truncate">{{ activeConfigName }}</span>
        <span class="shrink-0">{{ lastUpdatedText }}</span>
      </footer>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { ElIcon, ElMessage } from "element-plus";
import {
  Connection,
  DataAnalysis,
  Link,
  Moon,
  RefreshRight,
  Setting,
  Sunny,
  UserFilled,
} from "@element-plus/icons-vue";
import { useDashboardData } from "@/composables/useDashboardData";
import { useCpaSettingsStore } from "@/store/cpaSettingsStore";
import { useDarkModeStore } from "@/store/themeStore";
import {
  buildExtensionPageUrl,
  normalizeExternalUrl,
  openUrlInNewTab,
  resolveCpaPanelUrl,
} from "@/utils/navigationLinks";

const settingsStore = useCpaSettingsStore();
const darkModeStore = useDarkModeStore();
const {
  activeConfigId,
  activeConfigName,
  configTabs,
  dashboardError,
  hasConfiguredCpa,
  lastUpdatedText,
  loadingDashboard,
  popupMetrics,
  refreshDashboard,
  setActiveConfig,
} = useDashboardData();

const metricToneClassMap = {
  neutral: "border-slate-200 bg-white/88 dark:border-slate-800 dark:bg-slate-900/76",
  success: "border-emerald-100 bg-emerald-50/88 dark:border-emerald-900/60 dark:bg-emerald-950/52",
  accent: "border-blue-100 bg-blue-50/88 dark:border-sky-900/60 dark:bg-sky-950/52",
  warning: "border-amber-100 bg-amber-50/88 dark:border-amber-900/60 dark:bg-amber-950/52",
  danger: "border-rose-100 bg-rose-50/88 dark:border-rose-900/60 dark:bg-rose-950/52",
  critical: "border-red-200 bg-red-50/88 dark:border-red-900/60 dark:bg-red-950/52",
  "high-risk": "border-red-100 bg-red-50/88 dark:border-red-900/60 dark:bg-red-950/52",
  attention: "border-orange-100 bg-orange-50/88 dark:border-orange-900/60 dark:bg-orange-950/52",
  caution: "border-yellow-100 bg-yellow-50/88 dark:border-yellow-900/60 dark:bg-yellow-950/52",
  good: "border-lime-100 bg-lime-50/88 dark:border-lime-900/60 dark:bg-lime-950/52",
  excellent: "border-green-100 bg-green-50/88 dark:border-green-900/60 dark:bg-green-950/52",
};

const metricValueClassMap = {
  neutral: "text-slate-800 dark:text-slate-100",
  success: "text-emerald-600 dark:text-emerald-300",
  accent: "text-blue-600 dark:text-sky-300",
  warning: "text-amber-600 dark:text-amber-300",
  danger: "text-rose-500 dark:text-rose-300",
  critical: "text-red-800 dark:text-red-300",
  "high-risk": "text-red-600 dark:text-red-300",
  attention: "text-orange-600 dark:text-orange-300",
  caution: "text-yellow-700 dark:text-yellow-300",
  good: "text-lime-600 dark:text-lime-300",
  excellent: "text-green-800 dark:text-green-300",
};

const quickEntries = [
  { key: "panel", label: "打开完整面板", icon: DataAnalysis },
  { key: "accounts", label: "账号", icon: UserFilled },
  { key: "settings", label: "设置", icon: Setting },
  { key: "open-cpa", label: "前往 CPA", icon: Link },
  { key: "open-register", label: "前往注册机", icon: Connection },
];

const isDarkTheme = computed(() => darkModeStore.isDarkTheme);
const activeConfig = computed(
  () => settingsStore.configs.find((item) => item.id === activeConfigId.value) || null,
);
const activeConfigStatus = computed(
  () => configTabs.value.find((item) => item.id === activeConfigId.value)?.status || "待同步",
);
const activeStatusTone = computed(
  () => configTabs.value.find((item) => item.id === activeConfigId.value)?.tone || "neutral",
);
const activeStatusClass = computed(() => {
  const toneMap = {
    neutral: "inline-flex min-h-7 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-[10px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300",
    success: "inline-flex min-h-7 items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-[10px] font-semibold text-emerald-600 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300",
    accent: "inline-flex min-h-7 items-center rounded-full border border-blue-200 bg-blue-50 px-3 text-[10px] font-semibold text-blue-600 dark:border-sky-700/70 dark:bg-sky-500/18 dark:text-sky-300",
    warning: "inline-flex min-h-7 items-center rounded-full border border-amber-200 bg-amber-50 px-3 text-[10px] font-semibold text-amber-600 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300",
    danger: "inline-flex min-h-7 items-center rounded-full border border-rose-200 bg-rose-50 px-3 text-[10px] font-semibold text-rose-500 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-300",
  };

  return toneMap[activeStatusTone.value] || toneMap.neutral;
});

const handleRefresh = () => {
  refreshDashboard({ onlyActive: true, showToast: true });
};

const closePopup = () => {
  globalThis.close?.();
};

const openInternalPage = (routePath) => {
  openUrlInNewTab(buildExtensionPageUrl(routePath));
  closePopup();
};

const openConfiguredExternalUrl = (rawUrl, label) => {
  if (!rawUrl?.trim()) {
    ElMessage.warning(`请先在设置页填写${label}`);
    return;
  }

  try {
    openUrlInNewTab(normalizeExternalUrl(rawUrl));
    closePopup();
  } catch {
    ElMessage.warning(`${label}格式不正确，请先在设置页检查`);
  }
};

const handleQuickAction = (key) => {
  if (key === "panel") {
    openInternalPage("/");
    return;
  }

  if (key === "accounts") {
    openInternalPage("/accounts");
    return;
  }

  if (key === "settings") {
    openInternalPage("/settings");
    return;
  }

  if (key === "open-cpa") {
    try {
      const panelUrl = resolveCpaPanelUrl(activeConfig.value?.baseUrl);

      if (!panelUrl) {
        ElMessage.warning("请先在设置页填写 CPA 链接");
        return;
      }

      openUrlInNewTab(panelUrl);
      closePopup();
    } catch {
      ElMessage.warning("CPA 链接格式不正确，请先在设置页检查");
    }

    return;
  }

  if (key === "open-register") {
    openConfiguredExternalUrl(settingsStore.panelLinks.registerPanelUrl, "注册机面板链接");
  }
};

onMounted(() => {
  darkModeStore.initTheme();
  refreshDashboard({ onlyActive: true });
});
</script>
