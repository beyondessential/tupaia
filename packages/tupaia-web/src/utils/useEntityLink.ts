/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useLocation, useParams } from 'react-router-dom';
import { useProject } from '../api/queries';

export const useEntityLink = (entityCode?: string) => {
  const location = useLocation();
  const { projectCode, entityCode: entityCodeParam } = useParams();
  const { data: project } = useProject(projectCode);
  const dashboardCode = project ? project.dashboardGroupName : '';

  // If entityCode is not provided, use the one from the URL
  const newEntityCode = entityCode || entityCodeParam;

  return { ...location, pathname: `/${projectCode}/${newEntityCode}/${dashboardCode}` };
};
