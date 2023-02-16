/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import {
  addMomentOffset,
  convertDateRangeToPeriodString,
  convertPeriodStringToDateRange,
  getDefaultPeriod,
  momentToDateString,
  utcMoment,
} from '@tupaia/utils';

import { FetchReportQuery, PeriodParams } from '../../../../../types';
import { FetchConfig, DateOffset } from '../types';

const buildDateUsingSpecs = (date: string | undefined, dateOffset: DateOffset) => {
  const { from } = dateOffset;
  const baseDate = from === 'today' ? utcMoment() : date;
  const moment = addMomentOffset(utcMoment(baseDate), dateOffset);
  return momentToDateString(moment);
};

const matchesOriginalQuery = (subQuery: Record<string, unknown>, originalQuery: FetchReportQuery) =>
  Object.entries(subQuery).every(
    ([key, value]) => originalQuery[key as keyof FetchReportQuery] === value,
  );

export const buildPeriodParams = (
  query: FetchReportQuery,
  config: FetchConfig,
): Required<PeriodParams> => {
  let { period = getDefaultPeriod(), startDate, endDate } = query;
  const { startDate: startDateSpecs, endDate: endDateSpecs } = config;

  // Use specific date if date specs is string
  if (typeof startDateSpecs === 'string') {
    startDate = startDateSpecs;
  }
  if (typeof endDateSpecs === 'string') {
    endDate = endDateSpecs;
  }

  // Calculate missing period params using other existing params/default values
  if (startDate && endDate) {
    // Force period to be consistent with start and end dates
    period = convertDateRangeToPeriodString(startDate, endDate);
  } else if (startDate) {
    [, endDate] = convertPeriodStringToDateRange(period);
  } else if (endDate) {
    [startDate] = convertPeriodStringToDateRange(period);
  } else {
    [startDate, endDate] = convertPeriodStringToDateRange(period);
  }

  // Apply date offset if date specs is object
  if (typeof startDateSpecs === 'object') {
    startDate = buildDateUsingSpecs(startDate, startDateSpecs);
  }
  if (typeof endDateSpecs === 'object') {
    endDate = buildDateUsingSpecs(endDate, endDateSpecs);
  }

  if (!matchesOriginalQuery({ startDate, endDate }, query)) {
    // Re-adjust period to the new date range
    period = convertDateRangeToPeriodString(startDate, endDate);
  }

  return { period, startDate, endDate } as Required<PeriodParams>;
};
