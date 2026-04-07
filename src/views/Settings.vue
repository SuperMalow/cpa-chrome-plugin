<template>
  <div
    class="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50 to-slate-50 px-4 py-8 md:px-6 md:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <section
      class="mx-auto mb-5 flex w-full max-w-[1180px] flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <span
          class="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-[0.04em] text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          多接入配置
        </span>
        <h1
          class="mt-3 text-[clamp(1.75rem,3vw,2.2rem)] font-bold leading-none tracking-[-0.04em] text-slate-800 dark:text-slate-100">
          设置中心
        </h1>
        <p class="mt-2 text-[15px] text-slate-500 dark:text-slate-400">
          维护 CPA 接口地址、密钥、鉴权方式与超时时间，支持多个接入并行管理。
        </p>
      </div>

      <div class="flex w-full flex-wrap justify-end gap-3 lg:w-auto">
        <button
          class="inline-flex h-8 cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white/85 px-4 text-[13px] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_24px_rgba(112,136,181,0.12)] dark:border-slate-700/80 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-900/86 dark:hover:shadow-[0_10px_24px_rgba(2,6,23,0.28)]"
          type="button" @click="router.push({ name: 'home' })">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          <span class="text-sm">返回面板</span>
        </button>

        <ThemeToggleButton />
      </div>
    </section>

    <main class="mx-auto w-full max-w-[1180px] space-y-4">
      <section class="grid gap-4 xl:grid-cols-3">
        <SettingsSummaryCard label="CPA 接入数" :value="String(settingsStore.totalCount)"
          :note="`${settingsStore.enabledCount} 个已启用`" tone="neutral" />
        <SettingsSummaryCard label="已启用" :value="String(settingsStore.enabledCount)" note="建议保留一个默认可用接入"
          tone="success" />
        <SettingsSummaryCard label="鉴权覆盖" :value="String(activeAuthCount)" :note="authSummaryText" tone="accent" />
      </section>

      <section
        class="rounded-[28px] border border-slate-200/90 bg-white/62 p-4 shadow-[0_24px_64px_rgba(134,154,192,0.16)] backdrop-blur-xl md:p-5 dark:border-slate-800 dark:bg-slate-900/54 dark:shadow-[0_24px_64px_rgba(2,6,23,0.34)]">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="min-w-0 flex-1">
            <h2 class="text-[28px] font-bold leading-tight tracking-[-0.03em] text-slate-800 dark:text-slate-100">CPA
              接入列表</h2>
            <p class="mt-1 text-[13px] leading-6 text-slate-500 dark:text-slate-400">
              每个接入独立维护自己的接口地址、密钥与鉴权策略，方便同时接入多个 CPA 服务。
            </p>

            <div v-if="settingsStore.configs.length"
              class="mt-4 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div class="inline-flex min-w-max items-center gap-2.5 pb-1">
                <CpaConfigSelector v-for="(config, index) in settingsStore.configs" :key="config.id"
                  :name="getConfigTagLabel(config, index)" :active="config.id === activeConfigId"
                  :enabled="config.enabled" @click="activeConfigId = config.id" />

                <button
                  class="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white/82 px-3 text-[10px] font-semibold text-slate-700 whitespace-nowrap transition hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_20px_rgba(112,136,181,0.1)] dark:border-slate-700/70 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-900/84 dark:hover:shadow-[0_10px_20px_rgba(2,6,23,0.24)]"
                  type="button" @click="handleAddConfig">
                  <el-icon>
                    <Plus />
                  </el-icon>
                  <span class="text-xs">新增 CPA</span>
                </button>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap gap-2.5 lg:justify-end">
            <span :class="[
              'inline-flex min-h-8 items-center rounded-full border px-3 text-[11px] font-semibold',
              settingsStore.dirty
                ? 'border-amber-200 bg-amber-50 text-amber-700'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700',
              settingsStore.dirty
                ? 'dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300'
                : 'dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300',
            ]">
              {{ settingsStore.dirty ? "有未保存修改" : "已同步到本地配置" }}
            </span>

            <span v-if="settingsStore.lastSavedAt"
              class="inline-flex min-h-8 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
              最近保存：{{ lastSavedText }}
            </span>
          </div>
        </div>

        <div v-if="!settingsStore.configs.length"
          class="mt-5 rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center dark:border-slate-700 dark:bg-slate-950/46">
          <h3 class="text-lg font-bold text-slate-700 dark:text-slate-100">还没有任何 CPA 接入</h3>
          <p class="mt-2 text-[13px] text-slate-500 dark:text-slate-400">
            先新增一个接入配置，再填写接口地址、密钥和鉴权方式。
          </p>
          <button
            class="mt-4 inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl border border-transparent bg-gradient-to-br from-blue-500 to-indigo-600 px-4 text-[13px] font-semibold text-white transition hover:brightness-105 hover:shadow-[0_10px_24px_rgba(91,140,255,0.18)]"
            type="button" @click="handleAddConfig">
            <el-icon>
              <Plus />
            </el-icon>
            新增第一个 CPA
          </button>
        </div>

        <div v-else-if="activeConfig" class="mt-5">
          <CpaSettingsCard :config="activeConfig" :index="activeConfigIndex" :saving="settingsStore.saving"
            @update="handleUpdate" @duplicate="handleDuplicate" @remove="handleRemove" @save="handleSave" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElIcon, ElMessage } from "element-plus";
