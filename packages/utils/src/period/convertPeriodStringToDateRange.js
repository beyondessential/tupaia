/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { periodToMoment, periodToType, periodTypeToMomentUnit } from './period';

const periodToDateString = (period, isEndPeriod) => {
  const mutatingMoment = periodToMoment(period);
  const periodType = periodToType(period);
  const momentUnit = periodTypeToMomentUnit(periodType);
  if (isEndPeriod) {
    mutatingMoment.endOf(momentUnit);
  } else {
    mutatingMoment.startOf(momentUnit);
  }
  return mutatingMoment.format('YYYY-MM-DD');
};

export const convertPeriodStringToDateRange = periodString => {
  if (periodString === '') {
    throw new Error('Period string is empty');
  }
  const periods = periodString.split(';');
  const startPeriod = periods[0];
  const endPeriod = periods[periods.length - 1];
  return [periodToDateString(startPeriod, false), periodToDateString(endPeriod, true)];
};
