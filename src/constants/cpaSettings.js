const generateId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `cpa-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

export const CPA_AUTH_OPTIONS = [
  { label: "Bearer Token", value: "bearer" },
  { label: "API Key", value: "apiKey" },
  { label: "Basic Auth", value: "basic" },
  { label: "Custom Header", value: "custom" },
];

export const createDefaultCpaConfig = (index = 1) => ({
  id: generateId(),
  name: `CPA 接入 ${index}`,
  baseUrl: "",
  apiKey: "",
  authType: "bearer",
  timeoutSeconds: 30,
  enabled: true,
});
