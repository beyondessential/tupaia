import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

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
  const formatDate = date => format(new Date(date), 'dd/MM/yy');
  // Add export date and origin
  // Add two [] for spacing between the table and the export date
  return [
    ...exportData,
    [],
    startDate && endDate
      ? [`Includes data from ${formatDate(startDate)} to ${formatDate(endDate)}`]
      : [],
    [
      `Data exported from Tupaia.org on ${formatInTimeZone(
        new Date(),
        timeZone,
        'do MMM yyyy',
      )} ${timeZone}`,
    ],
  ];
};
