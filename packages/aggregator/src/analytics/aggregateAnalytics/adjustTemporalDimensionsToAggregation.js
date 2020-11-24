/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { comparePeriods, convertDateRangeToPeriodString, PERIOD_TYPES } from '@tupaia/utils';
import { AGGREGATION_TYPES } from '../../aggregationTypes';
import { getDateRangeForOffsetPeriod } from './aggregations/offsetPeriod';
import { getDateRangeForSumPreviousPerPeriod } from './aggregations/sumPreviousPerPeriod';

/**
 * @typedef {Object} DateRange
 * @property {string} startDate
 * @property {string} endDate
 */

/**
 * Returns the minimum startDate and the maximum endDate in the provided ranges
 */
const getDateRangeExtremes = dateRanges => {
  const [startDate] = dateRanges.map(dr => dr.startDate).sort(comparePeriods);
  const [endDate] = dateRanges.map(dr => dr.endDate).sort((a, b) => comparePeriods(a, b) * -1);
  return { startDate, endDate };
};

/**
 * @returns {DateRange | undefined} Returns `undefined` if there is no need for
 * adjustment
 */
const adjustDateRangeToAggregation = (dateRange, aggregation) => {
  const { type: aggregationType, config } = aggregation;

  switch (aggregationType) {
    case AGGREGATION_TYPES.SUM_PREVIOUS_EACH_DAY:
      return getDateRangeForSumPreviousPerPeriod(dateRange, config, PERIOD_TYPES.DAY);
    case AGGREGATION_TYPES.OFFSET_PERIOD:
      return getDateRangeForOffsetPeriod(dateRange, config);
    default:
      return undefined;
  }
};

const getAggregations = aggregationOptions => {
  const { aggregations = [], aggregationType } = aggregationOptions;
  return aggregationType ? [aggregationOptions] : aggregations;
};

/**
 * @param {{ startDate, endDate, period }} temporalDimensions
 */
export const adjustTemporalDimensionsToAggregation = (temporalDimensions, aggregationOptions) => {
  const adjustedDateRanges = getAggregations(aggregationOptions)
    .map(aggregation => adjustDateRangeToAggregation(temporalDimensions, aggregation))
    .filter(dr => !!dr);

  if (adjustedDateRanges.length === 0) {
    // No need to adjust the provided date ranges, returning the input
    return temporalDimensions;
  }
  const { startDate, endDate } = getDateRangeExtremes(adjustedDateRanges);
  return { startDate, endDate, period: convertDateRangeToPeriodString(startDate, endDate) };
};
