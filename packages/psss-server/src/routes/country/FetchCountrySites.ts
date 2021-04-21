/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { getSortByKey, removeAt } from '@tupaia/utils';
import { Route } from '../Route';

export class FetchCountrySites extends Route {
  async buildResponse() {
    const { country, sites } = await this.fetchCountryAndSites();
    const siteCodeToDistrictName = await this.fetchSiteCodeToDistrictName();

    const buildSiteAddress = (site: typeof sites[number]) => ({
      name: site.name,
      district: siteCodeToDistrictName[site.code],
      country: country.name,
    });

    // TODO get sorted response from `entityConnection`:
    // https://github.com/beyondessential/tupaia-backlog/issues/2658
    const data = sites
      .map(site => ({ ...site, address: buildSiteAddress(site), contact: {} }))
      .sort(getSortByKey('name'));

    return { data };
  }

  fetchCountryAndSites = async () => {
    const { countryCode } = this.req.params;

    const entities = await this.entityConnection.fetchDescendants(countryCode, {
      fields: ['id', 'code', 'name', 'type'],
      filter: { type: 'facility' },
      includeRootEntity: true,
    });

    const countryIndex = entities.findIndex(e => e.code === countryCode);
    if (countryIndex === -1) {
      throw new Error(`Requested country '${countryCode}' is missing in the descendant response`);
    }
    const country = entities[countryIndex];
    const sites = removeAt(entities, countryIndex);

    return { country, sites };
  };

  fetchSiteCodeToDistrictName = async () => {
    const { countryCode } = this.req.params;

    return this.entityConnection.fetchRelations(countryCode, {
      ancestor: { filter: { type: 'district' }, field: 'name' },
      descendant: { filter: { type: 'facility' }, field: 'code' },
      groupBy: 'descendant',
    });
  };
}
