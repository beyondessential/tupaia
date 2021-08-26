/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { isNil, omitBy } from 'lodash';

import { snakeKeys } from '@tupaia/utils';
import {
  DashboardItem,
  DashboardVisualisationObject,
  DashboardVisualisationResource,
  PreviewMode,
  Report,
  CamelKeysToSnake,
  VisualisationValidator,
} from '../types';

export class DashboardVisualisationExtractor {
  private readonly visualisation: DashboardVisualisationObject;

  private readonly dashboardItemValidator: VisualisationValidator;

  private readonly reportValidator: VisualisationValidator;

  constructor(
    visualisation: DashboardVisualisationObject,
    dashboardItemValidator: VisualisationValidator,
    reportValidator: VisualisationValidator,
  ) {
    this.visualisation = visualisation;
    this.dashboardItemValidator = dashboardItemValidator;
    this.reportValidator = reportValidator;
  }

  public extractDashboardVisualisationResource = (): DashboardVisualisationResource => {
    // Resources (like the ones passed to meditrak-server for upsert) use snake_case keys
    const dashboardItem = snakeKeys(this.getDashboardItem()) as CamelKeysToSnake<DashboardItem>;
    const report = snakeKeys(this.getReport()) as CamelKeysToSnake<Report>;

    return { dashboardItem, report };
  };

  extractDashboardItem(): DashboardItem {
    const { id, code, name, presentation } = this.visualisation;
    return {
      id,
      code,
      // TODO: for prototype, the whole presentation object will be the json edit box
      // But in the future, it will be broken down into different structure.
      // config: {
      //   type: presentation.type,
      //   ...presentation.config,
      //   name,
      // },
      config: {
        ...presentation,
        name,
      },
      reportCode: code,
      legacy: false,
    };
  }

  getDashboardItem() {
    if (!this.dashboardItemValidator) {
      throw new Error('No validator provided for extracting dashboard item');
    }
    this.dashboardItemValidator.validate(this.visualisation);
    return this.extractDashboardItem();
  }

  extractReport(previewMode?: PreviewMode): Report {
    const { code, permissionGroup, data, presentation } = this.visualisation;
    const { dataElements, dataGroups, aggregations } = data;

    // Remove empty config
    const fetch = omitBy(
      {
        dataElements,
        dataGroups,
        aggregations,
      },
      isNil,
    );

    // Remove empty config
    const config = omitBy(
      {
        fetch,
        transform: data.transform,
        output: previewMode === PreviewMode.PRESENTATION ? presentation?.output : null,
      },
      isNil,
    );

    return {
      code,
      permissionGroup,
      config,
    };
  }

  getReport(previewMode?: PreviewMode) {
    if (!this.reportValidator) {
      throw new Error('No validator provided for extracting report');
    }
    this.reportValidator.validate(this.visualisation);
    return this.extractReport(previewMode);
  }
}
