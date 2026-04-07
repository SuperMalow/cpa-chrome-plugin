import { computed, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  Connection,
  DataAnalysis,
  Monitor,
} from "@element-plus/icons-vue";
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

const useDashboardData = () => {
  const settingsStore = useCpaSettingsStore();
  const loadingDashboard = ref(false);
  const dashboardError = ref("");
  const lastUpdatedAt = ref("");
  const authFilesSummary = ref(createEmptyAuthFilesSummary());
  const usageSummary = ref(createEmptyUsageSummary());

  const resetDashboardData = () => {
    authFilesSummary.value = createEmptyAuthFilesSummary();
    usageSummary.value = createEmptyUsageSummary();
    lastUpdatedAt.value = "";
  };

  const currentConfig = computed(
    () =>
      settingsStore.configs.find((item) => item.enabled)
      || settingsStore.configs[0]
      || null,
  );

  const activeConfigName = computed(
    () => currentConfig.value?.name?.trim() || "CPA 接入",
  );

  const hasConfiguredCpa = computed(() =>
    Boolean(currentConfig.value?.baseUrl?.trim() && currentConfig.value?.apiKey?.trim()),
  );

  const hasDashboardData = computed(
    () => authFilesSummary.value.total > 0 || usageSummary.value.totalRequests > 0,
  );

  const latestRequestHour = computed(() =>
    getLatestHourEntry(usageSummary.value.requestsByHour),
  );
  const latestTokenHour = computed(() =>
    getLatestHourEntry(usageSummary.value.tokensByHour),
  );

  const statusBadges = computed(() => {
    const badges = [];

    if (hasConfiguredCpa.value) {
      badges.push({ label: `${activeConfigName.value} 已配置`, tone: "neutral" });
    } else {
      badges.push({ label: "未配置 CPA", tone: "warning" });
    }

    if (authFilesSummary.value.total > 0) {
      badges.push({
        label: `账号 ${formatNumber(authFilesSummary.value.active)}/${formatNumber(authFilesSummary.value.total)}`,
        tone: "success",
      });
    } else {
      badges.push({
        label: loadingDashboard.value ? "数据刷新中" : "等待首次同步",
        tone: "neutral",
      });
    }

    if (dashboardError.value) {
      badges.push({ label: "最近刷新失败", tone: "danger" });
    } else if (usageSummary.value.totalRequests > 0) {
      badges.push({
        label: `请求 ${formatNumber(usageSummary.value.totalRequests)}`,
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
      value: formatNumber(authFilesSummary.value.total),
      note: `文件提供方 ${formatNumber(authFilesSummary.value.providers)} 个`,
      tone: "neutral",
    },
    {
      label: "活跃账号",
      value: formatNumber(authFilesSummary.value.active),
      note: `活跃占比 ${formatPercent(authFilesSummary.value.active, authFilesSummary.value.total)}`,
      tone: "success",
    },
    {
      label: "已停用",
      value: formatNumber(authFilesSummary.value.disabled),
      note: `停用占比 ${formatPercent(authFilesSummary.value.disabled, authFilesSummary.value.total)}`,
      tone: "warning",
    },
    {
      label: "不可用",
      value: formatNumber(authFilesSummary.value.unavailable),
      note: `异常占比 ${formatPercent(authFilesSummary.value.unavailable, authFilesSummary.value.total)}`,
      tone: "danger",
    },
  ]);

  const cpaMetrics = computed(() => [
    {
      label: "总请求",
      value: formatNumber(usageSummary.value.totalRequests),
      note: `今日累计 ${formatNumber(usageSummary.value.todayRequests)}`,
      tone: "neutral",
    },
    {
      label: "成功",
      value: formatNumber(usageSummary.value.successCount),
      note: `成功率 ${formatPercent(usageSummary.value.successCount, usageSummary.value.totalRequests)}`,
      tone: "success",
    },
    {
      label: "失败",
      value: formatNumber(usageSummary.value.failureCount),
      note: `失败率 ${formatPercent(usageSummary.value.failureCount, usageSummary.value.totalRequests)}`,
      tone: "danger",
    },
    {
      label: "总 Tokens",
      value: formatCompactNumber(usageSummary.value.totalTokens),
      note: `今日累计 ${formatCompactNumber(usageSummary.value.todayTokens)}`,
      tone: "accent",
    },
    {
      label: "模型数",
      value: formatNumber(usageSummary.value.modelCount),
      note: usageSummary.value.modelNames.join(" / ") || "暂无模型明细",
      tone: "neutral",
    },
    {
      label: "当前小时请求",
      value: formatNumber(latestRequestHour.value.value),
      note: latestRequestHour.value.label,
      tone: "accent",
    },
    {
      label: "当前小时 Tokens",
      value: formatCompactNumber(latestTokenHour.value.value),
      note: latestTokenHour.value.label,
      tone: "accent",
    },
  ]);

  const linkCards = computed(() => [
    {
      name: activeConfigName.value
        ? `${activeConfigName.value} 管理接口`
        : "CPA 聚合服务",
      description: dashboardError.value
        ? "配置已接入，但最近一次刷新失败，请检查接口地址、密钥或 CORS。"
        : "使用已保存的 CPA 配置拉取认证文件与用量统计。",
      endpoint: currentConfig.value?.baseUrl?.trim() || "未配置接口地址",
      metric: usageSummary.value.totalRequests
        ? `请求 ${formatNumber(usageSummary.value.totalRequests)}`
        : "等待首次同步",
      status: dashboardError.value
        ? "异常"
        : hasDashboardData.value
          ? "在线"
          : "待同步",
      tone: dashboardError.value
        ? "danger"
        : hasDashboardData.value
          ? "success"
          : "neutral",
      icon: Monitor,
    },
    {
      name: "Auth Files",
      description: "认证文件总量、停用文件与不可用文件状态。",
      endpoint: "/v0/management/auth-files",
      metric: authFilesSummary.value.total
        ? `文件 ${formatNumber(authFilesSummary.value.total)}`
        : "等待同步",
      status: authFilesSummary.value.total ? "已同步" : "待同步",
      tone: authFilesSummary.value.total ? "accent" : "neutral",
      icon: Connection,
    },
    {
      name: "Usage 统计",
      description: "请求量、失败数与按小时 Token 消耗概览。",
      endpoint: "/v0/management/usage",
      metric: usageSummary.value.totalTokens
        ? `Tokens ${formatCompactNumber(usageSummary.value.totalTokens)}`
        : "等待同步",
      status: usageSummary.value.totalRequests ? "已同步" : "待同步",
      tone: usageSummary.value.totalRequests ? "accent" : "neutral",
      icon: DataAnalysis,
    },
  ]);

  const linkSummary = computed(() => {
    const syncedCount = linkCards.value.filter(
      (item) => item.status === "在线" || item.status === "已同步",
    ).length;

    if (dashboardError.value) {
      return {
        label: `${formatNumber(syncedCount)}/3 条链路已同步`,
        tone: "warning",
      };
    }

    if (!hasDashboardData.value) {
      return {
        label: "等待链路同步",
        tone: "neutral",
      };
    }

    return {
      label: `${formatNumber(syncedCount)} 条链路在线`,
      tone: "accent",
    };
  });

  const lastUpdatedText = computed(() =>
    formatDashboardTimestamp(lastUpdatedAt.value),
  );

  const dataSourceText = computed(() => {
    if (!currentConfig.value?.baseUrl?.trim()) {
      return "请先在设置页保存一个可用的 CPA 接入";
    }

    return `${activeConfigName.value} / ${currentConfig.value.baseUrl.trim()}`;
  });

  const refreshDashboard = async ({ showToast = false } = {}) => {
    await settingsStore.loadSettings();

    if (!currentConfig.value) {
      resetDashboardData();
      dashboardError.value = "请先在设置页新增并保存一个 CPA 接入。";
      if (showToast) {
        ElMessage.warning(dashboardError.value);
      }
      return;
    }

    if (!hasConfiguredCpa.value) {
      resetDashboardData();
      dashboardError.value = "当前 CPA 接入缺少接口地址或密钥，请先完成配置后再刷新。";
      if (showToast) {
        ElMessage.warning(dashboardError.value);
      }
      return;
    }

    loadingDashboard.value = true;
    dashboardError.value = "";

    try {
      const [authFilesResponse, usageResponse] = await Promise.all([
        fetchCpaManagementAuthFiles(currentConfig.value),
        fetchCpaManagementUsage(currentConfig.value),
      ]);

      authFilesSummary.value = normalizeAuthFilesSummary(authFilesResponse.data);
      usageSummary.value = normalizeUsageSummary(usageResponse.data);
      lastUpdatedAt.value = new Date().toISOString();

      if (showToast) {
        ElMessage.success("面板数据已刷新");
      }
    } catch (error) {
      console.error(error);
      dashboardError.value = resolveDashboardErrorMessage(error);

      if (showToast) {
        ElMessage.error(dashboardError.value);
      }
    } finally {
      loadingDashboard.value = false;
    }
  };

  return {
    accountMetrics,
    cpaMetrics,
    dashboardError,
    dataSourceText,
    linkCards,
    linkSummary,
    loadingDashboard,
    lastUpdatedText,
    refreshDashboard,
    statusBadges,
  };
};

export { useDashboardData };
