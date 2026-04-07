<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50 to-slate-50 px-4 py-8 pb-10 md:px-6 md:py-12 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <DashboardHero
      kicker="认证账号"
      title="账号管理"
      subtitle="查看不同 CPA 接入下的认证账号状态、计划与来源文件。"
      :actions="heroActions"
      @action="handleAction"
    >
      <template #extra-actions>
        <ThemeToggleButton />
      </template>
    </DashboardHero>

    <main class="mx-auto w-full max-w-[1180px] space-y-4">
      <DashboardConfigTabs
        v-if="configTabs.length"
        :items="configTabs"
        :active-id="activeConfigId"
        @change="setActiveConfig"
      />

      <section class="grid gap-4 md:grid-cols-2">
        <div
          v-for="(metric, index) in accountMetrics"
          :key="metric.label"
          :class="accountMetrics.length % 2 === 1 && index === accountMetrics.length - 1 ? 'md:col-span-2' : ''"
        >
          <SettingsSummaryCard
            :label="metric.label"
            :value="metric.value"
            :note="metric.note"
            :tone="metric.tone"
          />
        </div>
      </section>

      <div v-if="accountError" class="rounded-[22px] border border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100/80 p-4 dark:border-amber-900/60 dark:from-amber-950/50 dark:to-amber-950/35">
        <p class="text-[13px] font-bold text-amber-700 dark:text-amber-300">最近一次刷新失败</p>
        <p class="mt-2 text-[12px] leading-5 text-amber-800 dark:text-amber-200/80">
          {{ accountError }}
        </p>
      </div>

      <section
        v-if="!configTabs.length"
        class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center dark:border-slate-700 dark:bg-slate-950/46"
      >
        <h3 class="text-[16px] font-bold text-slate-700 dark:text-slate-100">还没有任何 CPA 接入</h3>
        <p class="mt-2 text-[12px] text-slate-500 dark:text-slate-400">
          先去设置页新增一个可用接入，账号页才可以读取认证账号列表。
        </p>
      </section>

      <section
        v-else-if="!hasConfiguredCpa"
        class="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center dark:border-slate-700 dark:bg-slate-950/46"
      >
        <h3 class="text-[16px] font-bold text-slate-700 dark:text-slate-100">当前接入还未完成配置</h3>
        <p class="mt-2 text-[12px] text-slate-500 dark:text-slate-400">
          请先补全接口地址与密钥，再回来查看账号数据。
        </p>
      </section>

      <section
        v-else-if="loadingAccounts && !accountItems.length"
        class="rounded-[24px] border border-slate-200/90 bg-slate-50/80 p-8 text-center dark:border-slate-800 dark:bg-slate-950/46"
      >
        <h3 class="text-[16px] font-bold text-slate-700 dark:text-slate-100">账号数据加载中</h3>
        <p class="mt-2 text-[12px] text-slate-500 dark:text-slate-400">
          正在读取当前接入下的认证账号信息，请稍候。
        </p>
      </section>

      <AccountListPanel
        v-else
        :items="accountItems"
        :busy="mutatingAccounts"
        :refreshing="loadingAccounts"
        :selection-version="selectionVersion"
        @disable-items="handleSetAccountsDisabled($event, true)"
        @enable-items="handleSetAccountsDisabled($event, false)"
        @remove-items="handleRemoveAccounts"
        @refresh="refreshAccounts({ showToast: true })"
      />

      <footer class="flex flex-col gap-2 border-t border-slate-200/80 pt-1 text-[12px] text-slate-500 xl:flex-row xl:items-center xl:justify-between dark:border-slate-800 dark:text-slate-400">
        <span>最近更新：{{ lastUpdatedText }}</span>
        <span>数据源：{{ dataSourceText }}</span>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowLeft, RefreshRight } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";
import ThemeToggleButton from "@/components/common/ThemeToggleButton.vue";
import AccountListPanel from "@/components/account/AccountListPanel.vue";
import DashboardConfigTabs from "@/components/dashboard/DashboardConfigTabs.vue";
import DashboardHero from "@/components/dashboard/DashboardHero.vue";
import SettingsSummaryCard from "@/components/settings/SettingsSummaryCard.vue";
import { useAccountManagementData } from "@/composables/useAccountManagementData";

const router = useRouter();
const selectionVersion = ref(0);
const {
  accountError,
  accountItems,
  accountMetrics,
  activeConfigId,
  configTabs,
  dataSourceText,
  hasConfiguredCpa,
  lastUpdatedText,
  loadingAccounts,
  mutatingAccounts,
  removeAccounts,
  refreshAccounts,
  setAccountsDisabled,
  setActiveConfig,
} = useAccountManagementData();

const resetSelection = () => {
  selectionVersion.value += 1;
};

const heroActions = computed(() => [
  {
    key: "home",
    label: "返回面板",
    icon: ArrowLeft,
    variant: "ghost",
  },
  {
    key: "refresh",
    label: loadingAccounts.value ? "刷新中..." : "刷新账号",
    icon: RefreshRight,
    variant: "ghost",
  },
]);

const handleAction = (action) => {
  if (action.key === "home") {
    router.push({ name: "home" });
    return;
  }

  if (action.key === "refresh") {
    refreshAccounts({ showToast: true });
  }
};

const handleSetAccountsDisabled = async (ids, disabled) => {
  const handled = await setAccountsDisabled(ids, disabled);

  if (!handled) {
    return;
  }

  resetSelection();
  await refreshAccounts();
};

const handleRemoveAccounts = async (ids) => {
  const count = Array.isArray(ids) ? ids.length : 0;

  if (!count) {
    return;
  }

  const title = count > 1 ? "确认删除所选账号" : "确认删除账号";
  const message = count > 1
    ? `你正在删除 ${count} 个账号。删除后无法恢复，请确认继续。`
    : "删除后无法恢复，请确认继续。";

  try {
    await ElMessageBox.confirm(message, title, {
      cancelButtonText: "取消",
      confirmButtonText: "确认删除",
      confirmButtonClass: "el-button--danger",
      type: "warning",
    });
  } catch {
    return;
  }

  const handled = await removeAccounts(ids);

  if (!handled) {
    return;
  }

  resetSelection();
  await refreshAccounts();
};

onMounted(() => {
  refreshAccounts();
});
</script>
