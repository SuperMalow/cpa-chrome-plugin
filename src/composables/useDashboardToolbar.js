import { computed } from "vue";
import { ElMessage } from "element-plus";
import { useRoute, useRouter } from "vue-router";
import { DASHBOARD_TOOLBAR_ACTION_ITEMS, DASHBOARD_TOOLBAR_TAB_ITEMS } from "@/constants/dashboard";
import { useCpaSettingsStore } from "@/store/cpaSettingsStore";
import { getDashboardToolbarActiveTabKey } from "@/utils/dashboardToolbar";
import {
  normalizeExternalUrl,
  openUrlInNewTab,
  resolveCpaPanelUrl,
} from "@/utils/navigationLinks";

const getToolbarRouteName = (tab) => {
  if (!tab || typeof tab === "string") {
    return tab;
  }

  return tab.routeName || tab.key || "";
};

const useDashboardToolbar = () => {
  const route = useRoute();
  const router = useRouter();
  const settingsStore = useCpaSettingsStore();

  const activeTab = computed(() => getDashboardToolbarActiveTabKey(String(route.name || "")));

  const ensureSettingsLoaded = async () => {
    if (settingsStore.loaded) {
      return true;
    }

    try {
      await settingsStore.loadSettings();
      return true;
    } catch (error) {
      console.error(error);
      ElMessage.error("读取设置失败，请稍后重试");
      return false;
    }
  };

  const openConfiguredExternalUrl = (rawUrl, label) => {
    if (!rawUrl?.trim()) {
      ElMessage.warning(`请先在设置页填写${label}`);
      return;
    }

    try {
      openUrlInNewTab(normalizeExternalUrl(rawUrl));
    } catch {
      ElMessage.warning(`${label}格式不正确，请先在设置页检查`);
    }
  };

  const handleToolbarSelect = (tab) => {
    const targetRouteName = getToolbarRouteName(tab);

    if (!targetRouteName || targetRouteName === route.name) {
      return;
    }

    router.push({ name: targetRouteName });
  };

  const handleToolbarAction = async (action) => {
    if (!action?.key) {
      return;
    }

    const settingsReady = await ensureSettingsLoaded();

    if (!settingsReady) {
      return;
    }

    if (action.key === "open-cpa") {
      try {
        const activeConfig = settingsStore.configs.find((item) => item.enabled) || settingsStore.configs[0];
        const panelUrl = resolveCpaPanelUrl(activeConfig?.baseUrl);

        if (!panelUrl) {
          ElMessage.warning("请先在设置页填写 CPA 链接");
          return;
        }

        openUrlInNewTab(panelUrl);
      } catch {
        ElMessage.warning("CPA 链接格式不正确，请先在设置页检查");
      }

      return;
    }

    if (action.key === "open-register") {
      openConfiguredExternalUrl(settingsStore.panelLinks.registerPanelUrl, "注册机面板链接");
    }
  };

  return {
    activeTab,
    handleToolbarAction,
    handleToolbarSelect,
    toolbarActions: DASHBOARD_TOOLBAR_ACTION_ITEMS,
    toolbarTabs: DASHBOARD_TOOLBAR_TAB_ITEMS,
  };
};

export { useDashboardToolbar };
