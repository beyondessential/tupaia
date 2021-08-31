/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { ReportConnection } from '../connections';
import {
  DashboardVisualisationExtractor,
  DraftDashboardItemValidator,
  DraftReportValidator,
} from '../viz-builder';
import { PreviewMode } from '../viz-builder/types';

export class FetchReportPreviewDataRoute extends Route {
  private readonly reportConnection: ReportConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.reportConnection = new ReportConnection(req.session);
  }

  async buildResponse() {
    const { entityCode, hierarchy, previewMode } = this.req.query;
    const { previewConfig } = this.req.body;

    if (!previewConfig) {
      throw new Error('Requires preview config to fetch preview data');
    }

    if (!hierarchy) {
      throw new Error('Requires hierarchy to fetch preview data');
    }

    if (!entityCode) {
      throw new Error('Requires entity to fetch preview data');
    }

    const { config: reportConfig } = new DashboardVisualisationExtractor(
      previewConfig,
      new DraftDashboardItemValidator(),
      new DraftReportValidator(),
    ).getReport(previewMode as PreviewMode);

    return this.reportConnection.testReport(
      {
        organisationUnitCodes: entityCode as string,
        hierarchy: hierarchy as string,
      },
      { testConfig: reportConfig },
    );
  }
}
