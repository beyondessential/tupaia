/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { Country } from '@tupaia/types';

export type CountriesRequest = Request<
  Record<string, never>,
  Partial<Country>[],
  Record<string, never>,
  Record<string, never>
>;

export class CountriesRoute extends Route<CountriesRequest> {
  public async buildResponse() {
    const { models } = this.req;

    const countries = await models.country.find(
      {
        code: {
          comparator: '!=',
          comparisonValue: 'TL',
        },
      },
      {
        columns: ['code', 'name'],
        sort: ['name ASC'],
      },
    );

    return Promise.all(countries.map(country => country.getData()));
  }
}
