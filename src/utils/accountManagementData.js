const numberFormatter = new Intl.NumberFormat("zh-CN");
const accountDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  day: "2-digit",
  hour12: false,
});
const quotaResetDateFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

const quotaNumberFormatter = new Intl.NumberFormat("zh-CN", {
  maximumFractionDigits: 2,
});

const REMAINING_QUOTA_KEYS = [
  "remaining",
  "remain",
  "left",
  "available",
  "balance",
  "credit",
  "credits",
  "availablebalance",
  "creditremaining",
  "creditsremaining",
  "remainingcredits",
  "remainingcredit",
  "quotaremaining",
  "remainingquota",
  "remainingmessages",
  "messagesremaining",
  "messagecapremaining",
];
const REMAINING_PERCENT_KEYS = [
  "remainingpercent",
  "remainingpercentage",
  "percentremaining",
  "percentageremaining",
  "availablepercent",
  "availablepercentage",
  "quotaremainingpercent",
  "quotaremainingpercentage",
];
const USED_PERCENT_KEYS = [
  "usedpercent",
  "usedpercentage",
  "percentused",
  "percentageused",
  "consumedpercent",
  "consumedpercentage",
  "usagepercent",
  "usagepercentage",
];
const LIMIT_QUOTA_KEYS = [
  "limit",
  "cap",
  "quotalimit",
  "quotacap",
  "messagelimit",
  "messagecap",
  "weeklylimit",
  "weeklyquota",
  "weeklycap",
  "usagelimit",
];
const USED_QUOTA_KEYS = [
  "used",
  "consumed",
  "spent",
  "messagesused",
  "usedmessages",
  "usagecount",
];
const RESET_TIME_KEYS = [
  "resetat",
  "resetsat",
  "resettime",
  "nextreset",
  "resetafter",
  "expiresat",
];

const createHiddenAccountQuotaState = () => ({
  checkedAt: "",
  error: "",
  label: "",
  lines: [],
  note: "",
  percent: null,
  status: "idle",
  tone: "neutral",
  visible: false,
});

const createLoadingAccountQuotaState = () => ({
  checkedAt: "",
  error: "",
  label: "刷新中",
  lines: [],
  note: "正在读取剩余额度",
  percent: null,
  status: "loading",
  tone: "accent",
  visible: true,
});

const createAccountQuotaErrorState = (message = "额度读取失败") => ({
  checkedAt: new Date().toISOString(),
  error: message,
  label: "读取失败",
  lines: [],
  note: message,
  percent: null,
  status: "error",
  tone: "danger",
  visible: true,
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

const formatQuotaValue = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "--";
  }

  return quotaNumberFormatter.format(numericValue);
};

const formatQuotaPercent = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return null;
  }

  return Math.round(Math.min(Math.max(numericValue, 0), 100));
};

const normalizeQuotaKey = (key) =>
  String(key || "").replace(/[^a-z0-9]/gi, "").toLowerCase();

const parseMaybeJson = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const stringifyForSearch = (value) => {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
};

const visitQuotaNodes = (node, visitor, visited = new WeakSet()) => {
  if (!node || typeof node !== "object") {
    return;
  }

  if (visited.has(node)) {
    return;
  }

  visited.add(node);

  if (Array.isArray(node)) {
    node.forEach((item) => visitQuotaNodes(item, visitor, visited));
    return;
  }

  Object.entries(node).forEach(([key, value]) => {
    visitor(key, value);

    if (value && typeof value === "object") {
      visitQuotaNodes(value, visitor, visited);
    }
  });
};

const findQuotaNumberByKeys = (node, keys = []) => {
  const keySet = new Set(keys);
  let matchedValue = null;

  visitQuotaNodes(node, (key, value) => {
    if (matchedValue !== null || !keySet.has(normalizeQuotaKey(key))) {
      return;
    }

    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      matchedValue = numericValue;
    }
  });

  return matchedValue;
};

const findQuotaStringByKeys = (node, keys = []) => {
  const keySet = new Set(keys);
  let matchedValue = "";

  visitQuotaNodes(node, (key, value) => {
    if (matchedValue || !keySet.has(normalizeQuotaKey(key))) {
      return;
    }

    if (typeof value === "string" || typeof value === "number") {
      matchedValue = String(value);
    }
  });

  return matchedValue;
};

