import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

import { buildSingleProjectBasePath } from '../routes/scopes';
import { selectSelectedProjectCode } from './selectors';

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
 * Picks where to land the user when they hit `/`. Single project is the top
 * section in the sidebar, so prefer it if a project is selected; otherwise
 * fall back to all-data, then login. Renders nothing while waiting for the
 * project list to populate the selector.
 */
const DefaultRedirectComponent = ({ allDataRoutes, singleProjectRoutes, projectCode }) => {
  const singleProjectTarget = buildSingleProjectTarget(singleProjectRoutes, projectCode);
  if (singleProjectTarget) return <Navigate to={singleProjectTarget} replace />;

  // Single-project section exists but no project picked yet — wait for the
  // selector to default-pick rather than dumping the user into all-data.
  if (singleProjectRoutes.length > 0 && !projectCode) return null;

  const allDataTarget = buildAllDataTarget(allDataRoutes);
  if (allDataTarget) return <Navigate to={allDataTarget} replace />;

  return <Navigate to="/login" replace />;
};

DefaultRedirectComponent.propTypes = {
  allDataRoutes: PropTypes.array.isRequired,
  singleProjectRoutes: PropTypes.array.isRequired,
  projectCode: PropTypes.string,
};

DefaultRedirectComponent.defaultProps = {
  projectCode: null,
};

const mapStateToProps = state => ({
  projectCode: selectSelectedProjectCode(state),
});

export const DefaultRedirect = connect(mapStateToProps)(DefaultRedirectComponent);
