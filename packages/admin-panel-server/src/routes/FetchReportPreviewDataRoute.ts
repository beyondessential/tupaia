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
  draftDashboardItemValidator,
  draftReportValidator,
  PreviewMode,
} from '../viz-builder';

export type FetchReportPreviewDataRequest = Request<
  { dashboardVisualisationId: string },
  Record<string, unknown>,
  { previewConfig?: Record<string, unknown> },
  { entityCode?: string; hierarchy?: string; previewMode?: PreviewMode }
>;

export class FetchReportPreviewDataRoute extends Route<FetchReportPreviewDataRequest> {
  private readonly reportConnection: ReportConnection;

  constructor(req: FetchReportPreviewDataRequest, res: Response, next: NextFunction) {
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
      draftDashboardItemValidator,
      draftReportValidator,
    ).getReport(previewMode);

    return this.reportConnection.testReport(
      {
        organisationUnitCodes: entityCode as string,
        hierarchy: hierarchy as string,
      },
      { testConfig: reportConfig },
    );
  }
}