const resolveQuotaResetNote = (body) => {
  const resetValue = findQuotaStringByKeys(body, RESET_TIME_KEYS);

  if (!resetValue) {
    return "";
  }

  const numericResetValue = Number(resetValue);
  const resetDate = Number.isFinite(numericResetValue)
    ? new Date(numericResetValue > 1e12 ? numericResetValue : numericResetValue * 1000)
    : new Date(resetValue);

  if (Number.isNaN(resetDate.getTime())) {
    return `重置 ${resetValue}`;
  }

  return `重置 ${quotaResetDateFormatter.format(resetDate)}`;
};

const resolveQuotaResetValueNote = (value) => {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const numericResetValue = Number(value);
  const resetDate = Number.isFinite(numericResetValue)
    ? new Date(numericResetValue > 1e12 ? numericResetValue : numericResetValue * 1000)
    : new Date(value);

  if (Number.isNaN(resetDate.getTime())) {
    return `重置 ${value}`;
  }

  return `重置 ${quotaResetDateFormatter.format(resetDate)}`;
};

const normalizePlanType = (value) =>
  String(value || "").trim().toLowerCase();

const resolveRemainingPercentFromUsed = (value) => {
  const usedPercent = formatQuotaPercent(value);

  return usedPercent === null ? null : formatQuotaPercent(100 - usedPercent);
};

const formatQuotaWindowDuration = (value) => {
  const seconds = Number(value);

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "";
  }

  const durationUnits = [
    { seconds: 86400, suffix: "d" },
    { seconds: 3600, suffix: "h" },
    { seconds: 60, suffix: "m" },
  ];
  const unit = durationUnits.find((item) => seconds >= item.seconds && seconds % item.seconds === 0);

  if (unit) {
    return `${seconds / unit.seconds}${unit.suffix}`;
  }

  if (seconds > 3600) {
    return `${(seconds / 3600).toFixed(1)}h`;
  }

  if (seconds > 60) {
    return `${(seconds / 60).toFixed(1)}m`;
  }

  return `${seconds}s`;
};

const resolveQuotaWindowLabel = (window = {}, fallbackLabel = "额度") => {
  const duration = formatQuotaWindowDuration(window?.limit_window_seconds);

  return duration ? `${duration} ${fallbackLabel}` : fallbackLabel;
};

const createRateLimitQuotaLine = (key, fallbackLabel, window = {}) => {
  const percent = resolveRemainingPercentFromUsed(window?.used_percent);

  return {
    key,
    label: resolveQuotaWindowLabel(window, fallbackLabel),
    note: resolveQuotaResetValueNote(window?.reset_at) || "等待重置时间",
    percent,
    tone: percent === null ? "neutral" : "success",
    value: percent === null ? "额度未知" : `${percent}%`,
  };
};

