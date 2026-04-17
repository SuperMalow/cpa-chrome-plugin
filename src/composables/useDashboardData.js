import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  fetchCpaManagementAuthFiles,
  fetchCpaManagementUsage,
} from "@/api/cpaManagement";
import { useCpaSettingsStore } from "@/store/cpaSettingsStore";
import {
  buildRequestVolumeTimeline,
  buildServiceHealthTimeline,
  buildTokenVolumeTimeline,
  createEmptyAuthFilesSummary,
  createEmptyUsageSummary,
  formatCompactNumber,
  formatDashboardTimestamp,
  formatNumber,
  formatPercent,
  normalizeAuthFilesSummary,
  normalizeUsageSummary,
  resolveDashboardErrorMessage,
} from "@/utils/dashboardData";
import { resolveDashboardRefreshTargets } from "@/utils/dashboardRefreshScope";
import { resolveSuccessRateStatus } from "@/utils/successRateStatus";

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

const TOKEN_TIMELINE_UNAVAILABLE_NOTE =
  "后端未返回带时间的 Token 明细，暂无法统计最近 24 小时 Token。";

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

  const requestMonitorData = computed(() =>
    buildRequestVolumeTimeline(activeDashboardEntry.value.usageSummary.requestDetails),
  );
  const tokenMonitorData = computed(() =>
    buildTokenVolumeTimeline(activeDashboardEntry.value.usageSummary.requestDetails),
  );
  const requestMonitorTimeline = computed(() =>
    requestMonitorData.value.timeline,
  );
  const tokenMonitorTimeline = computed(() =>
    tokenMonitorData.value.timeline,
  );
  const requestLast24HoursTotal = computed(() => requestMonitorData.value.totalValue || 0);
  const tokenLast24HoursTotal = computed(() => tokenMonitorData.value.totalValue || 0);
  const requestHourMetric = computed(() => {
    const currentHour = requestMonitorData.value.currentHour || {
      rangeLabel: "暂无时段数据",
      value: 0,
    };

    return {
      label: "当前小时请求",
      note: currentHour.rangeLabel,
      value: currentHour.value,
    };
  });
  const tokenHourMetric = computed(() => {
    const currentHour = tokenMonitorData.value.currentHour || {
      rangeLabel: "暂无时段数据",
      value: 0,
    };

    return {
      available: tokenMonitorData.value.hasSource,
      label: "当前小时 Tokens",
      note: tokenMonitorData.value.hasSource
        ? currentHour.rangeLabel
        : TOKEN_TIMELINE_UNAVAILABLE_NOTE,
      value: currentHour.value,
    };
  });
  const token24HourMetric = computed(() => ({
    available: tokenMonitorData.value.hasSource,
    label: "24 小时 Tokens",
    note: tokenMonitorData.value.hasSource
      ? `24 小时总消耗 ${formatCompactNumber(tokenLast24HoursTotal.value)}`
      : TOKEN_TIMELINE_UNAVAILABLE_NOTE,
    value: tokenLast24HoursTotal.value,
  }));
  const request24HourSummaryNote = computed(() =>
    requestLast24HoursTotal.value > 0
      ? `24 小时总请求 ${formatNumber(requestLast24HoursTotal.value)} 次。`
      : "最近 24 小时暂无请求。",
  );
  const serviceHealthData = computed(() =>
    buildServiceHealthTimeline(activeDashboardEntry.value.usageSummary.requestDetails),
  );
  const serviceHealthTimeline = computed(() =>
    serviceHealthData.value.timeline,
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

  const popupMetrics = computed(() => {
    const { currentHour, totals } = serviceHealthData.value;
    const problemAccounts =
      activeDashboardEntry.value.authFilesSummary.disabled
      + activeDashboardEntry.value.authFilesSummary.unavailable;
    const successRateText = currentHour?.total
      ? currentHour.successRateText
      : totals.total > 0
        ? totals.successRateText
        : "--";
    const successRateStatus = currentHour?.total
      ? resolveSuccessRateStatus(currentHour.successRate, currentHour.total)
      : resolveSuccessRateStatus(totals.successRate, totals.total);
    const successRateNote = currentHour?.total
      ? `成功 ${formatNumber(currentHour.success)} / 失败 ${formatNumber(currentHour.failed)} · 状态 ${successRateStatus.label}`
      : totals.total > 0
        ? `24 小时成功 ${formatNumber(totals.success)} / 失败 ${formatNumber(totals.failed)} · 状态 ${successRateStatus.label}`
        : "最近暂无请求";

    return [
      {
        label: "当前成功率",
        note: successRateNote,
        tone: successRateStatus.tone,
        value: successRateText,
      },
      {
        label: requestHourMetric.value.label,
        note: requestHourMetric.value.note,
        tone: requestHourMetric.value.value > 0 ? "accent" : "neutral",
        value: formatNumber(requestHourMetric.value.value),
      },
      {
        label: tokenHourMetric.value.label,
        note: tokenHourMetric.value.note,
        tone: tokenHourMetric.value.available && tokenHourMetric.value.value > 0 ? "warning" : "neutral",
        value: tokenHourMetric.value.available
          ? formatCompactNumber(tokenHourMetric.value.value)
          : "--",
      },
      {
        label: token24HourMetric.value.label,
        note: token24HourMetric.value.note,
        tone: token24HourMetric.value.available && token24HourMetric.value.value > 0 ? "accent" : "neutral",
        value: token24HourMetric.value.available
          ? formatCompactNumber(token24HourMetric.value.value)
          : "--",
      },
      {
        label: "问题账号",
        note: `停用 ${formatNumber(activeDashboardEntry.value.authFilesSummary.disabled)} / 不可用 ${formatNumber(activeDashboardEntry.value.authFilesSummary.unavailable)}`,
        tone: problemAccounts > 0 ? "danger" : "success",
        value: formatNumber(problemAccounts),
      },
      {
        label: "活跃账号",
        note: `总数 ${formatNumber(activeDashboardEntry.value.authFilesSummary.total)}`,
        tone: "success",
        value: formatNumber(activeDashboardEntry.value.authFilesSummary.active),
      },
    ];
  });

  const cpaMetrics = computed(() => [
    {
      label: "总请求",
      note: request24HourSummaryNote.value,
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
      note: `累计 ${formatCompactNumber(activeDashboardEntry.value.usageSummary.totalTokens)}`,
      tone: "accent",
      value: formatCompactNumber(activeDashboardEntry.value.usageSummary.totalTokens),
    },
    {
      label: token24HourMetric.value.label,
      note: token24HourMetric.value.note,
      tone: token24HourMetric.value.available ? "warning" : "neutral",
      value: token24HourMetric.value.available
        ? formatCompactNumber(token24HourMetric.value.value)
        : "--",
    },
    {
      label: "模型数",
      note: activeDashboardEntry.value.usageSummary.modelNames.join(" / ") || "暂无模型明细",
      tone: "neutral",
      value: formatNumber(activeDashboardEntry.value.usageSummary.modelCount),
    },
    {
      label: requestHourMetric.value.label,
      note: requestHourMetric.value.note,
      tone: "accent",
      value: formatNumber(requestHourMetric.value.value),
    },
    {
      label: tokenHourMetric.value.label,
      note: tokenHourMetric.value.note,
      tone: tokenHourMetric.value.available ? "accent" : "neutral",
      value: tokenHourMetric.value.available
        ? formatCompactNumber(tokenHourMetric.value.value)
        : "--",
    },
  ]);

  const serviceHealthSummary = computed(() => {
    if (!hasConfiguredCpa.value) {
      return {
        label: "待配置",
        note: "补全接口地址和密钥后，这里会展示最近 24 小时每小时成功率。",
        tone: "warning",
      };
    }

    if (dashboardError.value && !activeDashboardEntry.value.loaded) {
      return {
        label: "同步异常",
        note: "最近一次读取失败，当前还没有可展示的 24 小时数据。",
        tone: "danger",
      };
    }

    const { currentHour, latestActiveHour, totals } = serviceHealthData.value;
    const activeHours = serviceHealthTimeline.value.filter((item) => item.total > 0).length;

    if (dashboardError.value) {
      return {
        label: "同步异常",
        note: "最近一次读取失败，以下保留的是当前配置最近一次成功同步的成功率数据。",
        tone: "danger",
      };
    }

    if (!activeDashboardEntry.value.loaded && activeHours === 0) {
      return {
        label: "等待同步",
        note: "完成刷新后，这里会展示最近 24 小时每小时成功率。",
        tone: "neutral",
      };
    }

    if (!totals.total) {
      return {
        label: "当前成功率 --",
        note: "最近 24 小时没有可用的模型调用明细。",
        tone: "neutral",
      };
    }

    if (currentHour?.total) {
      const currentStatus = resolveSuccessRateStatus(currentHour.successRate, currentHour.total);

      return {
        label: `当前成功率 ${currentHour.successRateText}`,
        note: `24 小时累计成功率 ${totals.successRateText}，当前小时成功 ${formatNumber(currentHour.success)} 次，失败 ${formatNumber(currentHour.failed)} 次，当前状态 ${currentStatus.label}。`,
        tone: currentStatus.tone,
      };
    }

    const totalsStatus = resolveSuccessRateStatus(totals.successRate, totals.total);

    return {
      label: "当前成功率 --",
      note: latestActiveHour
        ? `当前小时暂无请求，最近活跃小时 ${latestActiveHour.hour}:00 成功率 ${latestActiveHour.successRateText}，24 小时累计成功率 ${totals.successRateText}，当前状态 ${totalsStatus.label}。`
        : `当前小时暂无请求，24 小时累计成功率 ${totals.successRateText}，当前状态 ${totalsStatus.label}。`,
      tone: totalsStatus.tone,
    };
  });

  const requestMonitorSummary = computed(() => {
    const focusHour = requestHourMetric.value;

    return {
      label: `当前 ${formatNumber(focusHour.value)}`,
      note: request24HourSummaryNote.value,
      tone: focusHour.value > 0 ? "accent" : "neutral",
    };
  });

  const tokenMonitorSummary = computed(() => {
    const focusHour = tokenHourMetric.value;

    return {
      label: focusHour.available ? `当前 ${formatCompactNumber(focusHour.value)}` : "--",
      note: token24HourMetric.value.note,
      tone: focusHour.available && focusHour.value > 0 ? "warning" : "neutral",
    };
  });

  const lastUpdatedText = computed(() =>
    formatDashboardTimestamp(activeDashboardEntry.value.lastUpdatedAt),
  );

  const dataSourceText = computed(() => {
    if (!activeConfig.value?.baseUrl?.trim()) {
      return "请先在设置页保存一个可用的 CPA 接入";
    }

    return `${activeConfigName.value} / ${activeConfig.value.baseUrl.trim()}`;
  });

  const refreshDashboard = async ({ showToast = false, onlyActive = true } = {}) => {
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

    const targetConfigs = resolveDashboardRefreshTargets(
      settingsStore.configs,
      activeConfigId.value,
      { onlyActive },
    );
    const results = await Promise.all(
      targetConfigs.map((config) => refreshConfigDashboard(config)),
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
    activeConfigName,
    configTabs,
    cpaMetrics,
    dashboardError,
    dataSourceText,
    hasConfiguredCpa,
    lastUpdatedText,
    loadingDashboard,
    popupMetrics,
    requestMonitorSummary,
    requestMonitorTimeline,
    refreshDashboard,
    setActiveConfig,
    serviceHealthSummary,
    serviceHealthTimeline,
    statusBadges,
    tokenMonitorSummary,
    tokenMonitorTimeline,
  };
};

export { useDashboardData };
