import React from 'react';
import { projects } from './projects';
import { strive } from './strive';
import { entityHierarchy } from './entityHierarchy';
import { landingPages } from './landingPages';
import { ProjectsIcon } from '../../icons';
import { ALL_PROJECTS_SCOPE, SINGLE_PROJECT_SCOPE } from '../scopes';

export const projectsTabRoutes = {
  label: 'Projects',
  path: '/projects',
  icon: <ProjectsIcon />,
  childViews: [
    { ...projects, scope: ALL_PROJECTS_SCOPE },
    { ...landingPages, scope: ALL_PROJECTS_SCOPE },
    // RN-1855: Strive views and Entity Hierarchy are slated for changes
    // in follow-up work; leaving them in their current scopes for now.
    { ...strive, scope: SINGLE_PROJECT_SCOPE },
    { ...entityHierarchy, scope: ALL_PROJECTS_SCOPE },
  ],
};
