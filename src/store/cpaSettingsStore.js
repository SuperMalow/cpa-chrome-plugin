import { defineStore } from "pinia";
import {
  CPA_AUTH_OPTIONS,
  createDefaultCpaConfig,
} from "@/constants/cpaSettings";
import {
  loadCpaSettings,
  saveCpaSettings,
} from "@/utils/cpaSettingsStorage";

const normalizeConfig = (config, index) => ({
  ...createDefaultCpaConfig(index + 1),
  ...config,
  id: config?.id || createDefaultCpaConfig(index + 1).id,
  timeoutSeconds: Number(config?.timeoutSeconds) > 0 ? Number(config.timeoutSeconds) : 30,
  enabled: config?.enabled ?? true,
});

export const useCpaSettingsStore = defineStore("cpaSettings", {
  state: () => ({
    configs: [],
    loaded: false,
    dirty: false,
    saving: false,
    lastSavedAt: null,
  }),
  getters: {
    totalCount: (state) => state.configs.length,
    enabledCount: (state) => state.configs.filter((item) => item.enabled).length,
    authSummary: (state) => {
      const counts = state.configs.reduce((accumulator, config) => {
        const current = accumulator[config.authType] || 0;
        accumulator[config.authType] = current + 1;
        return accumulator;
      }, {});

      return CPA_AUTH_OPTIONS.map((option) => ({
        ...option,
        count: counts[option.value] || 0,
      }));
    },
  },
  actions: {
    async loadSettings() {
      if (this.loaded) {
        return;
      }

      const savedConfigs = await loadCpaSettings();
      const normalized = Array.isArray(savedConfigs)
        ? savedConfigs.map((config, index) => normalizeConfig(config, index))
        : [];

      this.configs = normalized.length ? normalized : [createDefaultCpaConfig(1)];
      this.loaded = true;
      this.dirty = false;
    },

    addConfig() {
      const created = createDefaultCpaConfig(this.configs.length + 1);
      this.configs.push(created);
      this.dirty = true;
      return created;
    },

    duplicateConfig(id) {
      const sourceIndex = this.configs.findIndex((item) => item.id === id);

      if (sourceIndex === -1) {
        return null;
      }

      const source = this.configs[sourceIndex];
      const duplicate = {
        ...source,
        id: createDefaultCpaConfig().id,
        name: `${source.name} 副本`,
      };

      this.configs.splice(sourceIndex + 1, 0, duplicate);
      this.dirty = true;
      return duplicate;
    },

    removeConfig(id) {
      this.configs = this.configs.filter((item) => item.id !== id);
      this.dirty = true;
    },

    updateConfig(id, patch) {
      const target = this.configs.find((item) => item.id === id);

      if (!target) {
        return;
      }

      Object.assign(target, patch);
      this.dirty = true;
    },

    async saveSettings() {
      this.saving = true;

      try {
        await saveCpaSettings(this.configs);
        this.dirty = false;
        this.lastSavedAt = new Date().toISOString();
      } finally {
        this.saving = false;
      }
    },
  },
});
