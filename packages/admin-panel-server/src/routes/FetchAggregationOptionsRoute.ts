/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { ReportConnection } from '../connections';

export type FetchAggregationOptionsRequest = Request<
  Record<string, never>,
  Record<string, unknown>[],
  Record<string, never>,
  { searchText?: string }
>;

export class FetchAggregationOptionsRoute extends Route<FetchAggregationOptionsRequest> {
  private readonly reportConnection: ReportConnection;

  constructor(req: FetchAggregationOptionsRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.reportConnection = new ReportConnection(req.session);
  }

  async buildResponse() {
    const { searchText } = this.req.query;

    return this.reportConnection.fetchAggregationOptions({
      searchText: searchText as string,
    });
  }
}
