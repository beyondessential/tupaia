import { convertDateRangeToPeriodQueryString } from '@tupaia/utils';
import { getDefaultPeriod } from '/utils';

export class QueryBuilder {
  constructor(originalQuery, replacementValues = {}, routeHandler) {
    this.query = { ...originalQuery };
    this.replacementValues = replacementValues;
    this.routeHandler = routeHandler;
  }

  getQueryParameter(parameterKey) {
    return this.query[parameterKey] || this.replacementValues[parameterKey];
  }

  // Ensure the standard dimensions of period, start/end date, and organisation unit are set up
  async build(dataSourceEntities) {
    this.makePeriodReplacements();
    this.replaceOrgUnitCodes(dataSourceEntities);
    this.makeEventReplacements();
    return this.query;
  }

  makeEventReplacements() {
    this.query.eventId = this.getQueryParameter('eventId');
    this.query.trackedEntityInstance = this.getQueryParameter('trackedEntityInstance');
    this.query.programCode = this.getQueryParameter('programCode');
    if (!this.query.startDate && !this.query.endDate && !this.query.period) {
      this.query.period = getDefaultPeriod();
    }
  }

  replaceOrgUnitCodes(dataSourceEntities) {
    this.query.organisationUnitCodes = dataSourceEntities.map(e => e.code);
    delete this.query.organisationUnitCode;
  }

  async getDataSourceEntities() {
    const organisationUnitCode = this.getQueryParameter('organisationUnitCode');
    const entityAggregationConfig = this.getQueryParameter('entityAggregation') || {};
    const dataSourceEntities = await this.routeHandler.fetchDataSourceEntities(
      organisationUnitCode,
      {
        ...entityAggregationConfig,
        dataSourceEntityFilter: this.getQueryParameter('dataSourceEntityFilter'),
      },
    );
    return dataSourceEntities;
  }

  getEntityAggregationOptions() {
    return this.getQueryParameter('entityAggregation') || {};
  }

  getQuery = () => this.query;

  // Adds standard period, start date and end date
  makePeriodReplacements() {
    // Make standard replacements if required
    this.query.startDate = this.getQueryParameter('startDate');
    this.query.endDate = this.getQueryParameter('endDate');

    // Define the period, based on the query, the preconfigured period, or the default
    if (this.replacementValues.period) {
      // If a the api consumer defined a period to use in query parameters, use that
      this.query.period = this.replacementValues.period;
    } else if (!this.query.period) {
      // If no period defined anywhere, use the period defined by the start and end dates or the default
      this.query.period =
        convertDateRangeToPeriodQueryString(this.query.startDate, this.query.endDate) ??
        getDefaultPeriod();
    }
  }
}
