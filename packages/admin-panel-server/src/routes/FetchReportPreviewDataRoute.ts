/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 *
 */

import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import {
  DashboardVisualisationExtractor,
  draftDashboardItemValidator,
  draftMapOverlayValidator,
  draftReportValidator,
  PreviewMode,
  VIZ_TYPE_PARAM,
  VizType,
} from '../viz-builder';
import { MapOverlayVisualisationExtractor } from '../viz-builder/mapOverlayVisualisation/MapOverlayVisualisationExtractor';

export type FetchReportPreviewDataRequest = Request<
  Record<string, never>,
  Record<string, unknown>,
  {
    previewConfig: Record<string, unknown>;
    testData?: unknown[];
  },
  { entityCode: string; hierarchy: string; previewMode?: PreviewMode; vizType: VizType }
>;

export class FetchReportPreviewDataRoute extends Route<FetchReportPreviewDataRequest> {
  public async buildResponse() {
    this.validate();

    const { entityCode, hierarchy } = this.req.query;
    const { testData = null } = this.req.body;

    const reportConfig = this.getReportConfig();

    return this.req.ctx.services.report.testReport(
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
    const { previewMode, vizType } = this.req.query;
    const { previewConfig, testData } = this.req.body;

    const extractor = this.getVizExtractor(vizType, previewConfig);

    extractor.setReportValidatorContext({ testData });

    return extractor.getReport(previewMode).config;
  };

  private getVizExtractor = (vizType: VizType, previewConfig: Record<string, unknown>) => {
    if (vizType === VIZ_TYPE_PARAM.DASHBOARD_ITEM) {
      return new DashboardVisualisationExtractor(
        previewConfig,
        draftDashboardItemValidator,
        draftReportValidator,
      );
    }

    if (vizType === VIZ_TYPE_PARAM.MAP_OVERLAY) {
      return new MapOverlayVisualisationExtractor(
        previewConfig,
        draftMapOverlayValidator,
        draftReportValidator,
      );
    }

    throw new Error(
      `Unknown viz type: ${vizType}, must be one of: [${Object.values(VIZ_TYPE_PARAM)}]`,
    );
  };
}
