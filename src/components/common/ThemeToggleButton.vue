<template>
  <button :class="[
    'inline-flex h-8 cursor-pointer items-center gap-2 rounded-2xl border px-4 text-[13px] font-semibold transition',
    isDarkTheme
      ? 'border-slate-700/80 bg-slate-900/70 text-slate-100 hover:border-slate-600 hover:bg-slate-900/86 hover:shadow-[0_10px_24px_rgba(15,23,42,0.28)]'
      : 'border-slate-200 bg-white/85 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-[0_10px_24px_rgba(112,136,181,0.12)]',
  ]" type="button" @click="darkModeStore.toggleTheme()">
    <el-icon>
      <Moon v-if="isDarkTheme" />
      <Sunny v-else />
    </el-icon>
    <span class="text-sm">{{ isDarkTheme ? "夜间" : "日间" }}</span>
  </button>
</template>

<script setup>
import { computed } from "vue";
import { ElIcon } from "element-plus";
import { Moon, Sunny } from "@element-plus/icons-vue";
import { useDarkModeStore } from "@/store/themeStore";

const darkModeStore = useDarkModeStore();
const isDarkTheme = computed(() => darkModeStore.isDarkTheme);
</script>
