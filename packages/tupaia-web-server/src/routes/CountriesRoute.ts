import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TupaiaWebCountriesRequest } from '@tupaia/types';

export interface CountriesRequest
  extends Request<
    TupaiaWebCountriesRequest.Params,
    TupaiaWebCountriesRequest.ResBody,
    TupaiaWebCountriesRequest.ReqBody,
    TupaiaWebCountriesRequest.ReqQuery
  > {}

export class CountriesRoute extends Route<CountriesRequest> {
  public async buildResponse() {
    const { models } = this.req;

    const countries = await models.entity.find(
      {
        code: {
          comparator: 'not in',
          // Hide TL and UNFPA Warehouse from the search results
          comparisonValue: ['TL', 'UW'],
        },
        type: 'country',
      },
      {
        columns: ['code', 'name'],
        sort: ['name ASC'],
      },
    );

    return Promise.all(
      countries.map(
        country => country.getData() as Promise<TupaiaWebCountriesRequest.CountriesResponseItem>,
      ),
    );
  }
}