const normalizePlanRateLimitQuotaState = (body, checkedAt) => {
  const planType = normalizePlanType(body?.plan_type);
  const rateLimit = body?.rate_limit || {};
  const primaryWindow = rateLimit?.primary_window || null;
  const secondaryWindow = rateLimit?.secondary_window || null;

  if (!planType || planType === "free" || !primaryWindow || !secondaryWindow) {
    return null;
  }

  const lines = [
    createRateLimitQuotaLine("primary", "额度", primaryWindow),
    createRateLimitQuotaLine("secondary", "总额度", secondaryWindow),
  ];

  return {
    checkedAt,
    error: "",
    label: lines[0]?.value || "额度已刷新",
    lines,
    note: `${planType.toUpperCase()} 计划`,
    percent: null,
    status: "success",
    tone: "success",
    visible: true,
  };
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
    authIndex: item?.authIndex || item?.auth_index || "",
    createdAtRaw,
    createdAtText: formatAccountDateTime(createdAtRaw),
    disabled: Boolean(item?.disabled),
    email: item?.email || item?.account || "",
    fileName: item?.name || item?.id || "--",
    id: item?.id || item?.authIndex || item?.auth_index || `${account}-${index}`,
    path: item?.path || "",
    provider: item?.provider || item?.type || "--",
    providerLabel: formatDisplayLabel(item?.provider || item?.type, "--"),
    quota: createHiddenAccountQuotaState(),
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

const normalizeAccountQuotaPayload = (payload) => {
  const checkedAt = new Date().toISOString();
  const statusCode = Number(payload?.status_code || payload?.statusCode || payload?.code || 0);
  const body = parseMaybeJson(payload?.body ?? payload?.data ?? payload);
  const bodyText = stringifyForSearch(body).toLowerCase();
  const resetNote = resolveQuotaResetNote(body);
  const planRateLimitQuotaState = normalizePlanRateLimitQuotaState(body, checkedAt);

  if (planRateLimitQuotaState) {
    return planRateLimitQuotaState;
  }

  if ([401, 403].includes(statusCode) || bodyText.includes("unauthorized")) {
    return {
      checkedAt,
      error: "",
      label: "认证异常",
      lines: [],
      note: statusCode ? `HTTP ${statusCode}` : "账号认证不可用",
      percent: null,
      status: "success",
      tone: "danger",
      visible: true,
    };
  }

  if (
    bodyText.includes("usage_limit_reached")
    || bodyText.includes("usage limit reached")
    || bodyText.includes("quota_exceeded")
    || bodyText.includes("insufficient")
  ) {
    return {
      checkedAt,
      error: "",
      label: "额度受限",
      lines: [],
      note: resetNote || (statusCode ? `HTTP ${statusCode}` : "账号额度可能已用尽"),
      percent: null,
      status: "success",
      tone: "warning",
      visible: true,
    };
  }

  const remainingValue = findQuotaNumberByKeys(body, REMAINING_QUOTA_KEYS);
  const remainingPercentValue = findQuotaNumberByKeys(body, REMAINING_PERCENT_KEYS);
  const usedPercentValue = findQuotaNumberByKeys(body, USED_PERCENT_KEYS);
  const limitValue = findQuotaNumberByKeys(body, LIMIT_QUOTA_KEYS);
  const usedValue = findQuotaNumberByKeys(body, USED_QUOTA_KEYS);
  const calculatedRemaining =
    remainingValue === null
    && limitValue !== null
    && usedValue !== null
      ? Math.max(limitValue - usedValue, 0)
      : remainingValue;
  const calculatedLimit =
    limitValue !== null
      ? limitValue
      : calculatedRemaining !== null && usedValue !== null
        ? calculatedRemaining + usedValue
        : null;
  const percentValue = calculatedLimit > 0 && calculatedRemaining !== null
    ? formatQuotaPercent((calculatedRemaining / calculatedLimit) * 100)
    : formatQuotaPercent(
      remainingPercentValue !== null
        ? remainingPercentValue
        : usedPercentValue !== null
          ? 100 - usedPercentValue
          : null,
    );

  if (calculatedRemaining !== null) {
    return {
      checkedAt,
      error: "",
      label: percentValue !== null ? `${percentValue}%` : "额度未知",
      lines: [],
      note: resetNote || (
        calculatedLimit > 0
          ? `剩余 ${formatQuotaValue(calculatedRemaining)} / ${formatQuotaValue(calculatedLimit)}`
          : `剩余 ${formatQuotaValue(calculatedRemaining)}，缺少总额度`
      ),
      percent: percentValue,
      status: "success",
      tone: percentValue === null ? "neutral" : "success",
      visible: true,
    };
  }

  if (percentValue !== null) {
    return {
      checkedAt,
      error: "",
      label: `${percentValue}%`,
      lines: [],
      note: resetNote || "额度已刷新",
      percent: percentValue,
      status: "success",
      tone: "success",
      visible: true,
    };
  }

  return {
    checkedAt,
    error: "",
    label: statusCode && statusCode !== 200 ? `HTTP ${statusCode}` : "额度未知",
    lines: [],
    note: resetNote || "后端未返回剩余额度",
    percent: null,
    status: "success",
    tone: "neutral",
    visible: true,
  };
};

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
  createAccountQuotaErrorState,
  createEmptyAccountSummary,
  createHiddenAccountQuotaState,
  createLoadingAccountQuotaState,
  formatAccountCount,
  formatAccountDateTime,
  hydrateAccountItem,
  normalizeAccountQuotaPayload,
  normalizeAuthAccountPayload,
  summarizeAccountItems,
};
