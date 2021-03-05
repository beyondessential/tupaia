/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { convertDateRangeToPeriodString } from '@tupaia/utils';
import { AGGREGATION_TYPES } from '../../aggregationTypes';
import { getDateRangeForOffsetPeriod } from './aggregations/offsetPeriod';
import { getDateRangeForSumPreviousPerPeriod } from './aggregations/sumPreviousPerPeriod';

const AGGREGATION_TYPE_TO_DATE_RANGE_GETTER = {
  [AGGREGATION_TYPES.SUM_PREVIOUS_EACH_DAY]: getDateRangeForSumPreviousPerPeriod,
  [AGGREGATION_TYPES.OFFSET_PERIOD]: getDateRangeForOffsetPeriod,
};

/**
 * Currently not all `startDate`, `endDate`, `period` options are provided in each client request.
 * This function preserves the existing functionality by retaining the original period if
 * there was no date range adjustment
 */
const getAdjustedPeriod = (originalOptions, adjustedOptions) => {
  const areDateRangesEqual =
    originalOptions?.startDate === adjustedOptions?.startDate &&
    originalOptions?.endDate === adjustedOptions?.endDate;

  return areDateRangesEqual
    ? originalOptions.period
    : convertDateRangeToPeriodString(adjustedOptions.startDate, adjustedOptions.endDate);
};

const adjustDateRangeToAggregationList = (dateRange, aggregationList) =>
  aggregationList.reduce((currentRange, aggregation) => {
    const getDateRange = AGGREGATION_TYPE_TO_DATE_RANGE_GETTER[aggregation.type];
    return getDateRange ? getDateRange(currentRange, aggregation.config) : currentRange;
  }, dateRange);

/**
 * Each aggregation in the list may require the original fetch option dimensions (dates, org units etc)
 * to be adjusted, eg when we need to take into account past/future data
 *
 * Also, append the aggregations list to the fetchOptions as they may be used in dataFetch aggregation
 *
 * @param {Object[]} aggregations
 */
export const adjustFetchOptionsToAggregationList = (fetchOptions, aggregations) => {
  if (aggregations.length === 0) {
    return fetchOptions;
  }

  const { startDate, endDate } = adjustDateRangeToAggregationList(fetchOptions, aggregations);
  const period = getAdjustedPeriod(fetchOptions, { startDate, endDate });

  return { ...fetchOptions, startDate, endDate, period, aggregations };
};
