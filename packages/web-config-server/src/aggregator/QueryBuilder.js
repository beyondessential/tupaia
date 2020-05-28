/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { getDefaultPeriod } from '/utils';
import { Entity } from '/models';

export class QueryBuilder {
  constructor(originalQuery, replacementValues = {}, initialAggregationOptions = {}, routeHandler) {
    this.query = { ...originalQuery };
    this.replacementValues = replacementValues;
    this.aggregationOptions = { ...initialAggregationOptions };
    this.routeHandler = routeHandler;
  }

  getQueryParameter(parameterKey) {
    return this.query[parameterKey] || this.replacementValues[parameterKey];
  }

  // Ensure the standard dimensions of period, start/end date, and organisation unit are set up
  async build() {
    this.makePeriodReplacements();
    const dataSourceEntities = await this.fetchAndReplaceOrgUnitCodes();
    await this.buildAggregationOptions(dataSourceEntities);
    this.makeEventReplacements();
    return { fetchOptions: this.query, aggregationOptions: this.aggregationOptions };
  }

  makeEventReplacements() {
    this.query.eventId = this.getQueryParameter('eventId');
    this.query.trackedEntityInstance = this.getQueryParameter('trackedEntityInstance');
    this.query.programCode = this.getQueryParameter('programCode');
    if (!this.query.startDate && !this.query.endDate && !this.query.period) {
      this.query.period = getDefaultPeriod();
    }
  }

  async fetchAndReplaceOrgUnitCodes() {
    const organisationUnitCode = this.getQueryParameter('organisationUnitCode');
    const entity = await Entity.findOne({ code: organisationUnitCode });
    const dataSourceEntities = await this.routeHandler.fetchDataSourceEntities(
      entity,
      this.getQueryParameter('dataSourceEntityType'),
    );
    this.query.organisationUnitCodes = dataSourceEntities.map(e => e.code);
    delete this.query.organisationUnitCode;
    return dataSourceEntities;
  }

  async buildAggregationOptions(dataSourceEntities) {
    const entityAggregation = await this.routeHandler.fetchEntityAggregationConfig(
      dataSourceEntities,
    );
    if (!entityAggregation) return;
    const aggregationType = this.aggregationOptions.aggregationType;
    const aggregationConfig = this.aggregationOptions.aggregationConfig;
    const aggregations =
      this.aggregationOptions.aggregations || aggregationType
        ? [
            {
              type: aggregationType,
              config: aggregationConfig,
            },
          ]
        : [];
    console.log(JSON.stringify(aggregations), entityAggregation);
    this.aggregationOptions.aggregations = [
      // entity aggregation always happens last, this should be configurable
      ...aggregations,
      entityAggregation,
    ];
    delete this.aggregationOptions.aggregationType;
    delete this.aggregationOptions.aggregationConfig;
  }

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
      // If no period defined anywhere, use the default
      this.query.period = getDefaultPeriod();
    }
  }
}
