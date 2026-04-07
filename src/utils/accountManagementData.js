const numberFormatter = new Intl.NumberFormat("zh-CN");
const accountDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  day: "2-digit",
  hour12: false,
});

const createEmptyAccountSummary = () => ({
  total: 0,
  active: 0,
  disabled: 0,
  unavailable: 0,
  providerCount: 0,
  providerText: "暂无提供方",
});

const formatAccountCount = (value) =>
  numberFormatter.format(Number(value) || 0);

const formatAccountDateTime = (value) => {
  if (!value) {
    return "--";
  }

  const target = new Date(value);

  if (Number.isNaN(target.getTime())) {
    return "--";
  }

  return accountDateFormatter.format(target);
};

const formatFileSize = (value) => {
  const bytes = Number(value) || 0;

  if (bytes <= 0) {
    return "--";
  }

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  const digits = size >= 100 || unitIndex === 0 ? 0 : 1;
  return `${size.toFixed(digits)} ${units[unitIndex]}`;
};

const resolveAccountStatusMeta = (item) => {
  if (item?.unavailable) {
    return {
      label: "不可用",
      tone: "danger",
    };
  }

  if (item?.disabled || item?.status === "disabled") {
    return {
      label: "已停用",
      tone: "warning",
    };
  }

  if (item?.status === "active") {
    return {
      label: "活跃",
      tone: "success",
    };
  }

  return {
    label: item?.status || "待确认",
    tone: "neutral",
  };
};

const deriveAccountStatusState = (item) => {
  const statusMeta = resolveAccountStatusMeta({
    disabled: item?.disabled,
    status: item?.statusValue || item?.status,
    unavailable: item?.unavailable,
  });

  return {
    statusLabel: statusMeta.label,
    statusTone: statusMeta.tone,
  };
};

const formatDisplayLabel = (value, fallback = "--") => {
  const source = value ? String(value).trim() : "";

  if (!source) {
    return fallback;
  }

  return source
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const normalizeAuthAccountItem = (item, index) => {
  const account =
    item?.account
    || item?.email
    || item?.label
    || item?.name
    || `账号 ${String(index + 1).padStart(2, "0")}`;
  const statusMeta = resolveAccountStatusMeta(item);
  const updatedAtRaw = item?.updated_at || item?.modtime || "";
  const createdAtRaw = item?.created_at || "";

  return {
    account,
    accountType: item?.account_type || item?.type || "--",
    accountTypeLabel: formatDisplayLabel(item?.account_type || item?.type, "--"),
    authIndex: item?.auth_index || "",
    createdAtRaw,
    createdAtText: formatAccountDateTime(createdAtRaw),
    disabled: Boolean(item?.disabled),
    email: item?.email || item?.account || "",
    fileName: item?.name || item?.id || "--",
    id: item?.id || item?.auth_index || `${account}-${index}`,
    path: item?.path || "",
    provider: item?.provider || item?.type || "--",
    providerLabel: formatDisplayLabel(item?.provider || item?.type, "--"),
    runtimeOnly: Boolean(item?.runtime_only),
    sizeText: formatFileSize(item?.size),
    source: item?.source || "--",
    sourceLabel: formatDisplayLabel(item?.source, "--"),
    statusValue: item?.status || "",
    statusLabel: statusMeta.label,
    statusMessage: item?.status_message || "",
    statusTone: statusMeta.tone,
    unavailable: Boolean(item?.unavailable),
    updatedAtRaw,
    updatedAtText: formatAccountDateTime(updatedAtRaw),
  };
};

const buildTopSummaryText = (counter) =>
  Object.entries(counter)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([label, count]) => `${label} ${formatAccountCount(count)}`)
    .join(" / ");

const summarizeAccountItems = (items = []) => {
  const providerCounter = {};

  items.forEach((item) => {
    providerCounter[item.providerLabel] = (providerCounter[item.providerLabel] || 0) + 1;
  });

  return {
    active: items.filter((item) => item.statusTone === "success").length,
    disabled: items.filter((item) => item.statusTone === "warning").length,
    providerCount: Object.keys(providerCounter).length,
    providerText: buildTopSummaryText(providerCounter) || "暂无提供方",
    total: items.length,
    unavailable: items.filter((item) => item.statusTone === "danger").length,
  };
};

const hydrateAccountItem = (item) => ({
  ...item,
  ...deriveAccountStatusState(item),
});

const normalizeAuthAccountPayload = (payload) => {
  const files = Array.isArray(payload?.files) ? payload.files : [];
  const items = files
    .map((item, index) => normalizeAuthAccountItem(item, index))
    .sort((left, right) => {
      const leftTime = new Date(left.updatedAtRaw || left.createdAtRaw || 0).getTime();
      const rightTime = new Date(right.updatedAtRaw || right.createdAtRaw || 0).getTime();
      return rightTime - leftTime;
    });

  return {
    items,
    summary: summarizeAccountItems(items),
  };
};

export {
  createEmptyAccountSummary,
  formatAccountCount,
  formatAccountDateTime,
  hydrateAccountItem,
  normalizeAuthAccountPayload,
  summarizeAccountItems,
};
