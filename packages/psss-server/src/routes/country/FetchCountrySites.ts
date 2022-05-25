/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { getSortByKey, UnauthenticatedError } from '@tupaia/utils';
import { Route } from '../Route';

export type FetchCountrySitesRequest = Request<
  { countryCode: string },
  any,
  Record<string, unknown>,
  Record<string, never>
>;

export class FetchCountrySites extends Route<FetchCountrySitesRequest> {
  public async buildResponse() {
    if (!this.entityConnection) throw new UnauthenticatedError('Unauthenticated');

    const { countryCode } = this.req.params;

    const { country, sites } = await this.entityConnection.fetchCountryAndSites(countryCode);
    const siteCodeToDistrictName = await this.entityConnection.fetchSiteCodeToDistrictName(
      countryCode,
    );

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
}
