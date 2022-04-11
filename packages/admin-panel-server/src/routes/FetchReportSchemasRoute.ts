/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { ReportConnection } from '../connections';

export type FetchTransformSchemasRequest = Request<
  Record<string, never>,
  Record<string, unknown>[],
  Record<string, never>
>;

export class FetchTransformSchemasRoute extends Route<FetchTransformSchemasRequest> {
  private readonly reportConnection: ReportConnection;

  public constructor(req: FetchTransformSchemasRequest, res: Response, next: NextFunction) {
    super(req, res, next);

    this.reportConnection = new ReportConnection(req.session);
  }

  public async buildResponse() {
    return this.reportConnection.fetchTransformSchemas();
  }
}
