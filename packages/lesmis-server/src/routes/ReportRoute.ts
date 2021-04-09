/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { ReportConnection, WebConfigConnection } from '../connections';

export class ReportRoute extends Route {
  private readonly reportConnection: ReportConnection;
  private readonly webConfigConnection: WebConfigConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.reportConnection = new ReportConnection(req.session);
    this.webConfigConnection = new WebConfigConnection(req.session);
  }

  async buildResponse() {
    const { reportCode } = this.req.params;
    const { type } = this.req.query;
    switch(type) {
      case 'view':
        return this.webConfigConnection.fetchDashboardReport({ viewId: reportCode, ...this.req.query });
      case 'measureData':
        return this.webConfigConnection.fetchMapOverlay({ measureId: reportCode, ...this.req.query });
      default:
        return this.reportConnection.fetchReport(reportCode, this.req.query);
    }
  }
}
