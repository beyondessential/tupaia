import moment from 'moment-timezone';

/**
 * @param {Array} exportData The sheet data that are ready to be exported
 * @param {String} timeZone
 * @param {String} startDate
 * @param {String} endDate
 * @returns {Array} exportData with exported data and origin
 */
export const addExportedDateAndOriginAtTheSheetBottom = (
  exportData,
  timeZone,
  startDate,
  endDate,
) => {
  const formatDate = date => moment(date).format('DD/MM/YY');
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
