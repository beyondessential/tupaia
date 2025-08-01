import { useDashboards, useProject } from '../api/queries';
import { EntityCode, ProjectCode } from '../types';

export const useDefaultDashboardName = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
): string | undefined => {
  const { data: project, isLoading: isLoadingProject } = useProject(projectCode);
  const {
    data: dashboards,
    isError: isDashboardsError,
    isLoading: isLoadingDashboards,
  } = useDashboards(projectCode, entityCode);

  // When loading, return '' so that the user doesn't get redirected more than once, e.g. if there
  // is a dashboardGroupName but it ends up not being valid after loading
  if (!projectCode || !entityCode || isLoadingProject || isLoadingDashboards || isDashboardsError) {
    return undefined;
  }

  const defaultFromProject = project?.dashboardGroupName?.trim() || '';
  if (!defaultFromProject) {
    return dashboards?.[0]?.name || '';
  }

  if (
    dashboards &&
    dashboards.length > 0 &&
    !dashboards.find(dashboard => dashboard.name.trim() === defaultFromProject)
  ) {
    return dashboards?.[0]?.name || '';
  }

  return defaultFromProject;
};
