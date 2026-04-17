const DASHBOARD_TOOLBAR_TAB_ITEMS = [
  {
    key: "home",
    label: "CPA 面板",
    routeName: "home",
  },
  {
    key: "accounts",
    label: "账号",
    routeName: "accounts",
  },
  {
    key: "settings",
    label: "设置",
    routeName: "settings",
  },
];

const getDashboardToolbarTabByRouteName = (routeName) =>
  DASHBOARD_TOOLBAR_TAB_ITEMS.find((item) => item.routeName === routeName)
  || DASHBOARD_TOOLBAR_TAB_ITEMS[0];

const getDashboardToolbarActiveTabKey = (routeName) =>
  getDashboardToolbarTabByRouteName(routeName)?.key || DASHBOARD_TOOLBAR_TAB_ITEMS[0].key;

export {
  DASHBOARD_TOOLBAR_TAB_ITEMS,
  getDashboardToolbarActiveTabKey,
  getDashboardToolbarTabByRouteName,
};
