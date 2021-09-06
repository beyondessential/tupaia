/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DashboardItem, Report } from '../types';

export class DashboardVisualisationCombiner {
  private readonly dashboardItem: DashboardItem;

  private readonly report: Report;

  constructor(dashboardItem: DashboardItem, report: Report) {
    this.dashboardItem = dashboardItem;
    this.report = report;
  }

  getData() {
    const { config } = this.report;
    const {
      fetch: { dataElements, dataGroups, aggregations },
      transform,
    } = config;

    return {
      dataElements,
      dataGroups,
      aggregations,
      transform,
    };
  }

  getPresentation() {
    const { config: reportConfig } = this.report;
    const { output } = reportConfig;
    const { config: dashboardItemConfig } = this.dashboardItem;
    const { type, name, ...config } = dashboardItemConfig;

    return {
      type,
      ...config,
      output,
    };
  }

  getVisualisation() {
    const {
      id,
      code,
      config: { name },
    } = this.dashboardItem;
    const { permissionGroup } = this.report;
    const data = this.getData();
    const presentation = this.getPresentation();

    return {
      id,
      code,
      name,
      permissionGroup,
      data,
      presentation,
    };
  }
}
