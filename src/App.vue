<template>
  <router-view />
</template>

<script setup>
import { onMounted } from "vue";
import { useDarkModeStore } from "@/store/themeStore";

const darkModeStore = useDarkModeStore();

onMounted(() => {
  darkModeStore.initTheme();
});
</script>
