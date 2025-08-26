import { useDashboards, useProject } from '../api/queries';
import { EntityCode, ProjectCode } from '../types';

export const useDefaultDashboardName = (
  projectCode?: ProjectCode,
  entityCode?: EntityCode,
): string | undefined => {
  const { data: project, isSuccess: isProjectSuccess } = useProject(projectCode);
  const { data: dashboards, isSuccess: isDashboardsSuccess } = useDashboards(
    projectCode,
    entityCode,
  );

  if (!projectCode || !entityCode || !isProjectSuccess || !isDashboardsSuccess) {
    return undefined;
  }

  const defaultFromProject = project?.dashboardGroupName?.trim();
  if (!defaultFromProject) {
    return dashboards?.[0]?.name;
  }

  if (
    dashboards &&
    dashboards.length > 0 &&
    !dashboards.find(dashboard => dashboard.name.trim() === defaultFromProject)
  ) {
    return dashboards?.[0]?.name;
  }

  return defaultFromProject;
};
