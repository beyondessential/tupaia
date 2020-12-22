/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import moment from 'moment-timezone';

/**
 * @param {Array} exportData The sheet data that are ready to be exported
 *
 * @returns {Array} exportData with exported data and origin
 */
export const addExportedDateAndOriginAtTheSheetBottom = (exportData, timeZone) => {
  // Add export date and origin
  // Add two [] for spacing between the table and the export date
  return [
    ...exportData,
    [],
    [],
    [`Data exported from Tupaia.org on ${moment().tz(timeZone).format('Do MMM YYYY')} ${timeZone}`],
  ];
};
