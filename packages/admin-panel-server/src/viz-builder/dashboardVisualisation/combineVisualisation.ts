/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { LegacyReport, Report} from '../types';
import { DashboardItem, DashboardViz, DashboardVizResource } from './types';

const getData = (report: Report) => {
  const { config } = report;
  const { fetch, transform } = config;
  const { aggregations, ...restOfFetch } = fetch;
  return { fetch: restOfFetch, aggregate: aggregations, transform };
};

const getLegacyData = (report: LegacyReport) => {
  const { dataBuilder, config, dataServices } = report;
  return { dataBuilder, config, dataServices };
};

const getPresentation = (dashboardItem: DashboardItem, report: Report | LegacyReport) => {
  const { config: reportConfig } = report;
  const { config: dashboardItemConfig } = dashboardItem;
  const { type, name, ...config } = dashboardItemConfig;

  const presentation: Record<string, unknown> = { type, ...config };
  if (!dashboardItem.legacy) {
    presentation.output = reportConfig.output;
  }

  return presentation;
};

export function combineVisualisation(visualisationResource: DashboardVizResource): DashboardViz {
  const { dashboardItem, report } = visualisationResource;
  const { id, code, config, legacy } = dashboardItem;
  const { name } = config;
  const data = dashboardItem.legacy
    ? getLegacyData(report as LegacyReport)
    : getData(report as Report);
  const presentation = getPresentation(dashboardItem, report);

  const visualisation: Record<string, unknown> = {
    id,
    code,
    name,
    legacy,
    data,
    presentation,
  };
  if (!dashboardItem.legacy) {
    visualisation.permissionGroup = (report as Report).permissionGroup;
  }

  return visualisation as DashboardViz;
}
