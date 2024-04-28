/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Assignment, InsertChart, PeopleAlt, Flag, Storage, Language } from '@material-ui/icons';
import { StrivePage } from '../pages/StrivePage';
import {
  CountriesPage,
  CustomLandingPagesPage,
  EntitiesPage,
  EntityHierarchiesPage,
  EntityTypesPage,
  OptionSetsPage,
  PermissionGroupsPage,
  PermissionGroupsViewerPage,
  PermissionsPage,
  SocialFeedPage,
  SurveyResponsesPage,
  SurveysPage,
  QuestionsPage,
  UsersPage,
  AccessRequestsPage,
  MapOverlaysPage,
  MapOverlayGroupsPage,
  MapOverlayGroupRelationsPage,
  IndicatorsPage,
  DashboardsPage,
  DashboardItemsPage,
  DashboardRelationsPage,
  LegacyReportsPage,
  DataElementsPage,
  DataGroupsPage,
  ProjectsPage,
  SyncGroupsPage,
  DataTablesPage,
  ExternalDatabaseConnectionsPage,
  EntityHierarchyPage,
  DataElementDataServicesPage,
  DhisInstancesPage,
  SupersetInstancesPage,
  DashboardMailingListsPage,
} from '../pages/resources';
import { surveysTabRoutes } from './surveys';

export const ROUTES = [
  surveysTabRoutes,
  // {
  //   label: 'Surveys',
  //   to: '/surveys',
  //   icon: <Assignment />,
  //   childViews: [
  //     {
  //       label: 'Surveys',
  //       to: '',
  //       component: SurveysPage,
  //       childViews: [
  //         {
  //           label: 'Survey Questions',
  //           to: '/:id',
  //           component: QuestionsPage,
  //           endpoint: 'surveys/{id}/surveyScreenComponents',
  //         },
  //       ],
  //     },
  //     {
  //       label: 'Questions',
  //       to: '/questions',
  //       component: QuestionsPage,
  //     },
  //     {
  //       label: 'Option Sets',
  //       to: '/option-sets',
  //       component: OptionSetsPage,
  //     },
  //     {
  //       label: 'Data Elements',
  //       to: '/data-elements',
  //       component: DataElementsPage,
  //     },
  //     {
  //       label: 'Data Groups',
  //       to: '/data-groups',
  //       component: DataGroupsPage,
  //     },
  //     {
  //       label: 'Survey Responses',
  //       to: '/survey-responses',
  //       component: SurveyResponsesPage,
  //     },
  //     {
  //       label: 'Sync Groups',
  //       to: '/sync-groups',
  //       component: SyncGroupsPage,
  //     },
  //     {
  //       label: 'Data Mapping',
  //       to: '/data-mapping',
  //       component: DataElementDataServicesPage,
  //     },
  //   ],
  // },
  // {
  //   label: 'Visualisations',
  //   to: '/visualisations',
  //   icon: <InsertChart />,
  //   childViews: [
  //     {
  //       label: 'Dashboard Items',
  //       to: '',
  //       component: DashboardItemsPage,
  //     },
  //     {
  //       label: 'Dashboards',
  //       to: '/dashboards',
  //       component: DashboardsPage,
  //     },
  //     {
  //       label: 'Dashboard Relations',
  //       to: '/dashboard-relations',
  //       component: DashboardRelationsPage,
  //     },
  //     {
  //       label: 'Dashboard Mailing Lists',
  //       to: '/dashboard-mailing-lists',
  //       component: DashboardMailingListsPage,
  //     },
  //     {
  //       label: 'Legacy Reports',
  //       to: '/legacy-reports',
  //       component: LegacyReportsPage,
  //     },
  //     {
  //       label: 'Map Overlays',
  //       to: '/map-overlays',
  //       component: MapOverlaysPage,
  //     },
  //     {
  //       label: 'Map Overlay Groups',
  //       to: '/map-overlay-groups',
  //       component: MapOverlayGroupsPage,
  //     },
  //     {
  //       label: 'Map Overlay Group Relations',
  //       to: '/map-overlay-group-relations',
  //       component: MapOverlayGroupRelationsPage,
  //     },
  //     {
  //       label: 'Indicators',
  //       to: '/indicators',
  //       component: IndicatorsPage,
  //     },
  //     {
  //       label: 'Data-Tables',
  //       to: '/dataTables',
  //       component: DataTablesPage,
  //     },
  //     {
  //       label: 'Social Feed',
  //       to: '/social-feed',
  //       component: SocialFeedPage,
  //     },
  //   ],
  // },
  // {
  //   label: 'Users & Permissions',
  //   to: '/users',
  //   icon: <PeopleAlt />,
  //   childViews: [
  //     {
  //       label: 'Users',
  //       to: '',
  //       component: UsersPage,
  //     },
  //     {
  //       label: 'Permissions',
  //       to: '/permissions',
  //       component: PermissionsPage,
  //     },
  //     {
  //       label: 'Permission Groups',
  //       to: '/permission-groups',
  //       component: PermissionGroupsPage,
  //     },
  //     {
  //       label: 'Permission Groups Viewer',
  //       to: '/permission-groups-viewer',
  //       component: PermissionGroupsViewerPage,
  //     },
  //     {
  //       label: 'Access Requests',
  //       to: '/access-requests',
  //       component: AccessRequestsPage,
  //     },
  //   ],
  // },
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
