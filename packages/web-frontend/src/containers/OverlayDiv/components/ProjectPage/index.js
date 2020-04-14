/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';

import { REQUEST_PROJECT_ACCESS } from '../../index';
import { selectProject, setRequestingAccess } from '../../../../projects/actions';
import { setOverlayComponent, changeOrgUnit } from '../../../../actions';
import { ProjectCard } from './ProjectCard';

// code for general explore mode project.
const EXPLORE_CODE = 'explore';

const Container = styled.div`
  margin: 24px 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const renderProjectsWithFilter = (projects, accessType, action, actionText) =>
  projects
    .filter(({ code, hasAccess }) => code !== EXPLORE_CODE && hasAccess === accessType)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(project => (
      <ProjectCard
        key={project.name}
        projectAction={() => action(project)}
        actionText={actionText}
        accessType={accessType}
        {...project}
      />
    ));

const ProjectPageComponent = ({ onSelectProject, onRequestProjectAccess, projects }) => {
  const projectsWithAccess = renderProjectsWithFilter(
    projects,
    true,
    onSelectProject,
    'View project',
  );

  const projectsWithoutAccess = renderProjectsWithFilter(
    projects,
    false,
    onRequestProjectAccess,
    'Request access',
  );

  return (
    <Container>
      {projectsWithAccess}
      {projectsWithoutAccess}
    </Container>
  );
};

ProjectPageComponent.propTypes = {
  onSelectProject: PropTypes.func.isRequired,
  onRequestProjectAccess: PropTypes.func.isRequired,
  projects: PropTypes.arrayOf(PropTypes.shape({})),
};

ProjectPageComponent.defaultProps = {
  projects: [],
};

const mapStateToProps = state => {
  const { projects } = state.project;

  return {
    projects,
  };
};

const mapDispatchToProps = dispatch => ({
  onSelectProject: project => {
    dispatch(selectProject(project));
    dispatch(setOverlayComponent(null));
    dispatch(changeOrgUnit(project.homeEntityCode, false));
  },
  onRequestProjectAccess: project => {
    dispatch(setRequestingAccess(project));
    dispatch(setOverlayComponent(REQUEST_PROJECT_ACCESS));
  },
});

export const ProjectPage = connect(mapStateToProps, mapDispatchToProps)(ProjectPageComponent);
