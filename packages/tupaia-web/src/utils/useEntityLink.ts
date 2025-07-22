import { useMemo } from 'react';
import { Path, useLocation, useParams } from 'react-router-dom';
import { useProject } from '../api/queries';

/**
 * @returns `undefined` if and only if the eventual return value is pending.
 */
export const useEntityLink = (entityCode?: string): Partial<Path> | undefined => {
  const { hash, search } = useLocation();
  const { projectCode, entityCode: entityCodeParam } = useParams();
  const { data: project } = useProject(projectCode);

  // If entityCode is not provided, use the one from the URL
  const newEntityCode = entityCode || entityCodeParam;
  const dashboardGroupName = project?.dashboardGroupName
    ? encodeURIComponent(project.dashboardGroupName)
    : '';

  return useMemo(() => {
    if (!projectCode || !newEntityCode || !dashboardGroupName) return undefined;
    return {
      hash,
      pathname: `/${projectCode}/${newEntityCode}/${dashboardGroupName}`,
      search,
    };
  }, [dashboardGroupName, hash, newEntityCode, projectCode, search]);
};
