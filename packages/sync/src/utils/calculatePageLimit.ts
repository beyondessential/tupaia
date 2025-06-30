interface DynamicLimiter {
  initialLimit: number;
  minLimit: number;
  maxLimit: number;
  optimalTimePerPageMs: number;
  maxLimitChangePerPage: number;
}

// TODO: Move to config model RN-1668
export const DYNAMIC_LIMITER = {
  initialLimit: 10, // start relatively low then grow upward
  minLimit: 1,
  maxLimit: 10000,
  optimalTimePerPageMs: 2000, // aim for 2 seconds per page
  maxLimitChangePerPage: 0.2, // max 20% increase/decrease from page to page
};

// Set the current page limit based on how long the previous page took to complete.
export const calculatePageLimit = (
  currentLimit?: number,
  lastPageTime?: number,
  dynamicLimiter: DynamicLimiter = DYNAMIC_LIMITER,
): number => {
  const { initialLimit, minLimit, maxLimit, optimalTimePerPageMs, maxLimitChangePerPage } =
    dynamicLimiter;

  if (!currentLimit) {
    return initialLimit;
  }

  // if the time is negative, the clock has gone backwards, so we can't reliably use it.
  // we ignore that event and return the current limit.
  if (!lastPageTime || lastPageTime < 0) {
    return currentLimit;
  }

  const durationPerRecord = lastPageTime / currentLimit;
  const optimalLimit = optimalTimePerPageMs / durationPerRecord;

  return Math.min(
    Math.max(
      Math.floor(optimalLimit),
      minLimit,
      Math.floor(currentLimit - currentLimit * maxLimitChangePerPage),
    ),
    maxLimit,
    Math.ceil(currentLimit + currentLimit * maxLimitChangePerPage),
  );
};
