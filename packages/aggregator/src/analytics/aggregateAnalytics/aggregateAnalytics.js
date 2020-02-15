/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AGGREGATION_TYPES } from '../../aggregationTypes';
import { PERIOD_TYPES } from '../../periodTypes';
import {
  filterLatest,
  getFinalValuePerPeriod,
  sumAcrossPeriods,
  sumEachDataElement,
} from './aggregations';

const { DAY, WEEK, MONTH, YEAR } = PERIOD_TYPES;

export const aggregateAnalytics = (
  analytics,
  aggregationType = AGGREGATION_TYPES.MOST_RECENT,
  aggregationConfig = {},
) => {
  const { orgUnitIdsToGroupKeys } = aggregationConfig;

  switch (aggregationType) {
    case AGGREGATION_TYPES.MOST_RECENT:
    case AGGREGATION_TYPES.MOST_RECENT_PER_ORG_GROUP:
      return filterLatest(analytics, orgUnitIdsToGroupKeys);
    case AGGREGATION_TYPES.SUM:
      return sumAcrossPeriods(analytics);
    case AGGREGATION_TYPES.SUM_MOST_RECENT_PER_FACILITY:
      return sumEachDataElement(filterLatest(analytics));
    case AGGREGATION_TYPES.FINAL_EACH_DAY:
      return getFinalValuePerPeriod(analytics, DAY);
    case AGGREGATION_TYPES.FINAL_EACH_DAY_FILL_EMPTY_DAYS:
      return getFinalValuePerPeriod(analytics, DAY, { fillEmptyValues: true });
    case AGGREGATION_TYPES.FINAL_EACH_WEEK:
      return getFinalValuePerPeriod(analytics, WEEK);
    case AGGREGATION_TYPES.FINAL_EACH_MONTH:
      return getFinalValuePerPeriod(analytics, MONTH);
    case AGGREGATION_TYPES.FINAL_EACH_MONTH_PREFER_DAILY_PERIOD:
      return getFinalValuePerPeriod(analytics, MONTH, { preferredPeriodType: DAY });
    case AGGREGATION_TYPES.FINAL_EACH_MONTH_FILL_EMPTY_MONTHS:
      return getFinalValuePerPeriod(analytics, MONTH, { fillEmptyValues: true });
    case AGGREGATION_TYPES.FINAL_EACH_YEAR:
      return getFinalValuePerPeriod(analytics, YEAR);
    case AGGREGATION_TYPES.FINAL_EACH_YEAR_FILL_EMPTY_YEARS:
      return getFinalValuePerPeriod(analytics, YEAR, { fillEmptyValues: true });
    case AGGREGATION_TYPES.RAW:
    default:
      return analytics;
  }
};
