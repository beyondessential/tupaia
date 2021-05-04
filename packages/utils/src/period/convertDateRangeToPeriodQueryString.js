/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { convertDateRangeToPeriods } from './convertDateRangeToPeriods';

export const convertDateRangeToPeriodQueryString = (startDate, endDate, targetType) => {
  if (!startDate) {
    return null;
  }

  if (startDate && !endDate) {
    return convertDateRangeToPeriods(startDate, startDate, targetType)[0];
  }

  return convertDateRangeToPeriods(startDate, endDate, targetType).join(';');
};
