/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { convertDateRangeToPeriods } from './convertDateRangeToPeriods';
import { utcMoment } from '../datetime';

export const EARLIEST_DATA_DATE_STRING = '2017-01-01'; // Tupaia started in 2017
export const EARLIEST_DATA_DATE = utcMoment(EARLIEST_DATA_DATE_STRING);

// Assemble a default date range using monthly granularity.
export const getDefaultPeriod = () => {
  const startDate = EARLIEST_DATA_DATE.date(1);
  const endDate = utcMoment();

  return convertDateRangeToPeriods(startDate, endDate).join(';');
};
