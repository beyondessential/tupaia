/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  convertToPeriod as baseConvertToPeriod,
  dateStringToPeriod as baseDateStringToPeriod,
  periodToTimestamp as basePeriodToTimestamp,
  periodToDisplayString as basePeriodToDisplayString,
} from '@tupaia/utils';

export const convertToPeriod = (period: string, targetType: string): string => {
  return baseConvertToPeriod(period, targetType);
};

export const periodToTimestamp = (period: string): string => {
  return basePeriodToTimestamp(period);
};

export const periodToDisplayString = (period: string, targetType: string): string => {
  return basePeriodToDisplayString(period, targetType);
};

export const dateStringToPeriod = (period: string, targetType: string): string => {
  if (!period) {
    return period;
  }
  return baseDateStringToPeriod(period, targetType);
};
