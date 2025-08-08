import { Request } from 'express';
import { getSortByKey } from '@tupaia/utils';
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
    const countries = await this.entityConnection.fetchCountries();
    const { accessPolicy } = this.req.session;
    const allowedEntities = accessPolicy.getEntitiesAllowed(PSSS_PERMISSION_GROUP);

    // TODO get sorted response from `entityConnection`:
    // https://github.com/beyondessential/tupaia-backlog/issues/2658
    const data = countries.filter(c => allowedEntities.includes(c.code)).sort(getSortByKey('name'));
    return { data };
  }
}
