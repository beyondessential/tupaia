/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

export type FetchAggregationOptionsRequest = Request<
  Record<string, never>,
  Record<string, unknown>[],
  Record<string, never>
>;

export class FetchAggregationOptionsRoute extends Route<FetchAggregationOptionsRequest> {
  public async buildResponse() {
    return this.req.ctx.services.report.fetchAggregationOptions();
  }
}
