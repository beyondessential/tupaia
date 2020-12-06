/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  getCurrentPeriod,
  convertPeriodStringToDateRange,
  periodToDateString,
} from '@tupaia/utils';
import { format, getISODay, subWeeks } from 'date-fns';
import { DUE_ISO_DAY, WEEK_PERIOD_FORMAT } from '../constants';

/**
 *
 * Convenience utils that build on top of @tupaia/utils
 * Uses period string (eg. 2020W32)
 */

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
  const period = getCurrentPeriod('WEEK');
  return getWeekNumberByPeriod(period);
};

export const getWeekNumberByPeriod = period => period.split('W').pop();

export const getDateByPeriod = period => {
  const date = periodToDateString(period);
  return new Date(date);
};

export const getPeriodByDate = date => format(date, WEEK_PERIOD_FORMAT);

export const subtractWeeksFromPeriod = (period, amount) => {
  const date = getDateByPeriod(period);
  const newDate = subWeeks(date, amount);
  return getPeriodByDate(newDate);
};

export const getDaysRemaining = () => {
  const isoDay = getISODay(new Date());
  return DUE_ISO_DAY - isoDay;
};
