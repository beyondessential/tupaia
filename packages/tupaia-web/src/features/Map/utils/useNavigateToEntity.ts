/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { useParams } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProject } from '../../../api/queries';
import { EntityCode } from '../../../types';

export const useNavigateToEntity = () => {
  const { projectCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { data: project } = useProject(projectCode);

  const dashboardNameParam = project?.dashboardGroupName
    ? encodeURIComponent(project.dashboardGroupName)
    : '';

  return (entityCode?: EntityCode) => {
    const link = {
      ...location,
      pathname: `/${projectCode}/${entityCode}/${dashboardNameParam}`,
    };
    navigate(link);
  };
};
