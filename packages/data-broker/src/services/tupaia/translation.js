/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { dateStringToPeriod, convertPeriodStringToDateRange } from '@tupaia/utils';

// converts from the TupaiaDataApi representation (which uses 'date') to the
// format expected by consumers of analytics (which uses 'period')
export const translateAnalyticsForConsumer = analytics =>
  analytics.map(({ date, ...a }) => ({
    ...a,
    period: dateStringToPeriod(date),
  }));

export const translateOptionsForTupaiaDataApi = ({ period, ...restOfOptions }) => {
  if (!period) return restOfOptions;
  const [startDate, endDate] = convertPeriodStringToDateRange(period);
  return {
    startDate,
    endDate,
    ...restOfOptions, // if start/end dates are also provided, we favour them over period
  };
};
