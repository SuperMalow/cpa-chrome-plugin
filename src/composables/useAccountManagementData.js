import { computed, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  deleteCpaManagementAuthFiles,
  fetchCpaManagementAuthFiles,
  patchCpaManagementAuthFileStatus,
  postCpaManagementApiCall,
} from "@/api/cpaManagement";
import { useCpaSettingsStore } from "@/store/cpaSettingsStore";
import {
  createAccountQuotaErrorState,
  createEmptyAccountSummary,
  createLoadingAccountQuotaState,
  formatAccountCount,
  formatAccountDateTime,
  hydrateAccountItem,
  normalizeAccountQuotaPayload,
  normalizeAuthAccountPayload,
  summarizeAccountItems,
} from "@/utils/accountManagementData";
import {
  formatPercent,
  resolveDashboardErrorMessage,
} from "@/utils/dashboardData";

const ACCOUNT_QUOTA_BATCH_LIMIT = 10;

const createAccountEntry = () => ({
  error: "",
  items: [],
  lastUpdatedAt: "",
  loaded: false,
  loading: false,
  summary: createEmptyAccountSummary(),
});

const isConfigReady = (config) =>
  Boolean(config?.baseUrl?.trim() && config?.apiKey?.trim());

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

const isAccountQuotaRefreshed = (item) =>
  item?.quota?.status === "success";

const buildAccountQuotaProbePayload = (item) => ({
  authIndex: item.authIndex,
  method: "GET",
  url: "https://chatgpt.com/backend-api/wham/usage",
  header: {
    Authorization: "Bearer $TOKEN$",
    "Content-Type": "application/json",
  },
});

