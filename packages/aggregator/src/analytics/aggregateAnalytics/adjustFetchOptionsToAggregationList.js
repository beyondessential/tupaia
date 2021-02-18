/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { compareAsc, compareDesc, convertDateRangeToPeriodString } from '@tupaia/utils';
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

/**
 * Returns the minimum startDate and the maximum endDate in the provided ranges
 */
const getDateRangeExtremes = dateRanges => {
  const [startDate] = dateRanges.map(dr => dr.startDate).sort(compareAsc);
  const [endDate] = dateRanges.map(dr => dr.endDate).sort(compareDesc);
  return { startDate, endDate };
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
 * @param {Object[]} aggregationList
 */
export const adjustFetchOptionsToAggregationList = (fetchOptions, aggregationList) => {
  if (aggregationList.length === 0) {
    return fetchOptions;
  }

  const { startDate, endDate } = adjustDateRangeToAggregationList(fetchOptions, aggregationList);
  const period = getAdjustedPeriod(fetchOptions, { startDate, endDate });

  return { ...fetchOptions, startDate, endDate, period };
};

/**
 * Algorithm
 * ---------
 * 1. Adjust the fetch options for each aggregation list
 * 2. Return the widest values among the adjusted options, so that all additional data required by
 * each aggregation list (eg past/future data) can be fetched in one go
 *
 * @param {Object[][]} aggregationLists
 */
export const adjustFetchOptionsToAggregationLists = (fetchOptions, aggregationLists) => {
  if (aggregationLists.length === 0) {
    return fetchOptions;
  }

  const adjustedDateRanges = aggregationLists.map(aggregationList =>
    adjustDateRangeToAggregationList(fetchOptions, aggregationList),
  );
  const { startDate, endDate } = getDateRangeExtremes(adjustedDateRanges);
  const period = getAdjustedPeriod(fetchOptions, { startDate, endDate });

  return { ...fetchOptions, startDate, endDate, period };
};
