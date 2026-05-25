import React from 'react';
import { Navigate } from 'react-router-dom';
import { useProjects, useUser } from '../api/queries';
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
 * Picks where to land the user when they hit `/`. Prefer the user's saved
 * project (user_account.preferences.project_id) if it's still in the
 * accessible project list; otherwise fall back to the first project (useProjects
 * sorts alphabetically by name). Final fallbacks are the all-data section,
 * then the login page.
 */
export const DefaultRedirect = ({ allDataRoutes, singleProjectRoutes }) => {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: user, isLoading: userLoading } = useUser();

  if (projectsLoading || userLoading) return null;

  const preferredProjectId = user?.preferences?.project_id ?? null;
  const preferred = preferredProjectId ? projects?.find(p => p.id === preferredProjectId) : null;
  const projectCode = preferred?.code ?? projects?.[0]?.code ?? null;

  const singleProjectTarget = buildSingleProjectTarget(singleProjectRoutes, projectCode);
  if (singleProjectTarget) return <Navigate to={singleProjectTarget} replace />;

  const allDataTarget = buildAllDataTarget(allDataRoutes);
  if (allDataTarget) return <Navigate to={allDataTarget} replace />;

  return <Navigate to="/login" replace />;
};
