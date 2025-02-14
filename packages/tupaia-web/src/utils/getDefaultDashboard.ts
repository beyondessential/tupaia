import { Dashboard, SingleProject } from '../types';

export const getDefaultDashboard = (
  project?: SingleProject,
  dashboards?: Dashboard[],
  isLoadingDashboards?: boolean,
  hasDashboardError?: boolean,
) => {
  // when loading, return '' so that the user doesn't get redirected more than once, e.g. if there is a dashboardGroupName but it ends up not being valid after loading
  if (isLoadingDashboards || (!dashboards && !hasDashboardError)) return '';
  const defaultDashboardName = project?.dashboardGroupName || '';

  const dashboard =
    dashboards?.find(
      (dashboard: Dashboard) => dashboard.name.trim() === decodeURIComponent(defaultDashboardName),
    ) ||
    dashboards?.[0] ||
    null;

  return encodeURIComponent(dashboard?.code || '');
};
