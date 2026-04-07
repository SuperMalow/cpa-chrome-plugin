import { createApp } from "vue";
import { createPinia } from "pinia";
import "element-plus/dist/index.css";
import "@/style.css";
import PopupApp from "@/popup/PopupApp.vue";

const pinia = createPinia();

createApp(PopupApp).use(pinia).mount("#app");
