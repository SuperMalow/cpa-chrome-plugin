import {
  Connection,
  Link,
  Setting,
  UserFilled,
} from "@element-plus/icons-vue";

const DASHBOARD_FOCUS_TABS = ["CPA 面板"];

const DASHBOARD_QUICK_ACTIONS = [
  { key: "open-cpa", label: "前往 CPA", icon: Link },
  { key: "open-register", label: "前往注册机", icon: Connection },
  { key: "accounts", label: "账号", icon: UserFilled },
  { key: "settings", label: "设置", icon: Setting },
];

export {
  DASHBOARD_FOCUS_TABS,
  DASHBOARD_QUICK_ACTIONS,
};
