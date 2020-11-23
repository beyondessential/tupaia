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

export const offsetPeriod = (analytics, aggregationConfig = {}) => {
  const { periodType, offset } = aggregationConfig;
  if (!periodType) {
    throw new RequiredConfigFieldError('periodType');
  }
  if (!offset && offset !== 0) {
    throw new RequiredConfigFieldError('offset');
  }

  const momentUnit = periodTypeToMomentUnit(periodType.toUpperCase());
  return analytics.map(analytic => {
    const { period } = analytic;
    const momentWithOffset = utcMoment(period).add(offset, momentUnit);
    const currentPeriodType = periodToType(period);
    return { ...analytic, period: momentToPeriod(momentWithOffset, currentPeriodType) };
  });
};
