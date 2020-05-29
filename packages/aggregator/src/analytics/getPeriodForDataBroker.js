/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  utcMoment,
  convertDateRangeToPeriodString,
  PERIOD_TYPES,
  momentToPeriod,
} from '@tupaia/utils';
import { AGGREGATION_TYPES } from '../aggregationTypes';

const EARLIEST_DATA_DATE = utcMoment('2017-01-01'); // Tupaia started in 2017

export const getPeriodForDataBroker = (aggregationType, initialPeriod) => {
  // If aggregation type is SUM_PREVIOUS_EACH_DAY we need to fetch data for all time.
  return aggregationType === AGGREGATION_TYPES.SUM_PREVIOUS_EACH_DAY
    ? getAllTimeUntilPeriod(initialPeriod.endDate)
    : initialPeriod;
};

const getAllTimeUntilPeriod = endPeriod => {
  const startDate = EARLIEST_DATA_DATE.date(1);
  const endDate = utcMoment(endPeriod) || utcMoment().endOf('month');
  return {
    startDate: momentToPeriod(startDate, PERIOD_TYPES.DAY),
    endDate: momentToPeriod(endDate, PERIOD_TYPES.DAY),
    period: convertDateRangeToPeriodString(startDate, endDate),
  };
};
