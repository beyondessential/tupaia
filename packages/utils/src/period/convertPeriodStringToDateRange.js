/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { periodToDateString } from './period';

/**
 * Takes in a string of periods (separated by ';'), and returns the formatted start and end date.
 * Assumes the earliest period is in the first position, and the latest is in the last.
 */
export const convertPeriodStringToDateRange = periodString => {
  if (periodString === '') {
    throw new Error('Period string is empty');
  }
  const periods = periodString.split(';');
  const startPeriod = periods[0];
  const endPeriod = periods[periods.length - 1];
  return [periodToDateString(startPeriod, false), periodToDateString(endPeriod, true)];
};
