/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getSortByKey } from '@tupaia/utils';
import { Route } from '../Route';

export class FetchCountrySites extends Route {
  async buildResponse() {
    const { fields } = this.req.query;
    const { countryCode } = this.req.params;

    const sites = await this.entityConnection.fetchSites(countryCode, { fields });
    // TODO get sorted response from `entityConnection`:
    // https://github.com/beyondessential/tupaia-backlog/issues/2658
    const data = sites.sort(getSortByKey('name'));

    return { data };
  }
}
