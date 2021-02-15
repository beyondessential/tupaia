/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  momentToDateString,
  momentToPeriod,
  periodToMoment,
  periodToType,
  periodTypeToMomentUnit,
  utcMoment,
} from '@tupaia/utils';

class RequiredConfigFieldError extends Error {
  constructor(fieldKey) {
    super(`'${fieldKey}' is required in offsetPeriod() config`);
    this.name = 'RequiredConfigFieldError';
  }
}

const validateOffsetPeriodConfig = (config = {}) => {
  const { periodType, offset } = config;
  if (!periodType) {
    throw new RequiredConfigFieldError('periodType');
  }
  if (!offset && offset !== 0) {
    throw new RequiredConfigFieldError('offset');
  }
};

const addOffsetToPeriod = (period, { periodType, offset }) => {
  const momentUnit = periodTypeToMomentUnit(periodType.toUpperCase());
  const momentWithOffset = periodToMoment(period).add(offset, momentUnit);
  return momentToPeriod(momentWithOffset, periodToType(period));
};

export const offsetPeriod = (analytics, config) => {
  validateOffsetPeriodConfig(config);

  return analytics.map(analytic => ({
    ...analytic,
    period: addOffsetToPeriod(analytic.period, config),
  }));
};

export const getDateRangeForOffsetPeriod = (dateRange, config) => {
  validateOffsetPeriodConfig(config);

  const periodType = config.periodType.toUpperCase();
  // Expands the provided date to the opposite direction than the offset
  // so that enough data will be available for its calculation
  const offsetCompensation = config.offset * -1;

  const getMomentWithOffset = dateString => {
    const momentUnit = periodTypeToMomentUnit(periodType);
    return utcMoment(dateString).add(offsetCompensation, momentUnit);
  };

  const startMoment = getMomentWithOffset(dateRange.startDate);
  const endMoment = getMomentWithOffset(dateRange.endDate).endOf(periodType);

  return {
    startDate: momentToDateString(startMoment),
    endDate: momentToDateString(endMoment),
  };
};
