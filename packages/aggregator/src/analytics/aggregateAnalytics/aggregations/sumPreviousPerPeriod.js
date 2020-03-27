/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';
import { convertToPeriod } from '@tupaia/dhis-api';
import { getContinuousPeriodsForAnalytics } from './utils';

export const sumPreviousPerPeriod = (analytics, aggregationPeriod) => {
  const periods = getContinuousPeriodsForAnalytics(analytics, aggregationPeriod);
  const analyticsByPeriod = groupBy(analytics, analytic =>
    convertToPeriod(analytic.period, aggregationPeriod),
  );

  const summedAnalyticsInPeriods = periods.reduce((summedAnalytics, period) => {
    const analyticsForPeriod = analyticsByPeriod[period] || [];

    if (!summedAnalytics.length) {
      return [analyticsForPeriod]; //First period, just add analytics
    }

    const previousPeriodAnalytics = summedAnalytics[summedAnalytics.length - 1];
    previousPeriodAnalytics.forEach(previousAnalytic => {
      const indexOfEquivalentAnalytic = analyticsForPeriod.findIndex(
        currentAnalytic =>
          previousAnalytic.dataElement === currentAnalytic.dataElement &&
          previousAnalytic.organisationUnit === currentAnalytic.organisationUnit,
      );
      // If there are no matching response elements already being returned, add it
      if (indexOfEquivalentAnalytic < 0) {
        analyticsForPeriod.push({ ...previousAnalytic, period });
      } else {
        analyticsForPeriod[indexOfEquivalentAnalytic].value += previousAnalytic.value;
      }
    });

    return [...summedAnalytics, analyticsForPeriod];
  }, []);

  return [].concat(...summedAnalyticsInPeriods); //Flatten array
};
