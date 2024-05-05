/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Assignment, PeopleAlt, Language } from '@material-ui/icons';
import { StrivePage } from './pages/StrivePage';
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
} from './pages/resources';
import { EntitiesIcon, ProjectsIcon, VizIcon } from './icons';

export const ROUTES = [
  {
    label: 'Surveys',
    to: '/surveys',
    icon: <Assignment />,
    tabs: [
      {
        label: 'Surveys',
        to: '',
        component: SurveysPage,
      },
      {
        label: 'Questions',
        to: '/questions',
        component: QuestionsPage,
        isBESAdminOnly: true,
      },
      {
        label: 'Option sets',
        to: '/option-sets',
        component: OptionSetsPage,
      },
      {
        label: 'Data elements',
        to: '/data-elements',
        component: DataElementsPage,
      },
      {
        label: 'Data groups',
        to: '/data-groups',
        component: DataGroupsPage,
        isBESAdminOnly: true,
      },
      {
        label: 'Survey responses',
        to: '/survey-responses',
        component: SurveyResponsesPage,
      },
      {
        label: 'Sync groups',
        to: '/sync-groups',
        component: SyncGroupsPage,
        isBESAdminOnly: true,
      },
      {
        label: 'Data mapping',
        to: '/data-mapping',
        component: DataElementDataServicesPage,
        isBESAdminOnly: true,
      },
    ],
  },
  {
    label: 'Visualisations',
    to: '/visualisations',
    icon: <VizIcon />,
    tabs: [
      {
        label: 'Dashboard items',
        to: '',
        component: DashboardItemsPage,
        needsBESAdminAccess: ['delete'],
      },
      {
        label: 'Dashboards',
        to: '/dashboards',
        component: DashboardsPage,
        needsBESAdminAccess: ['delete'],
      },
      {
        label: 'Dashboard relations',
        to: '/dashboard-relations',
        component: DashboardRelationsPage,
      },
      {
        label: 'Dashboard mailing lists',
        to: '/dashboard-mailing-lists',
        component: DashboardMailingListsPage,
        isBESAdminOnly: true,
      },
      {
        label: 'Legacy reports',
        to: '/legacy-reports',
        component: LegacyReportsPage,
        isBESAdminOnly: true,
      },
      {
        label: 'Map overlays',
        to: '/map-overlays',
        component: MapOverlaysPage,
        needsBESAdminAccess: ['delete'],
      },
      {
        label: 'Map overlay groups',
        to: '/map-overlay-groups',
        component: MapOverlayGroupsPage,
      },
      {
        label: 'Map overlay group relations',
        to: '/map-overlay-group-relations',
        component: MapOverlayGroupRelationsPage,
      },
      {
        label: 'Indicators',
        to: '/indicators',
        component: IndicatorsPage,
        isBESAdminOnly: true,
      },
      {
        label: 'Data-tables',
        to: '/dataTables',
        component: DataTablesPage,
        isBESAdminOnly: true,
      },
      {
        label: 'Social feed',
        to: '/social-feed',
        component: SocialFeedPage,
        isBESAdminOnly: true,
      },
    ],
  },
  {
    label: 'Users & permissions',
    to: '/users',
    icon: <PeopleAlt />,
    tabs: [
      {
        label: 'Users',
        to: '',
        component: UsersPage,
      },
      {
        label: 'Permissions',
        to: '/permissions',
        component: PermissionsPage,
      },
      {
        label: 'Permission groups',
        to: '/permission-groups',
        component: PermissionGroupsPage,
      },
      {
        label: 'Permission groups viewer',
        to: '/permission-groups-viewer',
        component: PermissionGroupsViewerPage,
      },
      {
        label: 'Access requests',
        to: '/access-requests',
        component: AccessRequestsPage,
      },
    ],
  },
  {
    label: 'Entities',
    to: '/entities',
    icon: <EntitiesIcon />,
    tabs: [
      {
        label: 'Entities',
        to: '',
        component: EntitiesPage,
        needsBESAdminAccess: ['delete'],
      },
      {
        label: 'Countries',
        to: '/countries',
        component: CountriesPage,
        needsBESAdminAccess: ['create'],
      },
      {
        label: 'Entity types',
        to: '/entityTypes',
        component: EntityTypesPage,
      },
      {
        label: 'Entity hierarchies',
        to: '/entityHierarchies',
        component: EntityHierarchiesPage,
      },
    ],
  },
  {
    label: 'Projects',
    to: '/projects',
    icon: <ProjectsIcon />,
    tabs: [
      {
        label: 'Projects',
        to: '',
        component: ProjectsPage,
        needsBESAdminAccess: ['create'],
      },
      {
        label: 'Strive',
        to: '/strive',
        component: StrivePage,
        isBESAdminOnly: true,
      },
      {
        label: 'Entity hierarchy',
        to: '/hierarchy',
        component: EntityHierarchyPage,
      },
      {
        label: 'Landing pages',
        to: '/landing-pages',
        component: CustomLandingPagesPage,
      },
    ],
  },
  {
    label: 'External data',
    to: '/external-database-connections',
    isBESAdminOnly: true,
    icon: <Language />,
    tabs: [
      {
        label: 'External database connections',
        to: '',
        component: ExternalDatabaseConnectionsPage,
      },
      {
        label: 'DHIS instances',
        to: '/dhis-instances',
        component: DhisInstancesPage,
      },
      {
        label: 'mSupply superset instances',
        to: '/superset-instances',
        component: SupersetInstancesPage,
      },
    ],
  },
];
