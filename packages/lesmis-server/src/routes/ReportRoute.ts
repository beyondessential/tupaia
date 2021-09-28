/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { ReportConnection, WebConfigConnection } from '../connections';
import { LESMIS_PROJECT_NAME, LESMIS_HIERARCHY_NAME } from '../constants';

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
    const { type, legacy } = this.req.query;
    switch (type) {
      case 'dashboard': {
        if (legacy === 'true') {
          const legacyReport = await this.webConfigConnection.fetchDashboardReport(reportCode, {
            organisationUnitCode: entityCode,
            projectCode: LESMIS_PROJECT_NAME,
            ...this.req.query,
          });
          return legacyReport.data;
        }
        const report = await this.reportConnection.fetchReport(reportCode, {
          organisationUnitCodes: entityCode,
          hierarchy: LESMIS_HIERARCHY_NAME,
          ...this.req.query,
        });
        return report.results;
      }
      case 'mapOverlay':
        return this.webConfigConnection.fetchMapOverlayData({
          mapOverlayId: reportCode,
          organisationUnitCode: entityCode,
          projectCode: LESMIS_PROJECT_NAME,
          ...this.req.query,
        });
      default:
        return this.reportConnection.fetchReport(reportCode, {
          // Report server can accept arrays so the parameters are plural
          organisationUnitCodes: entityCode,
          hierarchy: LESMIS_HIERARCHY_NAME,
          ...this.req.query,
        });
    }
  }
}
