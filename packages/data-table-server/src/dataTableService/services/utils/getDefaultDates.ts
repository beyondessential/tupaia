/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { convertPeriodStringToDateRange, getDefaultPeriod } from '@tupaia/utils';

/**
 * Returns an ISO date string, without a time, as in the ‘yyyy-mm-dd’ part of
 * ‘yyyy-mm-ddThh:mm:ss[.mmm]’. If the input date object is invalid, returns null.
 */
const getIsoDate = (date: Date) => (isNaN(date.getTime()) ? null : date.toISOString().slice(1, 10));

export const getDefaultStartDate = () =>
  new Date(convertPeriodStringToDateRange(getDefaultPeriod())[0]);
export const getDefaultEndDate = () =>
  new Date(convertPeriodStringToDateRange(getDefaultPeriod())[1]);

export const getDefaultStartDateString = () => getIsoDate(getDefaultStartDate());
export const getDefaultEndDateString = () => getIsoDate(getDefaultEndDate());
