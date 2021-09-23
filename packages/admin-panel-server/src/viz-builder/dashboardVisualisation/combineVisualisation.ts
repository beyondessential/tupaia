/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DashboardItem, LegacyReport, Report, DashboardVizResource, DashboardViz } from '../types';

const getData = (report: Report) => {
  const { config } = report;
  const {
    fetch: { dataElements, dataGroups, aggregations },
    transform,
  } = config;

  return { dataElements, dataGroups, aggregations, transform };
};

const getLegacyData = (report: LegacyReport) => {
  const { dataBuilder, config } = report;
  return { dataBuilder, config };
};

const getPresentation = (dashboardItem: DashboardItem, report: Report | LegacyReport) => {
  const { config: reportConfig } = report;
  const { output } = reportConfig;
  const { config: dashboardItemConfig } = dashboardItem;
  const { type, name, ...config } = dashboardItemConfig;

  const presentation: Record<string, unknown> = { type, ...config };
  if (dashboardItem.legacy) {
    presentation.output = output;
  }

  return presentation;
};

export function combineVisualisation(visualisationResource: DashboardVizResource): DashboardViz {
  const { dashboardItem, report } = visualisationResource;
  const { id, code, config } = dashboardItem;
  const { name } = config;
  const data = dashboardItem.legacy
    ? getLegacyData(report as LegacyReport)
    : getData(report as Report);
  const presentation = getPresentation(dashboardItem, report);

  const visualisation: Record<string, unknown> = {
    id,
    code,
    name,
    data,
    presentation,
  };
  if (dashboardItem.legacy) {
    visualisation.permissionGroup = (report as Report).permissionGroup;
  }

  return visualisation as DashboardViz;
}