export const useAccountManagementData = () => {
  const settingsStore = useCpaSettingsStore();
  const activeConfigId = ref("");
  const accountEntries = ref({});
  const mutatingAccounts = ref(false);
  const refreshingAccountQuotas = ref(false);

  const syncAccountEntries = (configs = []) => {
    const nextEntries = {};

    configs.forEach((config) => {
      nextEntries[config.id] = accountEntries.value[config.id] || createAccountEntry();
    });

    accountEntries.value = nextEntries;
  };

  const getAccountEntry = (configId) => {
    if (!configId) {
      return createAccountEntry();
    }

    if (!accountEntries.value[configId]) {
      accountEntries.value[configId] = createAccountEntry();
    }

    return accountEntries.value[configId];
  };

  const resetAccountEntry = (configId) => {
    const entry = getAccountEntry(configId);

    entry.error = "";
    entry.items = [];
    entry.lastUpdatedAt = "";
    entry.loaded = false;
    entry.loading = false;
    entry.summary = createEmptyAccountSummary();
  };

  watch(
    () => settingsStore.configs.map((config) => config.id),
    (configIds) => {
      syncAccountEntries(settingsStore.configs);

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
      const entry = accountEntries.value[config.id] || createAccountEntry();
      const ready = isConfigReady(config);

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
      } else if (entry.loaded) {
        status = entry.summary.total > 0 ? "已同步" : "空列表";
        tone = entry.summary.total > 0 ? "success" : "neutral";
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

  const activeEntry = computed(
    () => accountEntries.value[activeConfigId.value] || createAccountEntry(),
  );

  const hasConfiguredCpa = computed(() => isConfigReady(activeConfig.value));
  const loadingAccounts = computed(() => activeEntry.value.loading);
  const accountError = computed(() => activeEntry.value.error);
  const accountItems = computed(() => activeEntry.value.items);
  const accountSummary = computed(() => activeEntry.value.summary);

  const accountMetrics = computed(() => [
    {
      label: "认证账号数",
      note: `提供方 ${accountSummary.value.providerText}`,
      tone: "neutral",
      value: formatAccountCount(accountSummary.value.total),
    },
    {
      label: "活跃账号",
      note: `活跃占比 ${formatPercent(accountSummary.value.active, accountSummary.value.total)}`,
      tone: "success",
      value: formatAccountCount(accountSummary.value.active),
    },
    {
      label: "异常账号",
      note: `停用 ${formatAccountCount(accountSummary.value.disabled)} / 不可用 ${formatAccountCount(accountSummary.value.unavailable)}`,
      tone: "danger",
      value: formatAccountCount(accountSummary.value.disabled + accountSummary.value.unavailable),
    },
  ]);

  const refreshConfigAccounts = async (config) => {
    const entry = getAccountEntry(config.id);

    if (!isConfigReady(config)) {
      resetAccountEntry(config.id);
      entry.error = "当前接入缺少接口地址或密钥，请先完成配置。";
      return {
        configId: config.id,
        status: "skipped",
      };
    }

    entry.loading = true;
    entry.error = "";

    try {
      const response = await fetchCpaManagementAuthFiles(config);
      const normalized = normalizeAuthAccountPayload(response.data);
      const currentQuotaState = new Map(
        entry.items
          .map((item) => [item.id, item.quota])
          .filter(([, quota]) => quota),
      );

      entry.items = normalized.items.map((item) => ({
        ...item,
        quota: currentQuotaState.get(item.id) || item.quota,
      }));
      entry.lastUpdatedAt = new Date().toISOString();
      entry.loaded = true;
      entry.summary = normalized.summary;

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

  const updateAccountItems = (configId, updater) => {
    const entry = getAccountEntry(configId);
    const nextItems = updater(entry.items);

    entry.items = nextItems;
    entry.summary = summarizeAccountItems(nextItems);
    entry.lastUpdatedAt = new Date().toISOString();
    entry.loaded = true;
  };

  const refreshAccountQuotas = async (sourceItems = []) => {
    if (refreshingAccountQuotas.value || mutatingAccounts.value) {
      return false;
    }

    const targetConfig = activeConfig.value;
    const targetConfigId = activeConfigId.value;
    const targetEntry = getAccountEntry(targetConfigId);

    if (!isConfigReady(targetConfig)) {
      ElMessage.warning("当前接入未完成配置，暂时无法刷新账号额度");
      return false;
    }

    const orderedSourceItems = Array.isArray(sourceItems) ? sourceItems : [];
    const orderedItems = orderedSourceItems.length
      ? orderedSourceItems
        .map((sourceItem) => targetEntry.items.find((item) => item.id === sourceItem?.id))
        .filter(Boolean)
      : [];
    const targetItems = orderedItems
      .filter((item) => !isAccountQuotaRefreshed(item))
      .slice(0, ACCOUNT_QUOTA_BATCH_LIMIT);

    if (orderedItems.length > ACCOUNT_QUOTA_BATCH_LIMIT && targetItems.length) {
      ElMessage.warning(
        `当前最多支持刷新 ${ACCOUNT_QUOTA_BATCH_LIMIT} 个账号，已按当前页顺序选择前 ${ACCOUNT_QUOTA_BATCH_LIMIT} 个未刷新账号`,
      );
    }

    if (!targetItems.length) {
      ElMessage.info("当前页账号额度均已刷新");
      return false;
    }

    const targetIds = new Set(targetItems.map((item) => item.id));

    updateAccountItems(targetConfigId, (items) =>
      items.map((item) => (
        targetIds.has(item.id)
          ? {
            ...item,
            quota: createLoadingAccountQuotaState(),
          }
          : item
      )),
    );

    refreshingAccountQuotas.value = true;

    try {
      const results = await Promise.allSettled(
        targetItems.map((item) => {
          if (!item.authIndex) {
            return Promise.reject(new Error("账号缺少 auth_index，无法查询额度"));
          }

          return postCpaManagementApiCall(
            targetConfig,
            buildAccountQuotaProbePayload(item),
          );
        }),
      );
      const quotaStateById = new Map();
      let successCount = 0;

      results.forEach((result, index) => {
        const targetItem = targetItems[index];

        if (result.status === "fulfilled") {
          quotaStateById.set(
            targetItem.id,
            normalizeAccountQuotaPayload(result.value.data),
          );
          successCount += 1;
          return;
        }

        quotaStateById.set(
          targetItem.id,
          createAccountQuotaErrorState(resolveDashboardErrorMessage(result.reason)),
        );
      });

      updateAccountItems(targetConfigId, (items) =>
        items.map((item) => (
          quotaStateById.has(item.id)
            ? {
              ...item,
              quota: quotaStateById.get(item.id),
            }
            : item
        )),
      );

      if (successCount === targetItems.length) {
        ElMessage.success(`已刷新 ${successCount} 个账号额度`);
        return true;
      }

      if (successCount > 0) {
        ElMessage.warning(
          `已刷新 ${successCount} 个账号额度，${targetItems.length - successCount} 个读取失败`,
        );
        return true;
      }

      ElMessage.error("账号额度刷新失败");
      return false;
    } finally {
      refreshingAccountQuotas.value = false;
    }
  };

  const setAccountsDisabled = async (ids = [], disabled = true) => {
    const targetIds = new Set(ids);

    if (!targetIds.size) {
      ElMessage.warning("请先选择要处理的账号");
      return false;
    }

    if (mutatingAccounts.value) {
      return false;
    }

    const targetConfig = activeConfig.value;
    const targetConfigId = activeConfigId.value;
    const targetEntry = getAccountEntry(targetConfigId);

    if (!isConfigReady(targetConfig)) {
      ElMessage.warning("当前接入未完成配置，暂时无法修改账号状态");
      return false;
    }

    const targetItems = targetEntry.items.filter((item) => targetIds.has(item.id));

    if (!targetItems.length) {
      ElMessage.warning("未找到要处理的账号");
      return false;
    }

    mutatingAccounts.value = true;

    try {
      const results = await Promise.allSettled(
        targetItems.map((item) =>
          patchCpaManagementAuthFileStatus(targetConfig, {
            name: item.fileName,
            disabled,
          }),
        ),
      );

      const successIds = [];
      const failedMessages = [];

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          successIds.push(targetItems[index].id);
          return;
        }

        failedMessages.push(
          resolveDashboardErrorMessage(result.reason) || targetItems[index].fileName,
        );
      });

      if (successIds.length) {
        const successIdSet = new Set(successIds);

        updateAccountItems(targetConfigId, (items) =>
          items.map((item) => {
            if (!successIdSet.has(item.id)) {
              return item;
            }

            return hydrateAccountItem({
              ...item,
              disabled,
            });
          }),
        );
      }

      const actionText = disabled ? "停用" : "启用";

      if (successIds.length === targetItems.length) {
        ElMessage.success(`已${actionText}所选账号`);
        return true;
      }

      if (successIds.length > 0) {
        const errorMessage = failedMessages[0] ? `，失败原因：${failedMessages[0]}` : "";
        ElMessage.warning(
          `已${actionText} ${successIds.length} 个账号，另有 ${targetItems.length - successIds.length} 个失败${errorMessage}`,
        );
        return true;
      }

      ElMessage.error(
        `账号${actionText}失败${failedMessages[0] ? `：${failedMessages[0]}` : ""}`,
      );
      return true;
    } finally {
      mutatingAccounts.value = false;
    }
  };

  const removeAccounts = async (ids = []) => {
    const targetIds = new Set(ids);

    if (!targetIds.size) {
      ElMessage.warning("请先选择要删除的账号");
      return false;
    }

    if (mutatingAccounts.value) {
      return false;
    }

    const targetConfig = activeConfig.value;
    const targetEntry = getAccountEntry(activeConfigId.value);

    if (!isConfigReady(targetConfig)) {
      ElMessage.warning("当前接入未完成配置，暂时无法删除账号");
      return false;
    }

    const targetItems = targetEntry.items.filter((item) => targetIds.has(item.id));

    if (!targetItems.length) {
      ElMessage.warning("未找到要删除的账号");
      return false;
    }

    const fileNames = targetItems
      .map((item) => item.fileName)
      .filter(Boolean);

    if (!fileNames.length) {
      ElMessage.warning("未找到可删除的账号文件名");
      return false;
    }

    mutatingAccounts.value = true;

    try {
      await deleteCpaManagementAuthFiles(targetConfig, {
        names: fileNames,
      });

      ElMessage.success(fileNames.length > 1 ? "已删除所选账号" : "账号已删除");
      return true;
    } catch (error) {
      console.error(error);
      ElMessage.error(resolveDashboardErrorMessage(error));
      return false;
    } finally {
      mutatingAccounts.value = false;
    }
  };

  const setActiveConfig = (configId) => {
    if (!settingsStore.configs.some((config) => config.id === configId)) {
      return;
    }

    activeConfigId.value = configId;

    const targetConfig = settingsStore.configs.find((config) => config.id === configId);
    const entry = getAccountEntry(configId);

    if (targetConfig && isConfigReady(targetConfig) && !entry.loaded && !entry.loading) {
      void refreshConfigAccounts(targetConfig);
    }
  };

  const refreshAccounts = async ({ showToast = false } = {}) => {
    await settingsStore.loadSettings({ force: true });
    syncAccountEntries(settingsStore.configs);

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

    const targetConfig = settingsStore.configs.find((config) => config.id === activeConfigId.value);

    if (!targetConfig) {
      return;
    }

    const result = await refreshConfigAccounts(targetConfig);

    if (!showToast) {
      return;
    }

    if (result.status === "success") {
      ElMessage.success("账号数据已刷新");
      return;
    }

    if (result.status === "skipped") {
      ElMessage.warning("当前接入未完成配置，暂时无法读取账号数据");
      return;
    }

    ElMessage.error(result.message || "读取账号数据失败");
  };

  const lastUpdatedText = computed(() =>
    formatAccountDateTime(activeEntry.value.lastUpdatedAt),
  );

  const dataSourceText = computed(() => {
    if (!activeConfig.value?.baseUrl?.trim()) {
      return "请先在设置页保存一个可用的 CPA 接入";
    }

    return `${activeConfig.value.name?.trim() || "CPA 接入"} / ${activeConfig.value.baseUrl.trim()}`;
  });

  return {
    accountError,
    accountItems,
    accountMetrics,
    accountSummary,
    activeConfigId,
    configTabs,
    dataSourceText,
    hasConfiguredCpa,
    lastUpdatedText,
    loadingAccounts,
    mutatingAccounts,
    removeAccounts,
    refreshAccountQuotas,
    refreshAccounts,
    refreshingAccountQuotas,
    setAccountsDisabled,
    setActiveConfig,
  };
};
