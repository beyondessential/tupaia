/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from '@material-ui/core';
import Lock from '@material-ui/icons/Lock';
import Alarm from '@material-ui/icons/Alarm';
import { ProjectCard } from './ProjectCard';
import { PROJECT_ACCESS_TYPES } from '../../../../constants';
import { FORM_BLUE, LIGHT_BLUE } from '../../../../styles';
import { getProjectAccessType } from '../../../../utils';

const EXPLORE_CODE = 'explore';
const LockIcon = styled(Lock)`
  margin-right: 5px;
`;

const AlarmIcon = styled(Alarm)`
  margin-right: 5px;
`;

const StyledPendingButton = styled(Button)`
  background: ${LIGHT_BLUE};
  color: ${FORM_BLUE};
  padding: 5px;
`;
// eslint-disable-next-line react/prop-types
const ProjectDeniedButton = ({ action, isUserLoggedIn }) => (
  <Button onClick={action} color="primary" variant="outlined">
    <LockIcon />
    {isUserLoggedIn ? 'Request access' : 'Log in'}
  </Button>
);

// eslint-disable-next-line react/prop-types
const ProjectPendingButton = ({ action }) => (
  <StyledPendingButton onClick={action} variant="contained">
    <AlarmIcon />
    Approval in progress
  </StyledPendingButton>
);
// eslint-disable-next-line react/prop-types
const ProjectAllowedButton = ({ action }) => (
  <Button onClick={action} variant="contained" color="primary">
    View project
  </Button>
);

export const ProjectCardList = ({ projects, actions, isUserLoggedIn }) => {
  const ProjectButtons = {
    [PROJECT_ACCESS_TYPES.PENDING]: ProjectPendingButton,
    [PROJECT_ACCESS_TYPES.ALLOWED]: ProjectAllowedButton,
    [PROJECT_ACCESS_TYPES.DENIED]: ProjectDeniedButton,
  };
  const sortedProjects = Object.keys(PROJECT_ACCESS_TYPES).reduce((result, accessType) => {
    const action = actions[PROJECT_ACCESS_TYPES[accessType]];
    // If there is no action passed in for this access type, then the project card is useless, so ignore it so that nothing breaks
    if (!action) return result;
    const accessTypeProjects = projects.filter(({ code, hasAccess, hasPendingAccess = false }) => {
      const projectAccessType = getProjectAccessType({ hasPendingAccess, hasAccess });
      return code !== EXPLORE_CODE && projectAccessType === accessType;
    });
    return [
      ...result,
      ...accessTypeProjects
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(project => ({
          ...project,
          ProjectButton: ProjectButtons[accessType],
          action: actions[accessType],
        })),
    ];
  }, []);
  return sortedProjects.map(project => {
    const { name, description, logoUrl, imageUrl, ProjectButton, names, action } = project;
    return (
      <ProjectCard
        key={name}
        name={name}
        description={description}
        imageUrl={imageUrl}
        logoUrl={logoUrl}
        projectButton={
          <ProjectButton action={() => action(project)} isUserLoggedIn={isUserLoggedIn} />
        }
        names={names}
      />
    );
  });
};

ProjectCardList.propTypes = {
  actions: PropTypes.shape({
    [PROJECT_ACCESS_TYPES.ALLOWED]: PropTypes.func.isRequired,
    [PROJECT_ACCESS_TYPES.DENIED]: PropTypes.func.isRequired,
    [PROJECT_ACCESS_TYPES.PENDING]: PropTypes.func.isRequired,
  }),
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      imageUrl: PropTypes.string.isRequired,
      logoUrl: PropTypes.string,
      names: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ).isRequired,
  isUserLoggedIn: PropTypes.bool.isRequired,
};
