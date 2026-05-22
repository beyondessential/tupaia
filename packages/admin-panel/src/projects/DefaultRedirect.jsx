import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { useProjects } from '../api/queries';
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
 * Picks where to land the user when they hit `/`. The selected project lives
 * in the URL, so on a cold load there's nothing to remember — pick the first
 * project for the single-project section, falling back to all-data, then
 * login.
 */
export const DefaultRedirect = ({ allDataRoutes, singleProjectRoutes }) => {
  const { data: projects, isLoading } = useProjects();
  if (isLoading) return null;

  const firstProjectCode = projects?.[0]?.code ?? null;

  const singleProjectTarget = buildSingleProjectTarget(singleProjectRoutes, firstProjectCode);
  if (singleProjectTarget) return <Navigate to={singleProjectTarget} replace />;

  const allDataTarget = buildAllDataTarget(allDataRoutes);
  if (allDataTarget) return <Navigate to={allDataTarget} replace />;

  return <Navigate to="/login" replace />;
};

DefaultRedirect.propTypes = {
  allDataRoutes: PropTypes.array.isRequired,
  singleProjectRoutes: PropTypes.array.isRequired,
};
