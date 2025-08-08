import { Request } from 'express';

import { Route } from '@tupaia/server-boilerplate';

import {
  DashboardVisualisationExtractor,
  draftDashboardItemValidator,
  draftMapOverlayValidator,
  draftReportValidator,
  PreviewMode,
  DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM,
  DashboardItemOrMapOverlayParam,
} from '../viz-builder';
import { MapOverlayVisualisationExtractor } from '../viz-builder/mapOverlayVisualisation/MapOverlayVisualisationExtractor';

export type FetchReportPreviewDataRequest = Request<
  Record<string, never>,
  Record<string, unknown>,
  {
    previewConfig: Record<string, unknown>;
    testData?: unknown[];
  },
  {
    entityCode?: string;
    hierarchy?: string;
    startDate?: string;
    endDate?: string;
    permissionGroup?: string;
    previewMode?: PreviewMode;
    dashboardItemOrMapOverlay: DashboardItemOrMapOverlayParam;
  }
>;

export class FetchReportPreviewDataRoute extends Route<FetchReportPreviewDataRequest> {
  public async buildResponse() {
    this.validate();

    const { entityCode, hierarchy, startDate, endDate, permissionGroup } = this.req.query;
    const { testData = null } = this.req.body;

    const reportConfig = this.getReportConfig();

    const parameters: Record<string, string> = {};
    if (hierarchy) parameters.hierarchy = hierarchy;
    if (entityCode) parameters.organisationUnitCodes = entityCode;
    if (startDate) parameters.startDate = startDate;
    if (endDate) parameters.endDate = endDate;
    if (permissionGroup) parameters.permissionGroup = permissionGroup;

    return this.req.ctx.services.report.testReport(parameters, {
      testData,
      testConfig: reportConfig,
    });
  }

  private validate = () => {
    const { previewConfig } = this.req.body;

    if (!previewConfig) {
      throw new Error('Requires preview config to fetch preview data');
    }
  };

  private getReportConfig = () => {
    const { previewMode, dashboardItemOrMapOverlay } = this.req.query;
    const { previewConfig, testData } = this.req.body;

    const extractor = this.getVizExtractor(dashboardItemOrMapOverlay, previewConfig);

    extractor.setReportValidatorContext({ testData });

    return extractor.getReport(previewMode).config;
  };

  private getVizExtractor = (
    dashboardItemOrMapOverlay: DashboardItemOrMapOverlayParam,
    previewConfig: Record<string, unknown>,
  ) => {
    if (dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.DASHBOARD_ITEM) {
      return new DashboardVisualisationExtractor(
        previewConfig,
        draftDashboardItemValidator,
        draftReportValidator,
      );
    }

    if (dashboardItemOrMapOverlay === DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM.MAP_OVERLAY) {
      return new MapOverlayVisualisationExtractor(
        previewConfig,
        draftMapOverlayValidator,
        draftReportValidator,
      );
    }

    throw new Error(
      `Unknown param dashboardItemOrMapOverlay: ${dashboardItemOrMapOverlay}, must be one of: [${Object.values(
        DASHBOARD_ITEM_OR_MAP_OVERLAY_PARAM,
      )}]`,
    );
  };
}
