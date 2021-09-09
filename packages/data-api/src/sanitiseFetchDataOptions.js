/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { utcMoment, stripTimezoneFromDate } from '@tupaia/utils';

const getAdjustedDates = (startDate, endDate) => {
  const adjustMoment = moment => stripTimezoneFromDate(moment.toISOString());

  return {
    startDate: startDate ? adjustMoment(utcMoment(startDate).startOf('day')) : undefined,
    endDate: endDate ? adjustMoment(utcMoment(endDate).endOf('day')) : undefined,
  };
};

export const sanitiseFetchDataOptions = options => {
  const {
    dataElementCodes = [],
    organisationUnitCodes,
    dataGroupCode,
    eventId,
    startDate: startDateInput,
    endDate: endDateInput,
    aggregations,
  } = options;
  const { startDate, endDate } = getAdjustedDates(startDateInput, endDateInput);

  return {
    dataElementCodes,
    organisationUnitCodes,
    dataGroupCode,
    eventId,
    startDate,
    endDate,
    aggregations,
  };
};
