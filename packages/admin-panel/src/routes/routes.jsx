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

export const AUTH_ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
};
