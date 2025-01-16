import type { Moment } from 'moment';

import { utcMoment } from '@tupaia/tsutils';
import { stripTimezoneFromDate } from '@tupaia/utils';

const getAdjustedDates = (startDate?: string, endDate?: string) => {
  const adjustMoment = (moment: Moment) => stripTimezoneFromDate(moment.toISOString());

  return {
    startDate: startDate ? adjustMoment(utcMoment(startDate).startOf('day')) : undefined,
    endDate: endDate ? adjustMoment(utcMoment(endDate).endOf('day')) : undefined,
  };
};

export const sanitiseFetchDataOptions = <
  Options extends { dataElementCodes?: string[]; startDate?: string; endDate?: string }
>(
  options: Options,
) => {
  const { dataElementCodes = [], startDate: startDateInput, endDate: endDateInput } = options;

  const { startDate, endDate } = getAdjustedDates(startDateInput, endDateInput);

  return {
    ...options,
    dataElementCodes,
    startDate,
    endDate,
  };
};
