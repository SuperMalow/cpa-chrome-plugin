<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-100 via-blue-50 to-slate-50 px-4 py-8 pb-36 md:px-6 md:py-12 md:pb-44 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <DashboardHero
      kicker="今日值守"
      title="运营面板"
      subtitle="CPA / 注册 / 任务联控"
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
          <h2 class="text-[32px] leading-tight tracking-[-0.03em] text-slate-800 dark:text-slate-100">今日总览</h2>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">注册、账号、CPA 一屏看完。</p>
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

      <section class="grid gap-4 xl:grid-cols-2">
        <DashboardMetricSection
          title="注册"
          description="成功率与失败波动。"
          :metrics="registrationMetrics"
          grid-class="grid-cols-1 sm:grid-cols-2"
        />

        <DashboardMetricSection
          title="账号"
          description="总量、活跃、上传占比。"
          :metrics="accountMetrics"
          grid-class="grid-cols-1 sm:grid-cols-2"
        />
      </section>

      <section class="mt-4">
        <DashboardMetricSection
          title="CPA"
          description="文件、失败、流量压力。"
          :metrics="cpaMetrics"
          grid-class="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
        >
          <div class="mt-4 rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100/80 p-4 dark:border-amber-900/60 dark:from-amber-950/50 dark:to-amber-950/35">
            <div class="inline-flex items-center gap-2 font-semibold text-amber-700 dark:text-amber-300">
              <el-icon><WarningFilled /></el-icon>
              本次刷新未完整返回
            </div>
            <p class="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-200/80">
              已保留上次数据。Unexpected token '&lt;', '&lt;!doctype' ... is not valid JSON;
              Unexpected token '&lt;', '&lt;!doctype' ... is not valid JSON
            </p>
          </div>
        </DashboardMetricSection>
      </section>

      <section class="mt-4 rounded-[22px] border border-slate-200 bg-gradient-to-b from-slate-50/90 to-slate-100/70 p-4 dark:border-slate-800 dark:from-slate-900/80 dark:to-slate-950/72">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h3 class="text-[28px] leading-tight tracking-[-0.03em] text-slate-800 dark:text-slate-100">联控链路</h3>
            <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">本地服务、云端接口与任务状态。</p>
          </div>

          <DashboardStatusPill label="3 条链路在线" tone="accent" />
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

      <footer class="mt-5 flex flex-col gap-2 border-t border-slate-200/80 pt-4 text-sm text-slate-500 xl:flex-row xl:items-center xl:justify-between dark:border-slate-800 dark:text-slate-400">
        <span>最近更新：2026-04-07 13:52</span>
        <span>数据源：本地服务 / 云端服务 / 浏览器缓存</span>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElIcon } from "element-plus";
import {
  Connection,
  DataAnalysis,
  Link,
  Monitor,
  RefreshRight,
  Setting,
  WarningFilled,
} from "@element-plus/icons-vue";
import DashboardHero from "@/components/dashboard/DashboardHero.vue";
import DashboardLinkCard from "@/components/dashboard/DashboardLinkCard.vue";
import DashboardMetricSection from "@/components/dashboard/DashboardMetricSection.vue";
import DashboardStatusPill from "@/components/dashboard/DashboardStatusPill.vue";
import DashboardToolbar from "@/components/dashboard/DashboardToolbar.vue";
import ThemeToggleButton from "@/components/common/ThemeToggleButton.vue";

const router = useRouter();
const activeTab = ref("CPA 任务");

const heroActions = [
  { key: "refresh", label: "刷新", icon: RefreshRight, variant: "ghost" },
  { key: "settings", label: "设置", icon: Setting, variant: "solid" },
];

const statusBadges = [
  { label: "状态已同步", tone: "neutral" },
  { label: "CPA 已连通", tone: "success" },
  { label: "注册 不可达", tone: "danger" },
];

const registrationMetrics = [
  { label: "注册", value: "0", note: "目标 20", tone: "neutral" },
  { label: "成功", value: "0", note: "成功率待拉起", tone: "success" },
  { label: "失败", value: "0", note: "暂无失败波峰", tone: "danger" },
  { label: "成功率", value: "0.0%", note: "与昨日持平", tone: "accent" },
];

const accountMetrics = [
  { label: "总账号数", value: "0", note: "待接入明细池", tone: "neutral" },
  { label: "活跃账号", value: "0", note: "活跃占比 0.0%", tone: "success" },
  { label: "已上传 CPA", value: "0", note: "已上传占比 0.0%", tone: "accent" },
  { label: "有 Access Token", value: "0", note: "未上传 0", tone: "neutral" },
];

const cpaMetrics = [
  { label: "认证文件", value: "968", note: "较昨日 +34", tone: "neutral" },
  { label: "问题文件", value: "57", note: "需重点处理", tone: "warning" },
  { label: "请求", value: "87", note: "最近 10 分钟", tone: "accent" },
  { label: "失败", value: "7", note: "失败率 8.0%", tone: "danger" },
  { label: "总 Tokens", value: "6.6M", note: "按天累计", tone: "neutral" },
  { label: "RPM", value: "0", note: "当前分钟", tone: "accent" },
  { label: "TPM", value: "3,629", note: "当前分钟", tone: "accent" },
];

const linkCards = [
  {
    name: "CPA 聚合服务",
    description: "负责文件扫描、聚合统计与回传状态同步。",
    endpoint: "localhost:9527",
    metric: "响应 243ms",
    status: "在线",
    tone: "success",
    icon: Monitor,
  },
  {
    name: "注册机云端接口",
    description: "负责任务队列、账号回收与异常回执。",
    endpoint: "api.register-center",
    metric: "失败 2 次",
    status: "波动",
    tone: "warning",
    icon: Connection,
  },
  {
    name: "任务看板明细",
    description: "面向人工巡检，展示链路详情与最近一次异常。",
    endpoint: "dashboard/detail",
    metric: "缓存 5 分钟",
    status: "已缓存",
    tone: "neutral",
    icon: DataAnalysis,
  },
];

const focusTabs = ["CPA 任务", "账号明细", "注册机联控"];

const quickActions = [
  { label: "前往 CPA", icon: Link },
  { label: "前往注册机", icon: Connection },
  { label: "详细面板", icon: DataAnalysis },
];

const handleSelectTab = (tab) => {
  activeTab.value = tab;
};

const handleAction = (action) => {
  if (action.key === "settings") {
    router.push({ name: "settings" });
    return;
  }

  console.log("dashboard action =>", action.label);
};
</script>
