/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { entitiesTabRoutes } from './entities';
import { surveysTabRoutes } from './surveys';
import { usersTabRoutes } from './users';
import { visualisationsTabRoutes } from './visualisations';

export const ROUTES = [
  surveysTabRoutes,
  visualisationsTabRoutes,
  usersTabRoutes,
  entitiesTabRoutes,
  // {
  //   label: 'Entities',
  //   to: '/entities',
  //   icon: <Storage />,
  //   childViews: [
  //     {
  //       label: 'Entities',
  //       to: '',
  //       component: EntitiesPage,
  //     },
  //     {
  //       label: 'Countries',
  //       to: '/countries',
  //       component: CountriesPage,
  //     },
  //     {
  //       label: 'Entity Types',
  //       to: '/entityTypes',
  //       component: EntityTypesPage,
  //     },
  //     {
  //       label: 'Entity Hierarchies',
  //       to: '/entityHierarchies',
  //       component: EntityHierarchiesPage,
  //     },
  //   ],
  // },
  // {
  //   label: 'Projects',
  //   to: '/projects',
  //   icon: <Flag />,
  //   childViews: [
  //     {
  //       label: 'Projects',
  //       to: '',
  //       component: ProjectsPage,
  //     },
  //     {
  //       label: 'Strive',
  //       to: '/strive',
  //       component: StrivePage,
  //     },
  //     {
  //       label: 'Entity Hierarchy',
  //       to: '/hierarchy',
  //       component: EntityHierarchyPage,
  //     },
  //     {
  //       label: 'Landing Pages',
  //       to: '/landing-pages',
  //       component: CustomLandingPagesPage,
  //     },
  //   ],
  // },
  // {
  //   label: 'External Data',
  //   to: '/external-database-connections',
  //   icon: <Language />,
  //   childViews: [
  //     {
  //       label: 'External Database Connections',
  //       to: '',
  //       component: ExternalDatabaseConnectionsPage,
  //     },
  //     {
  //       label: 'DHIS Instances',
  //       to: '/dhis-instances',
  //       component: DhisInstancesPage,
  //     },
  //     {
  //       label: 'mSupply Superset Instances',
  //       to: '/superset-instances',
  //       component: SupersetInstancesPage,
  //     },
  //   ],
  // },
];
