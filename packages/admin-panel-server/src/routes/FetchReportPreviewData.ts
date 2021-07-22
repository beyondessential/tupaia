/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request, Response, NextFunction } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import { ReportConnection } from '../connections';
import { DraftReportExtractor } from '../viz-builder';

export class FetchReportPreviewData extends Route {
  private readonly reportConnection: ReportConnection;

  constructor(req: Request, res: Response, next: NextFunction) {
    super(req, res, next);

    this.reportConnection = new ReportConnection(req.session);
  }

  async buildResponse() {
    const { entityCode, hierarchy } = this.req.query;
    const { previewConfig } = this.req.body;
    if (!previewConfig) {
      throw new Error('Preview config is empty');
    }

    const { config: reportConfig } = new DraftReportExtractor(previewConfig).extract();

    return this.reportConnection.testReport(
      {
        organisationUnitCodes: entityCode,
        hierarchy: hierarchy,
      },
      { testConfig: reportConfig },
    );
  }
}
