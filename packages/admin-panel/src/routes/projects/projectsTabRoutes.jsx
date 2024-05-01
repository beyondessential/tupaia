/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Flag } from '@material-ui/icons';
import { projects } from './projects';
import { strive } from './strive';
import { entityHierarchy } from './entityHierarchy';
import { landingPages } from './landingPages';

export const projectsTabRoutes = {
  label: 'Projects',
  url: '/projects',
  icon: <Flag />,
  childViews: [projects, strive, entityHierarchy, landingPages],
};
