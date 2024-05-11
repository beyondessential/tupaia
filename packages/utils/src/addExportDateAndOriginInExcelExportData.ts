/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment-timezone';

export const addExportedDateAndOriginAtTheSheetBottom = (
  exportData: any,
  timeZone: string,
  startDate: string,
  endDate: string,
) => {
  const formatDate = (date: string) => moment(date).format('DD/MM/YY');
  // Add export date and origin
  // Add two [] for spacing between the table and the export date
  return [
    ...exportData,
    [],
    startDate && endDate
      ? [`Includes data from ${formatDate(startDate)} to ${formatDate(endDate)}`]
      : [],
    [`Data exported from Tupaia.org on ${moment().tz(timeZone).format('Do MMM YYYY')} ${timeZone}`],
  ];
};
