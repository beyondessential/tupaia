import { addDays, format, subDays, subYears } from 'date-fns';

const DATE_FORMAT = 'yyyy-MM-dd';

export class DateSanitiser {
  /**
   * Sanitises a date range before it is passed on to the API.
   *
   * This is for observed weather data (i.e. historic)
   */
  public sanitiseHistoricDateRange(startDate?: string, endDate?: string) {
    if (!!startDate && !!endDate && startDate > endDate) {
      throw new Error('Start date must be before (or equal to) end date');
    }

    const {
      earliestStartDate: defaultStartDate,
      latestEndDate: defaultEndDate,
    } = this.getHistoricLimits();

    /*
     * Inclusive/exclusive date conversion:
     *
     * WeatherBit dates are exclusive on the tail end. Requesting Tuesday - Thursday will request
     * Tuesday 00:01am to Thursday 00:01am, so we need to push out the end date by 1 day.
     */
    const sanitisedEndDate = format(addDays(new Date(endDate || defaultEndDate), 1), DATE_FORMAT);
    const sanitisedStartDate = format(new Date(startDate || defaultStartDate), DATE_FORMAT);

    return this.restrictHistoricDatesWithinLimits(sanitisedStartDate, sanitisedEndDate);
  }

  /**
   * Moves start/end date when they poke off to the side of the available data date range
   *
   * This prevents the API from returning an error response.
   */
  private restrictHistoricDatesWithinLimits(startDate: string, endDate: string) {
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

  private getHistoricLimits() {
    // max historical is 1 year
    const earliestStartDate = subYears(new Date(), 1);
    const earliestEndDate = addDays(earliestStartDate, 1);

    const latestEndDate = new Date();
    const latestStartDate = subDays(latestEndDate, 1);

    return {
      earliestStartDate: format(earliestStartDate, DATE_FORMAT),
      earliestEndDate: format(earliestEndDate, DATE_FORMAT),
      latestStartDate: format(latestStartDate, DATE_FORMAT),
      latestEndDate: format(latestEndDate, DATE_FORMAT),
    };
  }
}
