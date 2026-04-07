import {
  Connection,
  DataAnalysis,
  Link,
  Setting,
} from "@element-plus/icons-vue";

const DASHBOARD_FOCUS_TABS = ["CPA 任务", "账号明细"];

const DASHBOARD_QUICK_ACTIONS = [
  { key: "open-cpa", label: "前往 CPA", icon: Link },
  { key: "open-register", label: "前往注册机", icon: Connection },
  { key: "details", label: "详细面板", icon: DataAnalysis },
  { key: "settings", label: "设置", icon: Setting },
];

export {
  DASHBOARD_FOCUS_TABS,
  DASHBOARD_QUICK_ACTIONS,
};
