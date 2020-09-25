import moment from 'moment';

const DATE_FORMAT = 'YYYY-MM-DD';

export class DateSanitiser {
  /**
   * Sanitises a date range before it is passed on to the API.
   *
   * This is for observed weather data (i.e. historic)
   *
   * @param {string} startDate
   * @param {string} endDate
   * @returns {{endDate: string|null, startDate: string|null}}
   */
  sanitiseHistoricDateRange(startDate, endDate) {
    if (startDate > endDate) {
      throw new Error('Start date must be before (or equal to) end date');
    }

    const {
      earliestStartDate: defaultStartDate,
      latestEndDate: defaultEndDate,
    } = this.getHistoricLimits();

    let sanitisedStartDate = startDate;
    let sanitisedEndDate = endDate;

    if (!startDate) {
      sanitisedStartDate = defaultStartDate;
    }
    if (!endDate) {
      sanitisedEndDate = defaultEndDate;
    }

    /*
     * Inclusive/exclusive date conversion:
     *
     * WeatherBit dates are exclusive on the tail end. Requesting Tuesday - Thursday will request
     * Tuesday 00:01am to Thursday 00:01am, so we need to push out the end date by 1 day.
     */
    sanitisedEndDate = moment(sanitisedEndDate)
      .add(1, 'day')
      .format(DATE_FORMAT);

    return this.restrictHistoricDatesWithinLimits(sanitisedStartDate, sanitisedEndDate);
  }

  /**
   * Moves start/end date when they poke off to the side of the available data date range
   *
   * This prevents the API from returning an error response.
   *
   * @param {string} startDate
   * @param {string} endDate
   * @returns {{endDate: string|null, startDate: string|null}}
   * @private
   */
  restrictHistoricDatesWithinLimits(startDate, endDate) {
    const {
      earliestStartDate,
      earliestEndDate,
      latestStartDate,
      latestEndDate,
    } = this.getHistoricLimits();

    // completely off to the side, return null
    if (
      (startDate < earliestStartDate && endDate < earliestEndDate) ||
      (startDate > latestStartDate && endDate > latestEndDate)
    ) {
      return {
        startDate: null,
        endDate: null,
      };
    }

    let restrictedStartDate = startDate;
    let restrictedEndDate = endDate;

    // earliest date limits
    if (startDate < earliestStartDate) {
      restrictedStartDate = earliestStartDate;
    }

    // latest date limits
    if (endDate > latestEndDate) {
      restrictedEndDate = latestEndDate;
    }

    return {
      startDate: restrictedStartDate,
      endDate: restrictedEndDate,
    };
  }

  /**
   * @returns {{earliestStartDate: string, latestStartDate: string, earliestEndDate: string, latestEndDate: string}}
   * @private
   */
  getHistoricLimits() {
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

    return {
      earliestStartDate,
      earliestEndDate,
      latestStartDate,
      latestEndDate,
    };
  }
}
