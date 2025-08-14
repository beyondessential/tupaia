import { convertPeriodStringToDateRange, getDefaultPeriod } from '@tupaia/utils';
import { getIsoDateString } from '@tupaia/tsutils';

export const getDefaultStartDate = () =>
  new Date(convertPeriodStringToDateRange(getDefaultPeriod())[0]);
export const getDefaultEndDate = () =>
  new Date(convertPeriodStringToDateRange(getDefaultPeriod())[1]);

export const getDefaultStartDateString = () => getIsoDateString(getDefaultStartDate());
export const getDefaultEndDateString = () => getIsoDateString(getDefaultEndDate());
