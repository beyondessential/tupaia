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
      },
      {
        label: 'Data mapping',
        to: '/data-mapping',
        component: DataElementDataServicesPage,
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
      },
      {
        label: 'Dashboards',
        to: '/dashboards',
        component: DashboardsPage,
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
      },
      {
        label: 'Legacy reports',
        to: '/legacy-reports',
        component: LegacyReportsPage,
      },
      {
        label: 'Map overlays',
        to: '/map-overlays',
        component: MapOverlaysPage,
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
      },
      {
        label: 'Data-tables',
        to: '/dataTables',
        component: DataTablesPage,
      },
      {
        label: 'Social feed',
        to: '/social-feed',
        component: SocialFeedPage,
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
      },
      {
        label: 'Countries',
        to: '/countries',
        component: CountriesPage,
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
      },
      {
        label: 'Strive',
        to: '/strive',
        component: StrivePage,
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
