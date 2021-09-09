/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getSortByKey } from '@tupaia/utils';
import { PSSS_PERMISSION_GROUP } from '../../constants';
import { Route } from '../Route';

export class FetchCountries extends Route {
  async buildResponse() {
    const countries = await this.entityConnection.fetchCountries();
    const { accessPolicy } = await this.getSession();
    const allowedEntities = accessPolicy.getEntitiesAllowed(PSSS_PERMISSION_GROUP);

    // TODO get sorted response from `entityConnection`:
    // https://github.com/beyondessential/tupaia-backlog/issues/2658
    const data = countries.filter(c => allowedEntities.includes(c.code)).sort(getSortByKey('name'));
    return { data };
  }
}
