import React from 'react';
import { projects } from './projects';
import { strive } from './strive';
import { landingPages } from './landingPages';
import { ProjectsIcon } from '../../icons';
import { ALL_PROJECTS_SCOPE, SINGLE_PROJECT_SCOPE } from '../scopes';

export const projectsTabRoutes = {
  label: 'Projects',
  // In the single-project section this tab only shows the selected project, so
  // it reads as singular there. The all-data section keeps the plural label.
  singleProjectLabel: 'Project',
  path: '/projects',
  icon: <ProjectsIcon />,
  childViews: [
    { ...projects, scope: SINGLE_PROJECT_SCOPE },
    { ...landingPages, scope: ALL_PROJECTS_SCOPE },
    { ...strive, scope: SINGLE_PROJECT_SCOPE },
  ],
};
