/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { Route } from '@tupaia/server-boilerplate';
import { TranslatableRoute } from './TranslatableRoute';
import { ReportConnection, WebConfigConnection } from '../connections';
import { LESMIS_PROJECT_NAME, LESMIS_HIERARCHY_NAME } from '../constants';

export class ReportRoute extends TranslatableRoute {
  private readonly reportConnection: ReportConnection;

  private readonly webConfigConnection: WebConfigConnection;

  translationKeys = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        label: {
          type: 'string'
        }
      }
    }
  };

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.reportConnection = new ReportConnection(req.session);
    this.webConfigConnection = new WebConfigConnection(req.session);
  }

  async buildResponse() {
    const { entityCode, reportCode } = this.req.params;
    const { type, legacy } = this.req.query;
    // We only care about the difference between dashboards and mapOverlays if we're requesting legacy reports
    if (legacy === 'true') {
      switch (type) {
        case 'dashboard': {
          const legacyReport = await this.webConfigConnection.fetchDashboardReport(reportCode, {
            organisationUnitCode: entityCode,
            projectCode: LESMIS_PROJECT_NAME,
            ...this.req.query,
          });
          return legacyReport.data;
        }
        case 'mapOverlay': {
          return this.webConfigConnection.fetchMapOverlayData({
            mapOverlayId: reportCode,
            organisationUnitCode: entityCode,
            projectCode: LESMIS_PROJECT_NAME,
            ...this.req.query,
          });
        }
      }
    }
    // Otherwise just pull from report server
    const report = await this.reportConnection.fetchReport(reportCode, {
      // Report server can accept arrays so the parameters are plural
      organisationUnitCodes: entityCode,
      hierarchy: LESMIS_HIERARCHY_NAME,
      ...this.req.query,
    });
    return report.results;
  }
}
