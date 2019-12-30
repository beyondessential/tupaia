import { convertDateRangeToPeriods } from '/utils';

export const convertDateRangeToPeriodString = (startDate, endDate) =>
  convertDateRangeToPeriods(startDate, endDate).join(';');
