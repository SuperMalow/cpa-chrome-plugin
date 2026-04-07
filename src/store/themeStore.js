import { defineStore } from "pinia";

const THEME_STORAGE_KEY = "dashboard:theme";

const resolveInitialTheme = () => {
  const savedTheme = globalThis.localStorage?.getItem(THEME_STORAGE_KEY);

  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return globalThis.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
};

const applyThemeToDocument = (theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
};

export const useDarkModeStore = defineStore("darkMode", {
  state: () => ({
    theme: "light",
    initialized: false,
  }),
  getters: {
    isDarkTheme: (state) => state.theme === "dark",
  },
  actions: {
    initTheme() {
      if (this.initialized) {
        return;
      }

      const theme = resolveInitialTheme();
      this.theme = theme;
      applyThemeToDocument(theme);
      this.initialized = true;
    },

    setTheme(theme) {
      this.theme = theme;
      applyThemeToDocument(theme);
      globalThis.localStorage?.setItem(THEME_STORAGE_KEY, theme);
      this.initialized = true;
    },

    toggleTheme() {
      this.setTheme(this.isDarkTheme ? "light" : "dark");
    },
  },
});
