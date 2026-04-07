import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  fetchCpaManagementAuthFiles,
  fetchCpaManagementUsage,
} from "@/api/cpaManagement";
import { useCpaSettingsStore } from "@/store/cpaSettingsStore";
import {
  createEmptyAuthFilesSummary,
  createEmptyUsageSummary,
  formatCompactNumber,
  formatDashboardTimestamp,
  formatNumber,
  formatPercent,
  getLatestHourEntry,
  normalizeAuthFilesSummary,
  normalizeUsageSummary,
  resolveDashboardErrorMessage,
} from "@/utils/dashboardData";

const createDashboardEntry = () => ({
  authFilesSummary: createEmptyAuthFilesSummary(),
  error: "",
  lastUpdatedAt: "",
  loaded: false,
  loading: false,
  usageSummary: createEmptyUsageSummary(),
});

const isConfigReady = (config) =>
  Boolean(config?.baseUrl?.trim() && config?.apiKey?.trim());

const hasEntryData = (entry) =>
  entry?.authFilesSummary?.total > 0 || entry?.usageSummary?.totalRequests > 0;

const resolveConfigLabel = (config, index) =>
  config?.name?.trim() || `CPA 接入 ${String(index + 1).padStart(2, "0")}`;

const resolveDefaultConfigId = (configs = []) => {
  const preferredConfig =
    configs.find((config) => config.enabled && isConfigReady(config))
    || configs.find((config) => isConfigReady(config))
    || configs.find((config) => config.enabled)
    || configs[0]
    || null;

  return preferredConfig?.id || "";
};

