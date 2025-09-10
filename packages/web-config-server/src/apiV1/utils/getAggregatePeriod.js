import { getMostRecentPeriod, getMostAncientPeriod } from '@tupaia/utils';

/**
 * @typedef {Object} PeriodObj
 * @property {string} latestAvailable
 * @property {string} earliestAvailable
 * @property {string} requested
 * @param {PeriodObj[]} periods
 * @returns {PeriodObj}
 */
export const getAggregatePeriod = periods => {
  if (!periods) return null;

  const filteredPeriods = periods.filter(Boolean);

  if (filteredPeriods.length === 0) return null;

  return {
    latestAvailable: getMostRecentPeriod(filteredPeriods.map(p => p.latestAvailable)),
    earliestAvailable: getMostAncientPeriod(filteredPeriods.map(p => p.earliestAvailable)),
    requested: filteredPeriods[0].requested,
  };
};
