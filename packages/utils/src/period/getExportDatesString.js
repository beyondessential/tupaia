import moment from 'moment';

export const getExportDatesString = (startDate, endDate) => {
  const format = 'D-M-YY';
  const momentFormat = date => moment(date).format(format);

  if (startDate && endDate)
    return `between ${momentFormat(startDate)} and ${momentFormat(endDate)} `;
  if (startDate) return `after ${momentFormat(startDate)} `;
  if (endDate) return `before ${momentFormat(endDate)} `;
  return '(no period specified)';
};
