/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 **/

import { DhisApi as BaseDhisApi } from '@tupaia/dhis-api';
import { Dhis2Error } from '@tupaia/utils';
import { QueryBuilder } from './QueryBuilder';

export class DhisApi extends BaseDhisApi {
  constructError(message, dhisUrl) {
    return new Dhis2Error({ message }, dhisUrl);
  }

  async getAnalytics(originalQuery, replacementValues, ...otherParams) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues);
    queryBuilder.makeDimensionReplacements();
    const query = queryBuilder.makeCustomReplacements();

    return super.getAnalytics(query, ...otherParams);
  }

  async getEventAnalytics(originalQuery, replacementValues, ...otherParams) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues);
    queryBuilder.makeDimensionReplacements();
    queryBuilder.makeEventReplacements();
    const query = queryBuilder.makeCustomReplacements();

    return super.getEventAnalytics(query, ...otherParams);
  }

  async getDataValuesInSets(originalQuery, replacementValues, ...otherParams) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues);
    await queryBuilder.buildOrganisationUnitCodes();
    const query = queryBuilder.makeCustomReplacements();

    return super.getDataValuesInSets(query, ...otherParams);
  }

  async getOrganisationUnits(originalQuery, replacementValues) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues);
    const query = queryBuilder.makeCustomReplacements();

    return super.getOrganisationUnits(query);
  }
}
