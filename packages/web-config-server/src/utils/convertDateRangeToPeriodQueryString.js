/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { convertDateRangeToPeriods } from '@tupaia/utils';

export const convertDateRangeToPeriodQueryString = (startDate, endDate) => {
  if (!startDate) {
    return null;
  }

  if (startDate && !endDate) {
    return convertDateRangeToPeriods(startDate, startDate)[0];
  }

  return convertDateRangeToPeriods(startDate, endDate).join(';');
};
