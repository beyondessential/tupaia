import { PERIOD_TYPES } from '@tupaia/tsutils';
import { AGGREGATION_TYPES } from '../../aggregationTypes';
import {
  countPerOrgGroup,
  countPerPeriodPerOrgGroup,
  filterLatest,
  getFinalValuePerPeriod,
  getSumValuePerPeriod,
  offsetPeriod,
  replaceOrgUnitWithOrgGroup,
  sumAcrossPeriods,
  sumEachDataElement,
  sumPerOrgGroup,
  sumPerPeriodPerOrgGroup,
  sumPreviousPerPeriod,
} from './aggregations';

export const aggregateAnalytics = (
  analytics,
  aggregationType = AGGREGATION_TYPES.MOST_RECENT,
  aggregationConfig = {},
) => {
  const { DAY, WEEK, MONTH, YEAR, QUARTER } = PERIOD_TYPES;

  switch (aggregationType) {
    case AGGREGATION_TYPES.MOST_RECENT:
    case AGGREGATION_TYPES.MOST_RECENT_PER_ORG_GROUP:
      return filterLatest(analytics, aggregationConfig);
    case AGGREGATION_TYPES.SUM:
      return sumAcrossPeriods(analytics);
    case AGGREGATION_TYPES.SUM_UNTIL_CURRENT_DAY:
      return sumAcrossPeriods(analytics, {
        periodOptions: { periodType: DAY, useCurrent: true, excludeFuture: true },
      });
    case AGGREGATION_TYPES.SUM_MOST_RECENT_PER_FACILITY:
      return sumEachDataElement(filterLatest(analytics, aggregationConfig));
    case AGGREGATION_TYPES.OFFSET_PERIOD:
      return offsetPeriod(analytics, aggregationConfig);
    case AGGREGATION_TYPES.FINAL_EACH_DAY:
      return getFinalValuePerPeriod(analytics, aggregationConfig, DAY);
    case AGGREGATION_TYPES.FINAL_EACH_DAY_FILL_EMPTY_DAYS:
      return getFinalValuePerPeriod(
        analytics,
        {
          fillEmptyPeriodsWith: 'previous',
          ...aggregationConfig,
        },
        DAY,
      );
    case AGGREGATION_TYPES.FINAL_EACH_WEEK:
      return getFinalValuePerPeriod(analytics, aggregationConfig, WEEK);
    case AGGREGATION_TYPES.FINAL_EACH_MONTH:
      return getFinalValuePerPeriod(analytics, aggregationConfig, MONTH);
    case AGGREGATION_TYPES.FINAL_EACH_MONTH_PREFER_DAILY_PERIOD:
      return getFinalValuePerPeriod(
        analytics,
        { ...aggregationConfig, preferredPeriodType: DAY },
        MONTH,
      );
    case AGGREGATION_TYPES.FINAL_EACH_MONTH_FILL_EMPTY_MONTHS:
      return getFinalValuePerPeriod(
        analytics,
        {
          fillEmptyPeriodsWith: 'previous',
          ...aggregationConfig,
        },
        MONTH,
      );
    case AGGREGATION_TYPES.FINAL_EACH_QUARTER:
      return getFinalValuePerPeriod(analytics, aggregationConfig, QUARTER);
    case AGGREGATION_TYPES.FINAL_EACH_QUARTER_FILL_EMPTY_QUARTERS:
      return getFinalValuePerPeriod(
        analytics,
        {
          fillEmptyPeriodsWith: 'previous',
          ...aggregationConfig,
        },
        QUARTER,
      );
    case AGGREGATION_TYPES.FINAL_EACH_WEEK_FILL_EMPTY_WEEKS:
      return getFinalValuePerPeriod(
        analytics,
        { fillEmptyPeriodsWith: 'previous', ...aggregationConfig },
        WEEK,
      );
    case AGGREGATION_TYPES.SUM_EACH_QUARTER:
      return getSumValuePerPeriod(analytics, aggregationConfig, QUARTER);
    case AGGREGATION_TYPES.FINAL_EACH_YEAR:
      return getFinalValuePerPeriod(analytics, aggregationConfig, YEAR);
    case AGGREGATION_TYPES.FINAL_EACH_YEAR_FILL_EMPTY_YEARS:
      return getFinalValuePerPeriod(
        analytics,
        {
          fillEmptyPeriodsWith: 'previous',
          ...aggregationConfig,
        },
        YEAR,
      );
    case AGGREGATION_TYPES.SUM_EACH_YEAR:
      return getSumValuePerPeriod(analytics, aggregationConfig, YEAR);
    case AGGREGATION_TYPES.SUM_EACH_MONTH:
      return getSumValuePerPeriod(analytics, aggregationConfig, MONTH);
    case AGGREGATION_TYPES.SUM_EACH_WEEK:
      return getSumValuePerPeriod(analytics, aggregationConfig, WEEK);
    case AGGREGATION_TYPES.SUM_PREVIOUS_EACH_DAY:
      return sumPreviousPerPeriod(analytics, aggregationConfig, DAY);
    case AGGREGATION_TYPES.SUM_PER_ORG_GROUP:
      return sumPerOrgGroup(analytics, aggregationConfig);
    case AGGREGATION_TYPES.SUM_PER_PERIOD_PER_ORG_GROUP:
      return sumPerPeriodPerOrgGroup(analytics, aggregationConfig);
    case AGGREGATION_TYPES.COUNT_PER_ORG_GROUP:
      return countPerOrgGroup(analytics, aggregationConfig);
    case AGGREGATION_TYPES.COUNT_PER_PERIOD_PER_ORG_GROUP:
      return countPerPeriodPerOrgGroup(analytics, aggregationConfig);
    case AGGREGATION_TYPES.REPLACE_ORG_UNIT_WITH_ORG_GROUP:
      return replaceOrgUnitWithOrgGroup(analytics, aggregationConfig);
    case AGGREGATION_TYPES.RAW:
    default:
      return analytics;
  }
};
