/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import { min, max, findCoarsestPeriodType, periodToType } from '@tupaia/utils';

export const periodFromAnalytics = (analytics, { period: requestedPeriod }) => {
  return {
    requested: requestedPeriod,
    ...getMostAndLeastRecentPeriod(analytics.map(analytic => analytic.period)),
  };
};

const getMostAndLeastRecentPeriod = periods => {
  if (!periods || periods.length === 0) {
    return {
      earliestAvailable: null,
      latestAvailable: null,
    };
  }
  const groupedPeriods = groupBy(periods, period => period.substring(0, 4));
  // sorts ascending
  const sortedKeys = Object.keys(groupedPeriods).sort((year1, year2) => year1 - year2);
  const earliestYearPeriods = groupedPeriods[sortedKeys[0]];
  const latestYearPeriods = groupedPeriods[sortedKeys[sortedKeys.length - 1]];

  return {
    earliestAvailable: min(findPeriodsWithCoarsestType(earliestYearPeriods)).toString(),
    latestAvailable: max(findPeriodsWithCoarsestType(latestYearPeriods)).toString(),
  };
};

const findPeriodsWithCoarsestType = periods => {
  const periodTypes = periods.map(period => periodToType(period));
  const coarsestPeriodType = findCoarsestPeriodType(periodTypes);

  return periods.filter((period, index) => periodTypes[index] === coarsestPeriodType);
};
