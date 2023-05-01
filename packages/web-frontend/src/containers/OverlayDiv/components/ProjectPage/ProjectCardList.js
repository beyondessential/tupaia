/*
 * Tupaia
 *  Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { ProjectCard } from './ProjectCard';

const EXPLORE_CODE = 'explore';

export const ProjectCardList = ({ projects, accessType, action, actionText }) => {
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
