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
} from '@tupaia/utils';

export const convertToPeriod = (period: string, targetType: string): string => {
  return baseConvertToPeriod(period, targetType);
};

export const periodToTimestamp = (period: string): number => {
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

export const formatAsFractionAndPercentage = (numerator: number, denominator: number) => {
  if (typeof numerator !== 'number' || typeof denominator !== 'number') {
    throw new Error(
      `Function 'formatAsFractionAndPercentage' expect ${numerator} and ${denominator} as number`,
    );
  }
  if (denominator === 0) {
    throw new Error('One of the denominators is 0');
  }
  return baseFormatDataValueByType(
    { value: numerator / denominator, metadata: { numerator, denominator } },
    'fractionAndPercentage',
  );
};
