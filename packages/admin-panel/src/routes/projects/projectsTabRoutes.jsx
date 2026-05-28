import React from 'react';
import { projects } from './projects';
import { strive } from './strive';
import { landingPages } from './landingPages';
import { ProjectsIcon } from '../../icons';
import { ALL_PROJECTS_SCOPE, SINGLE_PROJECT_SCOPE } from '../scopes';

export const projectsTabRoutes = {
  label: 'Projects',
  path: '/projects',
  icon: <ProjectsIcon />,
  childViews: [
    { ...projects, scope: SINGLE_PROJECT_SCOPE },
    { ...landingPages, scope: ALL_PROJECTS_SCOPE },
    { ...strive, scope: SINGLE_PROJECT_SCOPE },
  ],
};
