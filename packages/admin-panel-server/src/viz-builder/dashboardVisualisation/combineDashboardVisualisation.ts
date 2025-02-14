import { LegacyReport, Report } from '../types';
import { extractDataFromReport } from '../utils';
import { DashboardItem, DashboardViz, DashboardVizResource } from './types';

const getLegacyData = (report: LegacyReport) => {
  const { dataBuilder, config, dataServices } = report;
  return { dataBuilder, config, dataServices };
};

const getPresentation = (dashboardItem: DashboardItem, report: Report | LegacyReport) => {
  const { config: reportConfig } = report;
  const { config: dashboardItemConfig } = dashboardItem;

  const presentation: Record<string, unknown> = { ...dashboardItemConfig };
  if (!dashboardItem.legacy && 'output' in reportConfig) {
    presentation.output = reportConfig.output;
  }

  return presentation;
};

export function combineDashboardVisualisation(
  visualisationResource: DashboardVizResource,
): DashboardViz {
  const { dashboardItem, report } = visualisationResource;
  const { id, code, legacy } = dashboardItem;
  const data = dashboardItem.legacy
    ? getLegacyData(report as LegacyReport)
    : extractDataFromReport(report as Report);
  const presentation = getPresentation(dashboardItem, report);

  const visualisation: Record<string, unknown> = {
    id,
    code,
    legacy,
    data,
    presentation,
  };
  if (!dashboardItem.legacy) {
    const { latestDataParameters, permissionGroup } = report as Report;
    visualisation.permissionGroup = permissionGroup;
    visualisation.latestDataParameters = latestDataParameters;
  }

  return visualisation as DashboardViz;
}
