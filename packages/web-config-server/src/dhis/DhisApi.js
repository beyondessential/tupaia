/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 **/

import { DhisApi as BaseDhisApi } from '@tupaia/dhis-api';
import { Dhis2Error } from '@tupaia/utils';
import { QueryBuilder } from './QueryBuilder';
import { Entity } from '/models';

export class DhisApi extends BaseDhisApi {
  constructError(message, dhisUrl) {
    return new Dhis2Error({ message }, dhisUrl);
  }

  async getDataValuesInSets(originalQuery, replacementValues, ...otherParams) {
    const queryBuilder = new QueryBuilder(originalQuery, replacementValues);
    const query = await queryBuilder.buildOrganisationUnitCodes(Entity.FACILITY);

    return super.getDataValuesInSets(query, ...otherParams);
  }
}
