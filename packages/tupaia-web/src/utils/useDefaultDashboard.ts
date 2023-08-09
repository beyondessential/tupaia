/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useParams } from 'react-router';
import { useDashboards, useProject } from '../api/queries';
import { Dashboard } from '../types';

export const useDefaultDashboard = () => {
  const { projectCode, entityCode } = useParams();
  const { data: project } = useProject(projectCode);
  const { dashboards, isLoading, isError } = useDashboards(projectCode, entityCode);
  // when loading, return '' so that the user doesn't get redirected more than once, e.g. if there is a dashboardGroupName but it ends up not being valid after loading
  if (isLoading || (!dashboards && !isError)) return '';
  let defaultDashboardName = project?.dashboardGroupName || '';

  if (
    !defaultDashboardName ||
    (dashboards.length > 0 &&
      !dashboards?.find(
        (dashboard: Dashboard) => dashboard.code === decodeURIComponent(defaultDashboardName),
      ))
  ) {
    defaultDashboardName = dashboards?.[0]?.name || '';
  }

  return encodeURIComponent(defaultDashboardName);
};
