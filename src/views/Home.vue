<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50 to-slate-50 px-4 py-8 pb-36 md:px-6 md:py-12 md:pb-44 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <DashboardHero
      kicker="今日值守"
      title="运营面板"
      subtitle="CPA / 任务联控"
      :actions="heroActions"
      @action="handleAction"
    >
      <template #extra-actions>
        <ThemeToggleButton />
      </template>
    </DashboardHero>

    <main class="mx-auto w-full max-w-[1180px] rounded-[28px] border border-slate-200/90 bg-white/75 p-4 shadow-[0_24px_64px_rgba(134,154,192,0.2)] backdrop-blur md:p-5 dark:border-slate-800 dark:bg-slate-900/62 dark:shadow-[0_24px_64px_rgba(2,6,23,0.34)]">
      <section class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-[28px] font-bold leading-tight tracking-[-0.03em] text-slate-800 dark:text-slate-100">今日总览</h2>
          <p class="mt-1 text-[13px] text-slate-500 dark:text-slate-400">账号、CPA 一屏看完。</p>
        </div>

        <div class="flex flex-wrap gap-2.5 lg:justify-end">
          <DashboardStatusPill
            v-for="badge in statusBadges"
            :key="badge.label"
            :label="badge.label"
            :tone="badge.tone"
          />
        </div>
      </section>

      <section>
        <DashboardMetricSection
          title="账号"
          description="Auth 文件总量与可用状态。"
          :metrics="accountMetrics"
          grid-class="grid-cols-1 sm:grid-cols-2"
        />
      </section>

      <section class="mt-4">
        <DashboardMetricSection
          title="CPA"
          description="请求量、失败率与 Token 消耗。"
          :metrics="cpaMetrics"
          grid-class="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          <div v-if="dashboardError" class="mt-4 rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100/80 p-4 dark:border-amber-900/60 dark:from-amber-950/50 dark:to-amber-950/35">
            <div class="inline-flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300">
              <el-icon><WarningFilled /></el-icon>
              最近一次刷新失败
            </div>
            <p class="mt-2 text-[13px] leading-6 text-amber-800 dark:text-amber-200/80">
              {{ dashboardError }}
            </p>
          </div>
        </DashboardMetricSection>
      </section>

      <section class="mt-4 rounded-[22px] border border-slate-200 bg-gradient-to-b from-slate-50/90 to-slate-100/70 p-4 dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-950/72">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h3 class="text-[24px] font-bold leading-tight tracking-[-0.03em] text-slate-800 dark:text-slate-100">联控链路</h3>
            <p class="mt-1 text-[13px] text-slate-500 dark:text-slate-400">本地服务、云端接口与任务状态。</p>
          </div>

          <DashboardStatusPill :label="linkSummary.label" :tone="linkSummary.tone" />
        </div>

        <div class="mt-4 grid gap-3 xl:grid-cols-3">
          <DashboardLinkCard
            v-for="service in linkCards"
            :key="service.name"
            v-bind="service"
          />
        </div>

        <DashboardToolbar
          :tabs="focusTabs"
          :active-tab="activeTab"
          :actions="quickActions"
          @select-tab="handleSelectTab"
          @action="handleAction"
        />
      </section>

      <footer class="mt-5 flex flex-col gap-2 border-t border-slate-200/80 pt-4 text-[13px] text-slate-500 xl:flex-row xl:items-center xl:justify-between dark:border-slate-800 dark:text-slate-400">
        <span>最近更新：{{ lastUpdatedText }}</span>
        <span>数据源：{{ dataSourceText }}</span>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ElIcon } from "element-plus";
import { RefreshRight, WarningFilled } from "@element-plus/icons-vue";
import DashboardHero from "@/components/dashboard/DashboardHero.vue";
import DashboardLinkCard from "@/components/dashboard/DashboardLinkCard.vue";
import DashboardMetricSection from "@/components/dashboard/DashboardMetricSection.vue";
import DashboardStatusPill from "@/components/dashboard/DashboardStatusPill.vue";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar.vue";
import ThemeToggleButton from "@/components/common/ThemeToggleButton.vue";
import {
  DASHBOARD_FOCUS_TABS,
  DASHBOARD_QUICK_ACTIONS,
} from "@/constants/dashboard";
import { useDashboardData } from "@/composables/useDashboardData";

const router = useRouter();
const activeTab = ref("CPA 任务");
const {
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
} = useDashboardData();

const heroActions = computed(() => [
  {
    key: "refresh",
    label: loadingDashboard.value ? "刷新中..." : "刷新",
    icon: RefreshRight,
    variant: "ghost",
  },
]);

const focusTabs = DASHBOARD_FOCUS_TABS;
const quickActions = DASHBOARD_QUICK_ACTIONS;

const handleSelectTab = (tab) => {
  activeTab.value = tab;
};

const handleAction = (action) => {
  if (action.key === "settings") {
    router.push({ name: "settings" });
    return;
  }

  if (action.key === "refresh") {
    refreshDashboard({ showToast: true });
    return;
  }

  console.log("dashboard action =>", action.label);
};

onMounted(() => {
  refreshDashboard();
});
</script>
