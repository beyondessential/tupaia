/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  convertToPeriod as baseConvertToPeriod,
  dateStringToPeriod as baseDateStringToPeriod,
  periodToTimestamp as basePeriodToTimestamp,
  periodToDisplayString as basePeriodToDisplayString,
  formatDataValueByType as baseFormatDataValueByType,
  VALUE_TYPES,
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

export const formatDataValueByType = (
  value: number,
  numerator: number,
  denominator: number,
  valueType: string,
) => {
  if (!(valueType in VALUE_TYPES)) {
    throw new Error(
      `Function 'formatDataValueByType' expect valueType as one of these ${Object.values(
        VALUE_TYPES,
      )}`,
    );
  }
  return baseFormatDataValueByType({ value, metadata: { numerator, denominator } }, valueType);
};
