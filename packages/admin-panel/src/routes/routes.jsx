/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { entitiesTabRoutes } from './entities';
import { externalDataTabRoutes } from './externalData';
import { projectsTabRoutes } from './projects/projectsTabRoutes';
import { surveysTabRoutes } from './surveys';
import { usersTabRoutes } from './users';
import { visualisationsTabRoutes } from './visualisations';

export const ROUTES = [
  surveysTabRoutes,
  visualisationsTabRoutes,
  usersTabRoutes,
  entitiesTabRoutes,
  projectsTabRoutes,
  externalDataTabRoutes,
];
