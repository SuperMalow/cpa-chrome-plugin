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
  requestDetails: [],
});

const formatNumber = (value) => numberFormatter.format(Number(value) || 0);

const formatCompactNumber = (value) =>
  compactNumberFormatter.format(Number(value) || 0);

const formatPercent = (part, total) =>
  total > 0 ? `${((part / total) * 100).toFixed(1)}%` : "0.0%";

const formatDashboardTimestamp = (value) =>
  value ? dateTimeFormatter.format(new Date(value)) : "未同步";

const resolveHealthLevel = (value, peakValue) => {
  if (value <= 0 || peakValue <= 0) {
    return 0;
  }

  const ratio = value / peakValue;

  if (ratio >= 0.85) {
    return 4;
  }

  if (ratio >= 0.6) {
    return 3;
  }

  if (ratio >= 0.3) {
    return 2;
  }

  return 1;
};

const resolveSuccessRateLevel = (successRate, total) => {
  if (!total) {
    return 0;
  }

  if (successRate >= 0.99) {
    return 4;
  }

  if (successRate >= 0.95) {
    return 3;
  }

  if (successRate >= 0.85) {
    return 2;
  }

  return 1;
};

const buildLast24HourSlots = (referenceDate = new Date()) => {
  const now = new Date(referenceDate);
  now.setMinutes(0, 0, 0);

  return Array.from({ length: 24 }, (_, index) => {
    const slotDate = new Date(now);
    slotDate.setHours(now.getHours() - (23 - index));

    return {
      hour: String(slotDate.getHours()).padStart(2, "0"),
      isCurrent: index === 23,
      key: [
        slotDate.getFullYear(),
        String(slotDate.getMonth() + 1).padStart(2, "0"),
        String(slotDate.getDate()).padStart(2, "0"),
        String(slotDate.getHours()).padStart(2, "0"),
      ].join("-"),
      label: `${String(slotDate.getMonth() + 1).padStart(2, "0")}/${String(slotDate.getDate()).padStart(2, "0")} ${String(slotDate.getHours()).padStart(2, "0")}:00`,
      slotDate,
    };
  });
};

const buildHourlyMetricTimeline = (
  buckets = {},
  referenceDate = new Date(),
) => {
  const now = new Date(referenceDate);
  now.setMinutes(0, 0, 0);

  const rawItems = buildLast24HourSlots(referenceDate).map((slot) => {
    const isSameDay = slot.slotDate.toDateString() === now.toDateString();
    const value = isSameDay ? Number(buckets[slot.hour] || 0) : 0;

    return {
      ...slot,
      value,
    };
  });

  const peakValue = Math.max(...rawItems.map((item) => item.value), 0);

  return rawItems.map((item) => ({
    ...item,
    level: resolveHealthLevel(item.value, peakValue),
    ratio: peakValue > 0 ? item.value / peakValue : 0,
    tooltip: `${item.label} · ${formatNumber(item.value)}`,
  }));
};

const buildServiceHealthTimeline = (
  details = [],
  referenceDate = new Date(),
) => {
  const slots = buildLast24HourSlots(referenceDate).map((slot) => ({
    ...slot,
    failed: 0,
    success: 0,
    total: 0,
  }));
  const slotMap = Object.fromEntries(
    slots.map((slot) => [slot.key, slot]),
  );

  details.forEach((detail) => {
    if (!detail?.timestamp) {
      return;
    }

    const detailDate = new Date(detail.timestamp);

    if (Number.isNaN(detailDate.getTime())) {
      return;
    }

    detailDate.setMinutes(0, 0, 0);

    const detailKey = [
      detailDate.getFullYear(),
      String(detailDate.getMonth() + 1).padStart(2, "0"),
      String(detailDate.getDate()).padStart(2, "0"),
      String(detailDate.getHours()).padStart(2, "0"),
    ].join("-");
    const slot = slotMap[detailKey];

    if (!slot) {
      return;
    }

    slot.total += 1;

    if (detail.failed) {
      slot.failed += 1;
      return;
    }

    slot.success += 1;
  });

  const timeline = slots.map((slot) => {
    const successRate = slot.total > 0 ? slot.success / slot.total : 0;

    return {
      ...slot,
      level: resolveSuccessRateLevel(successRate, slot.total),
      successRate,
      successRateText: slot.total > 0 ? formatPercent(slot.success, slot.total) : "--",
      tooltip: slot.total > 0
        ? `${slot.label} · 成功 ${slot.success}/${slot.total} · 成功率 ${formatPercent(slot.success, slot.total)}`
        : `${slot.label} · 暂无请求`,
    };
  });

  const totals = timeline.reduce(
    (accumulator, slot) => ({
      failed: accumulator.failed + slot.failed,
      success: accumulator.success + slot.success,
      total: accumulator.total + slot.total,
    }),
    { failed: 0, success: 0, total: 0 },
  );
  const currentHour = timeline.at(-1) || null;
  const latestActiveHour =
    [...timeline].reverse().find((slot) => slot.total > 0) || null;

  return {
    currentHour,
    latestActiveHour,
    timeline,
    totals: {
      ...totals,
      successRate: totals.total > 0 ? totals.success / totals.total : 0,
      successRateText: formatPercent(totals.success, totals.total),
    },
  };
};

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
  const requestDetails = Object.values(apis).flatMap((api) =>
    Object.values(api?.models || {}).flatMap((model) =>
      Array.isArray(model?.details)
        ? model.details
          .filter((detail) => detail?.timestamp)
          .map((detail) => ({
            failed: Boolean(detail?.failed),
            timestamp: detail.timestamp,
          }))
        : [],
    ),
  );
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
    requestDetails,
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
  buildHourlyMetricTimeline,
  buildServiceHealthTimeline,
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
