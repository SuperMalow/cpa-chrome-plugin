const DAY_IN_MS = 24 * 60 * 60 * 1000;

const normalizeMessage = (value) => String(value || "").trim().toLowerCase();

const isValidDate = (value) => value instanceof Date && !Number.isNaN(value.getTime());

const findUsageLimitReachedAccountIds = (items = []) =>
  items
    .filter((item) => !item?.disabled)
    .filter((item) => normalizeMessage(item?.statusMessage).includes("usage_limit_reached"))
    .map((item) => item?.id)
    .filter(Boolean);

const findDisabledAccountIdsOlderThanDays = (items = [], days = 7, now = new Date()) => {
  const nowDate = now instanceof Date ? now : new Date(now);

  if (!isValidDate(nowDate)) {
    return [];
  }

  const thresholdMs = Math.max(Number(days) || 0, 0) * DAY_IN_MS;

  return items
    .filter((item) => item?.disabled)
    .filter((item) => {
      const updatedAt = new Date(item?.updatedAtRaw || "");

      if (!isValidDate(updatedAt)) {
        return false;
      }

      return nowDate.getTime() - updatedAt.getTime() > thresholdMs;
    })
    .map((item) => item?.id)
    .filter(Boolean);
};

export {
  findDisabledAccountIdsOlderThanDays,
  findUsageLimitReachedAccountIds,
};
