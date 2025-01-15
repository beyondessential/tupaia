import moment from 'moment';

const DEFAULT_RANGE = 2;
/**
 * @param {string} periodGranularity granularity for the range
 * @param {string} passedStartDate beginning of the range to be passed (can be null)
 * @param {string} passedEndDate end of the range to be passed - defaults to now
 * @returns {{ startDate, endDate }}
 */
export function getDateRange(
  periodGranularity,
  passedStartDate,
  endDate = moment(),
  periodRange = DEFAULT_RANGE,
) {
  let startDate = passedStartDate;
  if (!startDate) {
    startDate = moment(endDate).subtract(periodRange, periodGranularity);
  }
  return { startDate, endDate };
}
