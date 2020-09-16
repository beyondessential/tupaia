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

    /*
     * Inclusive/exclusive date conversion:
     *
     * WeatherBit dates are exclusive on the tail end. Requesting Tuesday - Thursday will request
     * Tuesday 00:01am to Thursday 00:01am, so we need to push out the end date by 1 day.
     */
    endDate = moment(endDate)
      .add(1, 'day')
      .format(DATE_FORMAT);

    // Prevent limits from being hit, which prevents API from returning error response
    return this.checkLimits(startDate, endDate);
  }

  checkLimits(startDate, endDate) {
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

    return {
      startDate,
      endDate,
    };
  }
}
