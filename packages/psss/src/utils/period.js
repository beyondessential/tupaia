/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { convertPeriodStringToDateRange } from '@tupaia/utils';
import { format } from 'date-fns';

/**
 *
 * Convenience utils that build on top of @tupaia/utils
 * Uses period string (eg. 2020W32)
 */

export const getDisplayDatesByPeriod = period => {
  const start = getFormattedStartByPeriod(period, 'LLL d');
  const end = getFormattedEndByPeriod(period, 'LLL d, yyyy');
  return `${start} - ${end}`;
};

export const getFormattedStartByPeriod = (period, f) => {
  const dates = convertPeriodStringToDateRange(period);
  return format(new Date(dates[0]), f);
};

export const getFormattedEndByPeriod = (period, f) => {
  const dates = convertPeriodStringToDateRange(period);
  return format(new Date(dates[1]), f);
};

export const getWeekNumberByPeriod = period => period.split('W').pop();
