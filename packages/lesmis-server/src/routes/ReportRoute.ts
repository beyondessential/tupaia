/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';
import { TranslatableRoute } from '@tupaia/server-boilerplate';
import { ReportConnection, WebConfigConnection } from '../connections';
import { LESMIS_PROJECT_NAME, LESMIS_HIERARCHY_NAME } from '../constants';

export class ReportRoute extends TranslatableRoute {
  private readonly reportConnection: ReportConnection;

  private readonly webConfigConnection: WebConfigConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.reportConnection = new ReportConnection(req.session);
    this.webConfigConnection = new WebConfigConnection(req.session);
    this.translationSchema = {
      domain: 'reports',
      layout: {
        type: 'array',
        items: {
          type: 'object',
          keysToTranslate: 'all',
          valuesToTranslate: ['label', 'name'],
        }
      }
    };
  }

  // Check for _metadata keys and only translate the first part
  // Lets us use the same translation entry for regular and _metadata keys
  translateKey(value: string): string {
    if (value.endsWith('_metadata')) {
      const key = this.translateString(value.slice(0, -('_metadata'.length)));
      return `${key}_metadata`;
    }
    return this.translateString(value);
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
            mapOverlayCode: reportCode,
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
