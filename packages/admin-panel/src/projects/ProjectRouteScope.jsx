import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Outlet, useParams } from 'react-router-dom';

import { useProjects } from '../api/queries';
import { setSelectedProject } from './actions';
import { selectSelectedProject } from './selectors';

/**
 * Renders the single-project section's outlet and keeps redux's selectedProject
 * in sync with the `:projectCode` URL segment so the URL is the source of
 * truth (browser back/forward, deep links, etc. all work).
 */
const ProjectRouteScopeComponent = ({ selectedProject, onSelectProject }) => {
  const { projectCode } = useParams();
  const { data: projects } = useProjects();

  useEffect(() => {
    if (!projectCode || !projects) return;
    if (selectedProject?.code === projectCode) return;
    const project = projects.find(p => p.code === projectCode);
    if (project) {
      onSelectProject(project);
    }
  }, [projectCode, projects, selectedProject, onSelectProject]);

  return <Outlet />;
};

ProjectRouteScopeComponent.propTypes = {
  selectedProject: PropTypes.shape({
    id: PropTypes.string,
    code: PropTypes.string,
  }),
  onSelectProject: PropTypes.func.isRequired,
};

ProjectRouteScopeComponent.defaultProps = {
  selectedProject: null,
};

const mapStateToProps = state => ({
  selectedProject: selectSelectedProject(state),
});

const mapDispatchToProps = dispatch => ({
  onSelectProject: project => dispatch(setSelectedProject(project)),
});

export const ProjectRouteScope = connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProjectRouteScopeComponent);
