/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { dateStringToPeriod, convertPeriodStringToDateRange } from '@tupaia/utils';

// converts from the TupaiaDataApi/IndicatorApi representation (which uses 'date') to the
// format expected by consumers of analytics (which uses 'period')
export const translateAnalyticsForConsumer = analytics =>
  analytics.map(({ date, ...a }) => ({
    ...a,
    period: dateStringToPeriod(date),
  }));

// converts from the options requested by data-broker clients (which may use 'period') to that used
// by tupaia internal apis (TupaiaDataApi/IndicatorApi)
export const translateOptionsForApi = ({ period, ...restOfOptions }) => {
  if (!period) return restOfOptions;
  const [startDate, endDate] = convertPeriodStringToDateRange(period);
  return {
    ...restOfOptions,
    // if start/end dates are also provided (and not null, undefined, or 0), favour them over period
    startDate: restOfOptions.startDate || startDate,
    endDate: restOfOptions.endDate || endDate,
  };
};
