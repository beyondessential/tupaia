import { findCoarsestPeriodType } from '@tupaia/utils';
import { periodToType } from '@tupaia/tsutils';

/**
 * Returns which one of two periods is preferred for data aggregation
 *
 * Selection algorithm:
 * 1. Calculate the preferred period type
 *   * By default, the coarsest period type among the provided periods is preferred, e.g. 'MONTH' over 'DAY'
 *   * User can override this by providing a preferred type. This is useful for example
 *     in Medicines Availability Aggregation, where we prefer MediTrak ('DAY') over mSupply ('MONTH') analytics
 * 2. Return the period that belongs to the preferred type. If both (or no) periods belong to
 * this type, then return the must recent one (e.g. is 20180412 preferred over 20180411)
 *
 * @param {string} periodA
 * @param {string} periodB
 * @param {string} preferredPeriodType If set, prefer periods that belong to this type ('DAY'/'MONTH'/'YEAR' etc)
 * @returns {string}
 */
export const getPreferredPeriod = (periodA, periodB, preferredPeriodType) => {
  // If either period is undefined, prefer the other (even if it is also undefined)
  if (!periodA || !periodB) {
    return periodA || periodB;
  }

  const periods = [periodA, periodB];
  const periodTypes = periods.map(period => periodToType(period));

  // Check if any period belongs to a preferred period type
  let filteredPeriods = periods.filter(
    (period, index) => periodTypes[index] === preferredPeriodType,
  );
  // If no period with a preferred period type was found, prefer the one with coarsest period type
  if (!filteredPeriods.length) {
    const coarsestPeriodType = findCoarsestPeriodType(periodTypes);
    filteredPeriods = periods.filter((period, index) => periodTypes[index] === coarsestPeriodType);
  }

  return Math.max(...filteredPeriods).toString();
};
