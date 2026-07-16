import React from 'react';
import { Navigate } from 'react-router-dom';
import { useProjects, useUser } from '../api/queries';
import { useSidebarProjectCode } from './useSelectedProject';
import { buildSingleProjectBasePath } from '../routes/scopes';

const buildAllDataTarget = allDataRoutes => {
  if (allDataRoutes.length === 0) return null;
  const fallback = allDataRoutes[0];
  const firstChild = fallback.childViews[0];
  return `${fallback.path}${firstChild?.path ?? ''}`;
};

const buildSingleProjectTarget = (singleProjectRoutes, projectCode) => {
  if (!projectCode || singleProjectRoutes.length === 0) return null;
  const fallback = singleProjectRoutes[0];
  const firstChild = fallback.childViews[0];
  return `${buildSingleProjectBasePath(projectCode)}${fallback.path}${firstChild?.path ?? ''}`;
};

/**
 * Picks where to land the user when they hit `/`. Reuses useSidebarProjectCode
 * so the preferred → first-alphabetical fallback chain stays in one place
 * (the URL check inside it is a no-op on `/`). Final fallbacks if no projects
 * are available are the all-data section, then the login page.
 */
export const DefaultRedirect = ({ allDataRoutes, singleProjectRoutes }) => {
  const { isLoading: projectsLoading } = useProjects();
  const { isLoading: userLoading } = useUser();
  const projectCode = useSidebarProjectCode();

  if (projectsLoading || userLoading) return null;

  const singleProjectTarget = buildSingleProjectTarget(singleProjectRoutes, projectCode);
  if (singleProjectTarget) return <Navigate to={singleProjectTarget} replace />;

  const allDataTarget = buildAllDataTarget(allDataRoutes);
  if (allDataTarget) return <Navigate to={allDataTarget} replace />;

  return <Navigate to="/login" replace />;
};
