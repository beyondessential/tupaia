/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation, useParams } from 'react-router-dom';
import { getDefaultDashboard } from '.';
import { useDashboards, useProject } from '../api/queries';

export const useEntityLink = (entityCode?: string) => {
  const location = useLocation();
  const { projectCode, entityCode: entityCodeParam } = useParams();
  const { data: project } = useProject(projectCode);

  // If entityCode is not provided, use the one from the URL
  const newEntityCode = entityCode || entityCodeParam;

  const { dashboards, isLoading, isError } = useDashboards(projectCode, newEntityCode);

  const defaultDashboardName = getDefaultDashboard(project, dashboards, isLoading, isError);

  return { ...location, pathname: `/${projectCode}/${newEntityCode}/${defaultDashboardName}` };
};
