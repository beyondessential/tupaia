/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { getDataSourceEntityType } from 'apiV1/dataBuilders/helpers';
import { getDefaultPeriod } from './getDefaultPeriod';
import { Entity } from '/models';

export class QueryBuilder {
  constructor(originalQuery, replacementValues = {}, checkEntityAccess) {
    this.query = { ...originalQuery };
    this.replacementValues = replacementValues;
    this.checkEntityAccess = checkEntityAccess;
  }

  getQueryParameter(parameterKey) {
    return this.query[parameterKey] || this.replacementValues[parameterKey];
  }

  // Ensure the standard dimensions of period, start/end date, and organisation unit are set up
  build() {
    this.makePeriodReplacements();
    this.buildOrganisationUnitCodes();
    this.makeEventReplacements();
    return this.query;
  }

  makeEventReplacements() {
    this.query.eventId = this.getQueryParameter('eventId');
    this.query.trackedEntityInstance = this.getQueryParameter('trackedEntityInstance');
    this.query.programCode = this.getQueryParameter('programCode');
  }

  // Builds the organisation unit codes for all organisation units data should be fetched from,
  // using the descendents of the selected organisation of the appropriate type (defaults to facility)
  async buildOrganisationUnitCodes() {
    const organisationUnitCode = this.getQueryParameter('organisationUnitCode');
    const entity = await Entity.findOne({ code: organisationUnitCode });
    const dataSourceEntityType = getDataSourceEntityType(this.query);
    if (entity.type === dataSourceEntityType) {
      this.query.organisationUnitCodes = [organisationUnitCode];
      return this.query;
    }
    const dataSourceEntities = await entity.getDescendantsOfType(dataSourceEntityType);
    const entityCodes = dataSourceEntities.map(e => e.code);
    const entityAccessList = await Promise.all(entityCodes.map(this.checkEntityAccess));
    this.query.organisationUnitCodes = entityCodes.filter((_, i) => entityAccessList[i]);
    delete this.query.organisationUnitCode;
    return this.query;
  }

  // Adds standard period, start date and end date
  makePeriodReplacements() {
    const { query, replacementValues } = this;

    // Make standard replacements if required
    query.startDate = this.getQueryParameter('startDate');
    query.endDate = this.getQueryParameter('endDate');

    // Define the period, based on the query, the preconfigured period, or the default
    if (replacementValues.period) {
      // If a the api consumer defined a period to use in query parameters, use that
      query.period = replacementValues.period;
    } else if (!query.period) {
      // If no period defined anywhere, use the default
      query.period = getDefaultPeriod();
    }
    return this.query;
  }
}