import { ArrowLeft, Plus } from "@element-plus/icons-vue";
import ThemeToggleButton from "@/components/common/ThemeToggleButton.vue";
import CpaConfigSelector from "@/components/settings/CpaConfigSelector.vue";
import CpaSettingsCard from "@/components/settings/CpaSettingsCard.vue";
import SettingsSummaryCard from "@/components/settings/SettingsSummaryCard.vue";
import { useCpaSettingsStore } from "@/store/cpaSettingsStore";

const router = useRouter();
const settingsStore = useCpaSettingsStore();
const activeConfigId = ref("");

const activeAuthCount = computed(
  () => settingsStore.authSummary.filter((item) => item.count > 0).length,
);

const authSummaryText = computed(() => {
  const activeItems = settingsStore.authSummary.filter((item) => item.count > 0);

  if (!activeItems.length) {
    return "暂未配置鉴权方式";
  }

  return activeItems
    .map((item) => `${item.label} ${item.count}`)
    .join(" / ");
});

const lastSavedText = computed(() => {
  if (!settingsStore.lastSavedAt) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
  }).format(new Date(settingsStore.lastSavedAt));
});

const activeConfig = computed(
  () => settingsStore.configs.find((item) => item.id === activeConfigId.value) || null,
);

const activeConfigIndex = computed(() => {
  const targetIndex = settingsStore.configs.findIndex((item) => item.id === activeConfigId.value);
  return targetIndex >= 0 ? targetIndex : 0;
});

watch(
  () => settingsStore.configs.map((item) => item.id),
  (configIds) => {
    if (!configIds.length) {
      activeConfigId.value = "";
      return;
    }

    if (!configIds.includes(activeConfigId.value)) {
      activeConfigId.value = configIds[0];
    }
  },
  { immediate: true },
);

const getConfigTagLabel = (config, index) =>
  config.name?.trim() || `CPA ${String(index + 1).padStart(2, "0")}`;

const handleUpdate = ({ id, patch }) => {
  settingsStore.updateConfig(id, patch);
};

const handleAddConfig = () => {
  const created = settingsStore.addConfig();

  if (created?.id) {
    activeConfigId.value = created.id;
  }
};

const handleDuplicate = (id) => {
  const duplicate = settingsStore.duplicateConfig(id);

  if (duplicate?.id) {
    activeConfigId.value = duplicate.id;
  }
};

const handleRemove = (id) => {
  const removedIndex = settingsStore.configs.findIndex((item) => item.id === id);
  const isRemovingActive = activeConfigId.value === id;

  settingsStore.removeConfig(id);

  if (!isRemovingActive) {
    return;
  }

  if (!settingsStore.configs.length) {
    activeConfigId.value = "";
    return;
  }

  const fallback =
    settingsStore.configs[removedIndex]
    || settingsStore.configs[removedIndex - 1]
    || settingsStore.configs[0];

  activeConfigId.value = fallback.id;
};

const handleSave = async () => {
  try {
    await settingsStore.saveSettings();
    ElMessage.success("CPA 设置已保存");
  } catch (error) {
    console.error(error);
    ElMessage.error("保存失败，请稍后重试");
  }
};

onMounted(async () => {
  try {
    await settingsStore.loadSettings();
  } catch (error) {
    console.error(error);
    ElMessage.error("读取本地配置失败");
  }
});
</script>
