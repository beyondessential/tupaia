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
  async build() {
    this.makePeriodReplacements();
    await this.buildOrganisationUnitCodes();
    this.makeEventReplacements();
    return this.query;
  }

  makeEventReplacements() {
    this.query.eventId = this.getQueryParameter('eventId');
    this.query.trackedEntityInstance = this.getQueryParameter('trackedEntityInstance');
    this.query.programCode = this.getQueryParameter('programCode');
  }

  // Builds the organisation unit codes for all organisation units data should be fetched from,
  // using org unit descendents of the selected entity (optionally of a specific entity type)
  async buildOrganisationUnitCodes(defaultEntityType) {
    const organisationUnitCode = this.getQueryParameter('organisationUnitCode');
    const entity = await Entity.findOne({ code: organisationUnitCode });
    // if a specific type was speicified in either the query or the function parameter, build org
    // units of that type (otherwise we just use the nearest org unit descendants)
    const dataSourceEntityType = this.query.dataSourceEntityType || defaultEntityType;
    const dataSourceEntities = dataSourceEntityType
      ? await entity.getDescendantsOfType(dataSourceEntityType)
      : await entity.getNearestOrgUnitDescendants();
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
