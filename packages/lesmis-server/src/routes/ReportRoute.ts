/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { ReportConnection, WebConfigConnection } from '../connections';
import { LESMIS_PROJECT_NAME } from '../constants';

export class ReportRoute extends Route {
  private readonly reportConnection: ReportConnection;
  private readonly webConfigConnection: WebConfigConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.reportConnection = new ReportConnection(req.session);
    this.webConfigConnection = new WebConfigConnection(req.session);
  }

  async buildResponse() {
    const { entityCode, reportCode } = this.req.params;
    const { type } = this.req.query;
    switch (type) {
      case 'dashboard':
        return this.webConfigConnection.fetchDashboardReport({
          viewId: reportCode,
          organisationUnitCode: entityCode,
          projectCode: LESMIS_PROJECT_NAME,
          ...this.req.query,
        });
      case 'mapOverlay':
        return this.webConfigConnection.fetchMapOverlayData({
          measureId: reportCode,
          organisationUnitCode: entityCode,
          projectCode: LESMIS_PROJECT_NAME,
          ...this.req.query,
        });
      default:
        return this.reportConnection.fetchReport(
          reportCode,
          {
            // Report server can accept arrays so the parameters are plural
            organisationUnitCodes: entityCode,
            projectCodes: LESMIS_PROJECT_NAME,
            ...this.req.query,
          },
          this.req.body,
        );
    }
  }
}
