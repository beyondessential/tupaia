/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getCurrentPeriod, convertPeriodStringToDateRange } from '@tupaia/utils';
import { format, getISODay, subWeeks, addWeeks } from 'date-fns';
import { DUE_ISO_DAY } from '../constants';

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
  const date = convertPeriodStringToDateRange(period)[0];
  return new Date(date);
};

export const getPeriodByDate = date => format(date, "yyyy'W'II");

export const subtractPeriod = (period, amount) => {
  const date = getDateByPeriod(period);
  const newDate = subWeeks(date, amount);
  return getPeriodByDate(newDate);
};

export const addPeriod = (period, amount) => {
  const date = getDateByPeriod(period);
  const newDate = addWeeks(date, amount);
  return getPeriodByDate(newDate);
};

export const getDaysRemaining = () => {
  const isoDay = getISODay(new Date());
  return DUE_ISO_DAY - isoDay;
};
