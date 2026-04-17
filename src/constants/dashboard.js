import {
  Connection,
  Link,
} from "@element-plus/icons-vue";
import { DASHBOARD_TOOLBAR_TAB_ITEMS } from "@/utils/dashboardToolbar";

const DASHBOARD_TOOLBAR_ACTION_ITEMS = [
  { key: "open-cpa", label: "前往 CPA", icon: Link },
  { key: "open-register", label: "前往注册机", icon: Connection },
];

export {
  DASHBOARD_TOOLBAR_ACTION_ITEMS,
  DASHBOARD_TOOLBAR_TAB_ITEMS,
};
