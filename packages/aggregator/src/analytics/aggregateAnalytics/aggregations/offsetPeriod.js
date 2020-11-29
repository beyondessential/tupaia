/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { momentToPeriod, periodToType, periodTypeToMomentUnit, utcMoment } from '@tupaia/utils';

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
  const momentWithOffset = utcMoment(period).add(offset, momentUnit);
  const currentPeriodType = periodToType(period);
  return momentToPeriod(momentWithOffset, currentPeriodType);
};

export const offsetPeriod = (analytics, aggregationConfig) => {
  validateOffsetPeriodConfig(aggregationConfig);

  return analytics.map(analytic => ({
    ...analytic,
    period: addOffsetToPeriod(analytic.period, aggregationConfig),
  }));
};

/**
 * Expands the provided date to the opposite direction than the offset
 * so that enough data will be available for its calculation
 */
const compensateForPeriodOffset = (date, { periodType, offset }) =>
  addOffsetToPeriod(date, { periodType, offset: offset * -1 });

export const getDateRangeForOffsetPeriod = (dateRange, config) => {
  validateOffsetPeriodConfig(config);
  return {
    startDate: compensateForPeriodOffset(dateRange.startDate, config),
    endDate: compensateForPeriodOffset(dateRange.endDate, config),
  };
};
