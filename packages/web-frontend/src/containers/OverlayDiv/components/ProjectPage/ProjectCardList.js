/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ProjectCard } from './ProjectCard';
import {
  ALLOWED_PROJECT_ACCESS_TYPE,
  DENIED_PROJECT_ACCESS_TYPE,
  PENDING_PROJECT_ACCESS_TYPE,
} from '../../../../constants';

const EXPLORE_CODE = 'explore';

export const ProjectCardList = ({ projects, actions, isUserLoggedIn }) => {
  const actionText = {
    [PENDING_PROJECT_ACCESS_TYPE]: 'Approval in progress',
    [ALLOWED_PROJECT_ACCESS_TYPE]: 'View project',
    [DENIED_PROJECT_ACCESS_TYPE]: isUserLoggedIn ? 'Request access' : 'Log in',
  };
  const sortedProjects = [
    ALLOWED_PROJECT_ACCESS_TYPE,
    PENDING_PROJECT_ACCESS_TYPE,
    DENIED_PROJECT_ACCESS_TYPE,
  ].reduce((result, accessType) => {
    const action = actions[accessType];
    const accessTypeProjects = projects.filter(({ code, hasAccess, hasPendingAccess = false }) => {
      let projectAccessType = DENIED_PROJECT_ACCESS_TYPE;
      if (hasAccess) projectAccessType = ALLOWED_PROJECT_ACCESS_TYPE;
      if (hasPendingAccess) projectAccessType = PENDING_PROJECT_ACCESS_TYPE;
      return code !== EXPLORE_CODE && projectAccessType === accessType;
    });
    return [
      ...result,
      ...accessTypeProjects
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(project => ({
          ...project,
          action,
          actionText: actionText[accessType],
          accessType,
        })),
    ];
  }, []);
  return sortedProjects.map(project => (
    <ProjectCard
      key={project.name}
      projectAction={() => project.action(project)}
      actionText={project.actionText}
      accessType={project.accessType}
      {...project}
    />
  ));
};
