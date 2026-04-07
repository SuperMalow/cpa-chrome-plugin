const normalizeExternalUrl = (rawUrl) => {
  const normalizedUrl = rawUrl?.trim();

  if (!normalizedUrl) {
    return "";
  }

  return new URL(normalizedUrl).toString();
};

const resolveCpaPanelUrl = (rawUrl) => {
  const normalizedUrl = rawUrl?.trim();

  if (!normalizedUrl) {
    return "";
  }

  const baseUrl = normalizedUrl.endsWith("/") ? normalizedUrl : `${normalizedUrl}/`;
  return new URL("management.html", baseUrl).toString();
};

const buildExtensionPageUrl = (routePath = "/") => {
  const normalizedPath = routePath.startsWith("/") ? routePath : `/${routePath}`;
  const indexUrl = globalThis.chrome?.runtime?.getURL
    ? globalThis.chrome.runtime.getURL("index.html")
    : new URL("index.html", globalThis.location?.href || "http://localhost/").toString();

  return `${indexUrl}#${normalizedPath}`;
};

const openUrlInNewTab = (url) => {
  if (!url) {
    return;
  }

  if (globalThis.chrome?.tabs?.create) {
    globalThis.chrome.tabs.create({ url });
    return;
  }

  globalThis.open?.(url, "_blank", "noopener,noreferrer");
};

export {
  buildExtensionPageUrl,
  normalizeExternalUrl,
  openUrlInNewTab,
  resolveCpaPanelUrl,
};
