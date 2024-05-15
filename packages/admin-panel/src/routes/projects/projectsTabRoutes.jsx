/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { projects } from './projects';
import { strive } from './strive';
import { entityHierarchy } from './entityHierarchy';
import { landingPages } from './landingPages';
import { ProjectsIcon } from '../../icons';

export const projectsTabRoutes = {
  label: 'Projects',
  path: '/projects',
  icon: <ProjectsIcon />,
  childViews: [projects, strive, entityHierarchy, landingPages],
};
