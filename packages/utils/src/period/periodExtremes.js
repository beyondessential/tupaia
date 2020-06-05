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
 * @param {boolean} gettingMostRecent Should the function return the most recent period?
 * @returns {string | null} Most extreme period from the input array based on gettingMostRecent.
 *
 * Assumes all periods are start periods (e.g. 202002 is earlier than 20200202)
 */
const getPeriodExtreme = (periods, gettingMostRecent) => {
  if (!periods || periods.length === 0) return null;

  const sortedPeriods = [...periods]
    .filter(period => isValidPeriod(period))
    .sort((p1, p2) => {
      if (periodToTimestamp(p1) < periodToTimestamp(p2)) return gettingMostRecent;
      else if (periodToTimestamp(p1) > periodToTimestamp(p2)) return !gettingMostRecent;
      // Timestamps are equal
      return isCoarserPeriod(p1, p2);
    });

  if (sortedPeriods.length === 0) return null;

  return sortedPeriods[0];
};
