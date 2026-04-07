const STORAGE_KEY = "dashboard:cpa-settings";

const hasChromeStorage = () => Boolean(globalThis.chrome?.storage?.local);

export const loadCpaSettings = async () => {
  if (hasChromeStorage()) {
    return new Promise((resolve, reject) => {
      globalThis.chrome.storage.local.get([STORAGE_KEY], (result) => {
        const runtimeError = globalThis.chrome.runtime?.lastError;

        if (runtimeError) {
          reject(new Error(runtimeError.message));
          return;
        }

        resolve(result[STORAGE_KEY] || []);
      });
    });
  }

  const raw = globalThis.localStorage?.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Failed to parse CPA settings from localStorage", error);
    return [];
  }
};

export const saveCpaSettings = async (configs) => {
  if (hasChromeStorage()) {
    return new Promise((resolve, reject) => {
      globalThis.chrome.storage.local.set({ [STORAGE_KEY]: configs }, () => {
        const runtimeError = globalThis.chrome.runtime?.lastError;

        if (runtimeError) {
          reject(new Error(runtimeError.message));
          return;
        }

        resolve();
      });
    });
  }

  globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(configs));
};
