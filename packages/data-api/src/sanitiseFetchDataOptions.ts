/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { utcMoment, stripTimezoneFromDate } from '@tupaia/utils';
import { AnalyticsFetchOptions } from './AnalyticsFetchQuery';
import { EventsFetchOptions } from './EventsFetchQuery';

const getAdjustedDates = (startDate?: string, endDate?: string) => {
  const adjustMoment = (moment: any) => stripTimezoneFromDate(moment.toISOString());

  return {
    startDate: startDate ? adjustMoment(utcMoment(startDate).startOf('day')) : undefined,
    endDate: endDate ? adjustMoment(utcMoment(endDate).endOf('day')) : undefined,
  };
};

export const sanitiseFetchDataOptions = <
  Options extends AnalyticsFetchOptions | EventsFetchOptions
>(
  options: Options,
) => {
  const {
    dataElementCodes = [],
    startDate: startDateInput,
    endDate: endDateInput,
    ...restOfOptions
  } = options;
  const { startDate, endDate } = getAdjustedDates(startDateInput, endDateInput);

  return {
    dataElementCodes,
    startDate,
    endDate,
    ...restOfOptions,
  };
};
