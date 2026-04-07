import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  {
    path: "/",
    component: () => import("@/views/Home.vue"),
    name: "home",
  },
  {
    path: "/settings",
    component: () => import("@/views/Settings.vue"),
    name: "settings",
  },
  {
    path: "/accounts",
    component: () => import("@/views/Accounts.vue"),
    name: "accounts",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes,
});

export default router;
