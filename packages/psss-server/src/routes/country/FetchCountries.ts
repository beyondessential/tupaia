/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { getSortByKey, UnauthenticatedError } from '@tupaia/utils';
import { PSSS_PERMISSION_GROUP } from '../../constants';
import { Route } from '../Route';

export type FetchCountriesRequest = Request<
  Record<string, never>,
  any,
  Record<string, unknown>,
  Record<string, never>
>;

export class FetchCountries extends Route<FetchCountriesRequest> {
  public async buildResponse(): Promise<any> {
    if (!this.entityConnection) throw new UnauthenticatedError('Unauthenticated');

    const countries = await this.entityConnection.fetchCountries();
    const { accessPolicy } = await this.req.session;
    const allowedEntities = accessPolicy.getEntitiesAllowed(PSSS_PERMISSION_GROUP);

    // TODO get sorted response from `entityConnection`:
    // https://github.com/beyondessential/tupaia-backlog/issues/2658
    const data = countries.filter(c => allowedEntities.includes(c.code)).sort(getSortByKey('name'));
    return { data };
  }
}
