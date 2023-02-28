/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import ExploreIcon from '@material-ui/icons/ExploreOutlined';

import {
  REQUEST_PROJECT_ACCESS,
  PROJECT_LANDING,
  PROJECTS_WITH_LANDING_PAGES,
} from '../../constants';
import { setProject, setRequestingAccess } from '../../../../projects/actions';
import { setOverlayComponent } from '../../../../actions';
import { ProjectCard } from './ProjectCard';

// code for general explore mode project.
const EXPLORE_CODE = 'explore';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin: 24px 0;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ExploreButton = styled(Button)`
  margin-bottom: 16px;
  width: 250px;
  height: 50px;
  border-radius: 3px;
  font-size: 13px;

  svg {
    margin-right: 10px;
  }
`;

const renderProjectsWithFilter = (projects, accessType, action, actionText) => {
  const hasPendingType = accessType === 'pending';
  const hasAccessType = hasPendingType ? false : accessType;
  return projects
    .filter(
      ({ code, hasAccess, hasPendingAccess = false }) =>
        code !== EXPLORE_CODE && hasAccess === hasAccessType && hasPendingAccess === hasPendingType,
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(project => (
      <ProjectCard
        key={project.name}
        projectAction={() => action(project)}
        actionText={actionText}
        accessType={hasAccessType}
        hasAccessPending={hasPendingType}
        {...project}
      />
    ));
};

const ProjectPageComponent = ({
  onSelectProject,
  onRequestProjectAccess,
  openLoginDialog,
  isUserLoggedIn,
  projects,
}) => {
  const exploreProject = projects.find(p => p.code === EXPLORE_CODE);
  const selectExploreProject = React.useCallback(
    () => onSelectProject(exploreProject),
    [onSelectProject, exploreProject],
  );

  const projectsWithAccess = renderProjectsWithFilter(
    projects,
    true,
    onSelectProject,
    'View project',
  );

  const projectsPendingAccess = renderProjectsWithFilter(
    projects,
    'pending',
    onRequestProjectAccess,
    'Approval in progress',
  );

  const noAccessAction = isUserLoggedIn ? onRequestProjectAccess : openLoginDialog;
  const noAccessText = isUserLoggedIn ? 'Request access' : 'Log in';
  const projectsWithoutAccess = renderProjectsWithFilter(
    projects,
    false,
    noAccessAction,
    noAccessText,
  );

  return (
    <div>
      <ExploreButton onClick={selectExploreProject} variant="outlined">
        <ExploreIcon /> I just want to explore
      </ExploreButton>
      <Container>
        {projectsWithAccess}
        {projectsPendingAccess}
        {projectsWithoutAccess}
      </Container>
    </div>
  );
};

ProjectPageComponent.propTypes = {
  onSelectProject: PropTypes.func.isRequired,
  openLoginDialog: PropTypes.func.isRequired,
  isUserLoggedIn: PropTypes.bool.isRequired,
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
    if (PROJECTS_WITH_LANDING_PAGES[project.code]) {
      dispatch(setOverlayComponent(PROJECT_LANDING));
      dispatch(setProject(project.code));
    } else {
      dispatch(setProject(project.code));
      dispatch(setOverlayComponent(null));
    }
  },
  onRequestProjectAccess: project => {
    dispatch(setRequestingAccess(project));
    dispatch(setOverlayComponent(REQUEST_PROJECT_ACCESS));
  },
});

export const ProjectPage = connect(mapStateToProps, mapDispatchToProps)(ProjectPageComponent);
