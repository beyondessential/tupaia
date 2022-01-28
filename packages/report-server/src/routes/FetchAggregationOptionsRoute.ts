/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Request } from 'express';

import { Aggregator } from '@tupaia/aggregator';
import { Route } from '@tupaia/server-boilerplate';

import { AggregationOptionsRouteQuery } from './types';
import { AggregationType } from '../types';

const { aggregationTypesMetaData } = Aggregator;

export type FetchAggregationOptionsRequest = Request<
  { searchText: string },
  AggregationType[],
  Record<string, never>,
  AggregationOptionsRouteQuery
>;

export class FetchAggregationOptionsRoute extends Route<FetchAggregationOptionsRequest> {
  async buildResponse() {
    return aggregationTypesMetaData;
  }
}
