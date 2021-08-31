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
    this.validate();

    const { entityCode, hierarchy } = this.req.query;
    const { testData = null } = this.req.body;

    const reportConfig = this.getReportConfig();

    return this.reportConnection.testReport(
      {
        organisationUnitCodes: entityCode as string,
        hierarchy: hierarchy as string,
      },
      {
        testData,
        testConfig: reportConfig,
      },
    );
  }

  private validate = () => {
    const { entityCode, hierarchy } = this.req.query;
    const { previewConfig, testData } = this.req.body;

    if (!previewConfig) {
      throw new Error('Requires preview config to fetch preview data');
    }

    if (!testData) {
      if (!hierarchy) {
        throw new Error('Requires hierarchy or test data to fetch preview data');
      }
      if (!entityCode) {
        throw new Error('Requires entity or test data to fetch preview data');
      }
    }
  };

  private getReportConfig = () => {
    const { previewMode } = this.req.query;
    const { previewConfig, testData } = this.req.body;

    const reportValidator = new DraftReportValidator();
    reportValidator.setContext({ testData });
    const dashboardItemValidator = new DraftDashboardItemValidator();
    const extractor = new DashboardVisualisationExtractor(
      previewConfig,
      dashboardItemValidator,
      reportValidator,
    );

    return extractor.getReport(previewMode as PreviewMode).config;
  };
}
