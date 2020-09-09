import moment from 'moment';

const DATE_FORMAT = 'YYYY-MM-DD';

export class DateSanitiser {
  /**
   * @param string startDate
   * @param string endDate
   * @returns Object.<startDate: string, endDate: string>
   */
  sanitise(startDate, endDate) {
    if (startDate > endDate) {
      throw new Error('Start date must be before (or equal to) end date');
    }

    const earliestStartDate = moment()
      .subtract(1, 'year') // max historical is 1 year
      .format(DATE_FORMAT);

    const earliestEndDate = moment(earliestStartDate)
      .add(1, 'day')
      .format(DATE_FORMAT);

    const latestEndDate = moment().format(DATE_FORMAT);

    const latestStartDate = moment(latestEndDate)
      .subtract(1, 'day')
      .format(DATE_FORMAT);

    // earliest date limits
    if (startDate < earliestStartDate && endDate < earliestEndDate) {
      return {
        startDate: earliestStartDate,
        endDate: earliestEndDate,
      };
    } else if (startDate < earliestStartDate) {
      startDate = earliestStartDate;
    }

    // latest date limits
    if (startDate > latestStartDate && endDate > latestEndDate) {
      return {
        startDate: latestStartDate,
        endDate: latestEndDate,
      };
    } else if (endDate > latestEndDate) {
      endDate = latestEndDate;
    }

    // single day requested
    if (startDate === endDate) {
      if (startDate <= latestStartDate) {
        // happy path, push end date out
        endDate = moment(startDate)
          .add(1, 'day')
          .format(DATE_FORMAT);
      } else {
        // edge case, on the limit, can't go beyond it
        startDate = moment(endDate)
          .subtract(1, 'day')
          .format(DATE_FORMAT);
      }
    }

    return {
      startDate,
      endDate,
    };
  }
}
