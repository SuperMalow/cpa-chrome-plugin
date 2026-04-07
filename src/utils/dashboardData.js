const numberFormatter = new Intl.NumberFormat("zh-CN");
const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});
const dateTimeFormatter = new Intl.DateTimeFormat("zh-CN", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  month: "2-digit",
  day: "2-digit",
  hour12: false,
});

const createEmptyAuthFilesSummary = () => ({
  total: 0,
  active: 0,
  disabled: 0,
  unavailable: 0,
  providers: 0,
});

const createEmptyUsageSummary = () => ({
  totalRequests: 0,
  successCount: 0,
  failureCount: 0,
  totalTokens: 0,
  todayRequests: 0,
  todayTokens: 0,
  requestsByHour: {},
  tokensByHour: {},
  modelNames: [],
  modelCount: 0,
});

const formatNumber = (value) => numberFormatter.format(Number(value) || 0);

const formatCompactNumber = (value) =>
  compactNumberFormatter.format(Number(value) || 0);

const formatPercent = (part, total) =>
  total > 0 ? `${((part / total) * 100).toFixed(1)}%` : "0.0%";

const formatDashboardTimestamp = (value) =>
  value ? dateTimeFormatter.format(new Date(value)) : "未同步";

const getLatestHourEntry = (buckets = {}) => {
  const keys = Object.keys(buckets);

  if (!keys.length) {
    return {
      hour: "--",
      label: "暂无小时数据",
      value: 0,
    };
  }

  const latestHour = keys
    .map((key) => String(key).padStart(2, "0"))
    .sort((left, right) => Number(left) - Number(right))
    .at(-1);

  return {
    hour: latestHour,
    label: `${latestHour}:00 - ${latestHour}:59`,
    value: Number(buckets[latestHour] || 0),
  };
};

const normalizeAuthFilesSummary = (payload) => {
  const files = Array.isArray(payload?.files) ? payload.files : [];
  const disabled = files.filter(
    (item) => item?.disabled || item?.status === "disabled",
  ).length;
  const unavailable = files.filter((item) => item?.unavailable).length;
  const active = files.filter(
    (item) => item?.status === "active" && !item?.disabled && !item?.unavailable,
  ).length;
  const providers = new Set(files.map((item) => item?.provider).filter(Boolean))
    .size;

  return {
    total: files.length,
    active,
    disabled,
    unavailable,
    providers,
  };
};

const normalizeUsageSummary = (payload) => {
  const usage = payload?.usage || {};
  const requestsByDay = usage?.requests_by_day || {};
  const tokensByDay = usage?.tokens_by_day || {};
  const requestsByHour = usage?.requests_by_hour || {};
  const tokensByHour = usage?.tokens_by_hour || {};
  const apis = usage?.apis || {};
  const modelNames = [
    ...new Set(
      Object.values(apis).flatMap((api) => Object.keys(api?.models || {})),
    ),
  ];

  return {
    totalRequests: Number(usage?.total_requests) || 0,
    successCount: Number(usage?.success_count) || 0,
    failureCount: Number(usage?.failure_count) || 0,
    totalTokens: Number(usage?.total_tokens) || 0,
    todayRequests: Object.values(requestsByDay).reduce(
      (total, value) => total + (Number(value) || 0),
      0,
    ),
    todayTokens: Object.values(tokensByDay).reduce(
      (total, value) => total + (Number(value) || 0),
      0,
    ),
    requestsByHour,
    tokensByHour,
    modelNames,
    modelCount: modelNames.length,
  };
};

const resolveDashboardErrorMessage = (error) => {
  const status = error?.response?.status;
  const responseMessage =
    error?.response?.data?.message
    || error?.response?.data?.detail
    || error?.response?.data?.error;

  if (responseMessage) {
    return typeof responseMessage === "string"
      ? responseMessage
      : JSON.stringify(responseMessage);
  }

  if (status) {
    return `请求失败，状态码 ${status}`;
  }

  if (error?.message === "Network Error") {
    return "请求被浏览器拦截，通常是接口未正确放行 CORS，请检查 Origin、Authorization 和 OPTIONS 预检";
  }

  return error?.message || "读取 CPA 面板数据失败";
};

export {
  createEmptyAuthFilesSummary,
  createEmptyUsageSummary,
  formatCompactNumber,
  formatDashboardTimestamp,
  formatNumber,
  formatPercent,
  getLatestHourEntry,
  normalizeAuthFilesSummary,
  normalizeUsageSummary,
  resolveDashboardErrorMessage,
};
