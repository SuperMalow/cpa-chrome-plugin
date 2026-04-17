const resolveDashboardRefreshTargets = (
  configs = [],
  activeConfigId = "",
  { onlyActive = true } = {},
) => {
  if (!Array.isArray(configs) || !configs.length) {
    return [];
  }

  if (!onlyActive) {
    return configs;
  }

  const activeConfig = configs.find((config) => config.id === activeConfigId);

  return activeConfig ? [activeConfig] : [configs[0]];
};

export {
  resolveDashboardRefreshTargets,
};
