import { Dashboard, SingleProject } from '../types';

export const getDefaultDashboard = (
  project?: SingleProject,
  dashboards?: Dashboard[],
  isLoadingDashboards?: boolean,
  hasDashboardError?: boolean,
) => {
  // when loading, return '' so that the user doesn't get redirected more than once, e.g. if there is a dashboardGroupName but it ends up not being valid after loading
  if (isLoadingDashboards || (!dashboards && !hasDashboardError)) return '';
  let defaultDashboardName = project?.dashboardGroupName || '';

  if (
    !defaultDashboardName ||
    (dashboards &&
      dashboards?.length > 0 &&
      !dashboards?.find(
        (dashboard: Dashboard) =>
          dashboard.name.trim() === decodeURIComponent(defaultDashboardName),
      ))
  ) {
    defaultDashboardName = dashboards?.[0]?.name || '';
  }

  return encodeURIComponent(defaultDashboardName);
};
