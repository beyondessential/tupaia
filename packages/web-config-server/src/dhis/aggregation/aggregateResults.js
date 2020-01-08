import { PERIOD_TYPES } from '/dhis/periodTypes';
import { filterLatestResults } from './filterLatestResults';
import { sumAcrossPeriods } from './sumAcrossPeriods';
import { sumEachDataElement } from './sumEachDataElement';
import { getFinalValuePerPeriod } from './getFinalValuePerPeriod';
import { AGGREGATION_TYPES } from './aggregationTypes';

const { DAY, WEEK, MONTH, YEAR } = PERIOD_TYPES;

export const aggregateResults = (
  results,
  aggregationType = AGGREGATION_TYPES.MOST_RECENT,
  aggregationConfig = {},
) => {
  const { groupMapping } = aggregationConfig;
  switch (aggregationType) {
    case AGGREGATION_TYPES.MOST_RECENT:
    case AGGREGATION_TYPES.MOST_RECENT_PER_ORG_GROUP:
      return filterLatestResults(results, groupMapping);
    case AGGREGATION_TYPES.SUM:
      return sumAcrossPeriods(results);
    case AGGREGATION_TYPES.SUM_MOST_RECENT_PER_FACILITY:
      return sumEachDataElement(filterLatestResults(results));
    case AGGREGATION_TYPES.FINAL_EACH_DAY:
      return getFinalValuePerPeriod(results, DAY);
    case AGGREGATION_TYPES.FINAL_EACH_DAY_FILL_EMPTY_DAYS:
      return getFinalValuePerPeriod(results, DAY, { fillEmptyValues: true });
    case AGGREGATION_TYPES.FINAL_EACH_WEEK:
      return getFinalValuePerPeriod(results, WEEK);
    case AGGREGATION_TYPES.FINAL_EACH_MONTH:
      return getFinalValuePerPeriod(results, MONTH);
    case AGGREGATION_TYPES.FINAL_EACH_MONTH_PREFER_DAILY_PERIOD:
      return getFinalValuePerPeriod(results, MONTH, { preferredPeriodType: DAY });
    case AGGREGATION_TYPES.FINAL_EACH_MONTH_FILL_EMPTY_MONTHS:
      return getFinalValuePerPeriod(results, MONTH, { fillEmptyValues: true });
    case AGGREGATION_TYPES.FINAL_EACH_YEAR:
      return getFinalValuePerPeriod(results, YEAR);
    case AGGREGATION_TYPES.FINAL_EACH_YEAR_FILL_EMPTY_YEARS:
      return getFinalValuePerPeriod(results, YEAR, { fillEmptyValues: true });
    case AGGREGATION_TYPES.RAW:
    default:
      return results;
  }
};
