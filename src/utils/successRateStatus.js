const SUCCESS_RATE_STATUS_RULES = [
  {
    key: "critical",
    label: "严重异常",
    level: 1,
    max: 0.4,
    maxExclusive: true,
    min: 0,
    textColor: "#991B1B",
    tone: "critical",
  },
  {
    key: "high-risk",
    label: "风险较高",
    level: 2,
    max: 0.6,
    maxExclusive: true,
    min: 0.4,
    textColor: "#DC2626",
    tone: "high-risk",
  },
  {
    key: "attention",
    label: "需关注",
    level: 3,
    max: 0.75,
    maxExclusive: true,
    min: 0.6,
    textColor: "#EA580C",
    tone: "attention",
  },
  {
    key: "caution",
    label: "轻度波动",
    level: 4,
    max: 0.85,
    maxExclusive: true,
    min: 0.75,
    textColor: "#A16207",
    tone: "caution",
  },
  {
    key: "good",
    label: "良好",
    level: 5,
    max: 0.95,
    min: 0.85,
    textColor: "#65A30D",
    tone: "good",
  },
  {
    key: "excellent",
    label: "优秀",
    level: 6,
    max: 1,
    min: 0.95,
    minExclusive: true,
    textColor: "#166534",
    tone: "excellent",
  },
];

const NO_DATA_SUCCESS_RATE_STATUS = {
  key: "no-data",
  label: "暂无数据",
  level: 0,
  textColor: "#64748B",
  tone: "neutral",
};

const normalizeSuccessRate = (successRate) => {
  const numericValue = Number(successRate);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.min(1, Math.max(0, numericValue));
};

const matchesRule = (value, rule) => {
  const meetsMin = rule.minExclusive ? value > rule.min : value >= rule.min;
  const meetsMax = rule.maxExclusive ? value < rule.max : value <= rule.max;

  return meetsMin && meetsMax;
};

const pickStatusFields = (rule) => ({
  key: rule.key,
  label: rule.label,
  level: rule.level,
  textColor: rule.textColor,
  tone: rule.tone,
});

const resolveSuccessRateStatus = (successRate, total) => {
  if (!(Number(total) > 0)) {
    return { ...NO_DATA_SUCCESS_RATE_STATUS };
  }

  const normalizedRate = normalizeSuccessRate(successRate);
  const matchedRule =
    SUCCESS_RATE_STATUS_RULES.find((rule) => matchesRule(normalizedRate, rule))
    || SUCCESS_RATE_STATUS_RULES.at(-1);

  return pickStatusFields(matchedRule);
};

export {
  SUCCESS_RATE_STATUS_RULES,
  resolveSuccessRateStatus,
};