const useDashboardData = () => {
  const settingsStore = useCpaSettingsStore();
  const activeConfigId = ref("");
  const dashboardEntries = ref({});

  const syncDashboardEntries = (configs = []) => {
    const nextEntries = {};

    configs.forEach((config) => {
      nextEntries[config.id] = dashboardEntries.value[config.id] || createDashboardEntry();
    });

    dashboardEntries.value = nextEntries;
  };

  const getDashboardEntry = (configId) => {
    if (!configId) {
      return createDashboardEntry();
    }

    if (!dashboardEntries.value[configId]) {
      dashboardEntries.value[configId] = createDashboardEntry();
    }

    return dashboardEntries.value[configId];
  };

  const resetDashboardEntry = (configId) => {
    const entry = getDashboardEntry(configId);

    entry.authFilesSummary = createEmptyAuthFilesSummary();
    entry.error = "";
    entry.lastUpdatedAt = "";
    entry.loaded = false;
    entry.loading = false;
    entry.usageSummary = createEmptyUsageSummary();
  };

  watch(
    () => settingsStore.configs.map((config) => config.id),
    (configIds) => {
      syncDashboardEntries(settingsStore.configs);

      if (!configIds.length) {
        activeConfigId.value = "";
        return;
      }

      if (!configIds.includes(activeConfigId.value)) {
        activeConfigId.value = resolveDefaultConfigId(settingsStore.configs);
      }
    },
    { immediate: true },
  );

  const configTabs = computed(() =>
    settingsStore.configs.map((config, index) => {
      const entry = dashboardEntries.value[config.id] || createDashboardEntry();
      const ready = isConfigReady(config);
      const hasData = hasEntryData(entry);

      let status = "待同步";
      let tone = "neutral";

      if (entry.loading) {
        status = "刷新中";
        tone = "accent";
      } else if (!ready) {
        status = "待配置";
        tone = "warning";
      } else if (entry.error) {
        status = "异常";
        tone = "danger";
      } else if (hasData) {
        status = "已同步";
        tone = "success";
      }

      return {
        enabled: config.enabled,
        id: config.id,
        label: resolveConfigLabel(config, index),
        status,
        tone,
      };
    }),
  );

  const activeConfig = computed(
    () => settingsStore.configs.find((config) => config.id === activeConfigId.value) || null,
  );

  const activeConfigName = computed(
    () => activeConfig.value?.name?.trim() || "CPA 接入",
  );

  const activeDashboardEntry = computed(
    () => dashboardEntries.value[activeConfigId.value] || createDashboardEntry(),
  );

  const loadingDashboard = computed(() =>
    Object.values(dashboardEntries.value).some((entry) => entry.loading),
  );

  const dashboardError = computed(() => activeDashboardEntry.value.error);
  const hasConfiguredCpa = computed(() => isConfigReady(activeConfig.value));

  const latestRequestHour = computed(() =>
    getLatestHourEntry(activeDashboardEntry.value.usageSummary.requestsByHour),
  );
  const latestTokenHour = computed(() =>
    getLatestHourEntry(activeDashboardEntry.value.usageSummary.tokensByHour),
  );

  const refreshConfigDashboard = async (config) => {
    const entry = getDashboardEntry(config.id);

    if (!isConfigReady(config)) {
      resetDashboardEntry(config.id);
      entry.error = "当前接入缺少接口地址或密钥，请先完成配置。";
      return {
        configId: config.id,
        status: "skipped",
      };
    }

    entry.loading = true;
    entry.error = "";

    try {
      const [authFilesResponse, usageResponse] = await Promise.all([
        fetchCpaManagementAuthFiles(config),
        fetchCpaManagementUsage(config),
      ]);

      entry.authFilesSummary = normalizeAuthFilesSummary(authFilesResponse.data);
      entry.lastUpdatedAt = new Date().toISOString();
      entry.loaded = true;
      entry.usageSummary = normalizeUsageSummary(usageResponse.data);

      return {
        configId: config.id,
        status: "success",
      };
    } catch (error) {
      console.error(error);
      entry.error = resolveDashboardErrorMessage(error);
      entry.loaded = true;

      return {
        configId: config.id,
        message: entry.error,
        status: "error",
      };
    } finally {
      entry.loading = false;
    }
  };

  const setActiveConfig = (configId) => {
    if (!settingsStore.configs.some((config) => config.id === configId)) {
      return;
    }

    activeConfigId.value = configId;

    const config = settingsStore.configs.find((item) => item.id === configId);
    const entry = getDashboardEntry(configId);

    if (config && isConfigReady(config) && !entry.loaded && !entry.loading) {
      void refreshConfigDashboard(config);
    }
  };

  const statusBadges = computed(() => {
    const badges = [];

    if (hasConfiguredCpa.value) {
      badges.push({ label: `${activeConfigName.value} 已接入`, tone: "neutral" });
    } else {
      badges.push({ label: "当前配置未完成", tone: "warning" });
    }

    if (activeDashboardEntry.value.authFilesSummary.total > 0) {
      badges.push({
        label: `账号 ${formatNumber(activeDashboardEntry.value.authFilesSummary.active)}/${formatNumber(activeDashboardEntry.value.authFilesSummary.total)}`,
        tone: "success",
      });
    } else {
      badges.push({
        label: loadingDashboard.value ? "数据刷新中" : "等待当前配置同步",
        tone: "neutral",
      });
    }

    if (dashboardError.value) {
      badges.push({ label: "当前配置刷新失败", tone: "danger" });
    } else if (activeDashboardEntry.value.usageSummary.totalRequests > 0) {
      badges.push({
        label: `请求 ${formatNumber(activeDashboardEntry.value.usageSummary.totalRequests)}`,
        tone: "accent",
      });
    } else {
      badges.push({ label: "暂无流量数据", tone: "neutral" });
    }

    return badges;
  });

  const accountMetrics = computed(() => [
    {
      label: "总账号数",
      note: `文件提供方 ${formatNumber(activeDashboardEntry.value.authFilesSummary.providers)} 个`,
      tone: "neutral",
      value: formatNumber(activeDashboardEntry.value.authFilesSummary.total),
    },
    {
      label: "活跃账号",
      note: `活跃占比 ${formatPercent(
        activeDashboardEntry.value.authFilesSummary.active,
        activeDashboardEntry.value.authFilesSummary.total,
      )}`,
      tone: "success",
      value: formatNumber(activeDashboardEntry.value.authFilesSummary.active),
    },
    {
      label: "已停用",
      note: `停用占比 ${formatPercent(
        activeDashboardEntry.value.authFilesSummary.disabled,
        activeDashboardEntry.value.authFilesSummary.total,
      )}`,
      tone: "warning",
      value: formatNumber(activeDashboardEntry.value.authFilesSummary.disabled),
    },
    {
      label: "不可用",
      note: `异常占比 ${formatPercent(
        activeDashboardEntry.value.authFilesSummary.unavailable,
        activeDashboardEntry.value.authFilesSummary.total,
      )}`,
      tone: "danger",
      value: formatNumber(activeDashboardEntry.value.authFilesSummary.unavailable),
    },
  ]);

  const cpaMetrics = computed(() => [
    {
      label: "总请求",
      note: `今日累计 ${formatNumber(activeDashboardEntry.value.usageSummary.todayRequests)}`,
      tone: "neutral",
      value: formatNumber(activeDashboardEntry.value.usageSummary.totalRequests),
    },
    {
      label: "成功",
      note: `成功率 ${formatPercent(
        activeDashboardEntry.value.usageSummary.successCount,
        activeDashboardEntry.value.usageSummary.totalRequests,
      )}`,
      tone: "success",
      value: formatNumber(activeDashboardEntry.value.usageSummary.successCount),
    },
    {
      label: "失败",
      note: `失败率 ${formatPercent(
        activeDashboardEntry.value.usageSummary.failureCount,
        activeDashboardEntry.value.usageSummary.totalRequests,
      )}`,
      tone: "danger",
      value: formatNumber(activeDashboardEntry.value.usageSummary.failureCount),
    },
    {
      label: "总 Tokens",
      note: `今日累计 ${formatCompactNumber(activeDashboardEntry.value.usageSummary.todayTokens)}`,
      tone: "accent",
      value: formatCompactNumber(activeDashboardEntry.value.usageSummary.totalTokens),
    },
    {
      label: "模型数",
      note: activeDashboardEntry.value.usageSummary.modelNames.join(" / ") || "暂无模型明细",
      tone: "neutral",
      value: formatNumber(activeDashboardEntry.value.usageSummary.modelCount),
    },
    {
      label: "当前小时请求",
      note: latestRequestHour.value.label,
      tone: "accent",
      value: formatNumber(latestRequestHour.value.value),
    },
    {
      label: "当前小时 Tokens",
      note: latestTokenHour.value.label,
      tone: "accent",
      value: formatCompactNumber(latestTokenHour.value.value),
    },
  ]);

  const lastUpdatedText = computed(() =>
    formatDashboardTimestamp(activeDashboardEntry.value.lastUpdatedAt),
  );

  const dataSourceText = computed(() => {
    if (!activeConfig.value?.baseUrl?.trim()) {
      return "请先在设置页保存一个可用的 CPA 接入";
    }

    return `${activeConfigName.value} / ${activeConfig.value.baseUrl.trim()}`;
  });

  const refreshDashboard = async ({ showToast = false } = {}) => {
    await settingsStore.loadSettings();
    syncDashboardEntries(settingsStore.configs);

    if (!settingsStore.configs.length) {
      activeConfigId.value = "";

      if (showToast) {
        ElMessage.warning("请先在设置页新增一个 CPA 接入");
      }
      return;
    }

    if (!activeConfigId.value) {
      activeConfigId.value = resolveDefaultConfigId(settingsStore.configs);
    }

    const results = await Promise.all(
      settingsStore.configs.map((config) => refreshConfigDashboard(config)),
    );

    if (!showToast) {
      return;
    }

    const successCount = results.filter((item) => item.status === "success").length;
    const errorCount = results.filter((item) => item.status === "error").length;
    const skippedCount = results.filter((item) => item.status === "skipped").length;

    if (successCount > 0 && errorCount === 0 && skippedCount === 0) {
      ElMessage.success(`已刷新 ${successCount} 个配置`);
      return;
    }

    if (successCount === 0 && skippedCount === results.length) {
      ElMessage.warning("没有可刷新的接入，请先补全接口地址和密钥");
      return;
    }

    ElMessage.warning(
      `已刷新 ${successCount} 个配置，异常 ${errorCount} 个，待配置 ${skippedCount} 个`,
    );
  };

  return {
    accountMetrics,
    activeConfigId,
    configTabs,
    cpaMetrics,
    dashboardError,
    dataSourceText,
    lastUpdatedText,
    loadingDashboard,
    refreshDashboard,
    setActiveConfig,
    statusBadges,
  };
};

export { useDashboardData };
