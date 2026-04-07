import {
  Connection,
  DataAnalysis,
  Link,
  Setting,
} from "@element-plus/icons-vue";

const DASHBOARD_REGISTRATION_METRICS = [
  { label: "注册", value: "0", note: "目标 20", tone: "neutral" },
  { label: "成功", value: "0", note: "成功率待拉起", tone: "success" },
  { label: "失败", value: "0", note: "暂无失败波峰", tone: "danger" },
  { label: "成功率", value: "0.0%", note: "与昨日持平", tone: "accent" },
];

const DASHBOARD_FOCUS_TABS = ["CPA 任务", "账号明细", "注册机联控"];

const DASHBOARD_QUICK_ACTIONS = [
  { key: "open-cpa", label: "前往 CPA", icon: Link },
  { key: "open-register", label: "前往注册机", icon: Connection },
  { key: "details", label: "详细面板", icon: DataAnalysis },
  { key: "settings", label: "设置", icon: Setting },
];

export {
  DASHBOARD_FOCUS_TABS,
  DASHBOARD_QUICK_ACTIONS,
  DASHBOARD_REGISTRATION_METRICS,
};
