/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { periodToTimestamp, isValidPeriod, isCoarserPeriod } from './period';

/**
 * @param {string[]} periods An array of periods
 * @returns {string | null} Most recent period from the input array.
 *
 * Assumes all periods are start periods (e.g. 202002 is earlier than 20200202)
 */
export const getMostRecentPeriod = periods => getPeriodExtreme(periods, true);

/**
 * @param {string[]} periods An array of periods
 * @returns {string | null} Most ancient period from the input array.
 *
 * Assumes all periods are start periods (e.g. 202002 is earlier than 20200202)
 */
export const getMostAncientPeriod = periods => getPeriodExtreme(periods, false);

/**
 * @param {string[]} periods An array of periods
 * @param {boolean} descending Whether to use descending order or not
 * @returns {string | null} Most extreme period from the input array based on gettingMostRecent.
 *
 * Assumes all periods are start periods (e.g. 202002 is earlier than 20200202)
 */
const getPeriodExtreme = (periods = [], descending) => {
  const sortedPeriods = [...periods]
    .filter(period => isValidPeriod(period))
    .sort((p1, p2) => {
      const timestamp1 = periodToTimestamp(p1);
      const timestamp2 = periodToTimestamp(p2);

      if (timestamp1 === timestamp2) {
        return isCoarserPeriod(p1, p2) ? 1 : -1;
      }
      return (timestamp1 - timestamp2) * (descending ? -1 : 1);
    });

  return sortedPeriods[0] || null;
};
