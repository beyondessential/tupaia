import {
  convertPeriodStringToDateRange,
  periodToDateString,
  dateStringToPeriod,
} from '@tupaia/utils';
import { format, getISODay, subWeeks, addWeeks } from 'date-fns';
import { DUE_ISO_DAY } from '../constants';

/**
 *
 * Convenience utils that build on top of @tupaia/utils
 * Uses period string (eg. 2020W32)
 * Using local time for current period and not UTC. Therefore not using @tupaia/utils getCurrentPeriod
 */
export const getCurrentPeriod = () => format(new Date(), "RRRR'W'II");

export const getDisplayDatesByPeriod = period => {
  const start = getFormattedStartByPeriod(period, 'LLL d');
  const end = getFormattedEndByPeriod(period, 'LLL d, yyyy');
  return `${start} - ${end}`;
};

export const getFormattedStartByPeriod = (period, f) => {
  const dates = convertPeriodStringToDateRange(period);
  return format(new Date(dates[0]), f);
};

export const getFormattedEndByPeriod = (period, f) => {
  const dates = convertPeriodStringToDateRange(period);
  return format(new Date(dates[1]), f);
};

export const getCurrentIsoWeekNumber = () => {
  const period = getCurrentPeriod();
  return getWeekNumberByPeriod(period);
};

export const getWeekNumberByPeriod = period => period.split('W').pop();

export const getDateByPeriod = period => {
  const date = periodToDateString(period);
  return new Date(date);
};

export const getPeriodByDate = date => {
  const dateString = format(date, 'yyyy-MM-dd');
  return dateStringToPeriod(dateString, 'WEEK');
};

export const subtractWeeksFromPeriod = (period, amount) => {
  const date = getDateByPeriod(period);
  const newDate = subWeeks(date, amount);
  return getPeriodByDate(newDate);
};

export const addWeeksToPeriod = (period, amount) => {
  const date = getDateByPeriod(period);
  const newDate = addWeeks(date, amount);
  return getPeriodByDate(newDate);
};

export const getDaysTillDueDay = () => {
  const isoDay = getISODay(new Date());
  return DUE_ISO_DAY - isoDay;
};
