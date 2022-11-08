/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Assignment, InsertChart, PeopleAlt, Flag, Storage, Language } from '@material-ui/icons';
import { StrivePage } from './pages/StrivePage';
import {
  CountriesPage,
  EntitiesPage,
  EntityTypesPage,
  OptionSetsPage,
  PermissionGroupsPage,
  PermissionsPage,
  SocialFeedPage,
  SurveyResponsesPage,
  SurveysPage,
  QuestionsPage,
  UsersPage,
  DisasterResponsePage,
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
} from './pages/resources';
import { DataElementDataServicesPage } from './pages/resources/DataElementDataServicesPage';

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
        label: 'Option Sets',
        to: '/option-sets',
        component: OptionSetsPage,
      },
      {
        label: 'Data Elements',
        to: '/data-elements',
        component: DataElementsPage,
      },
      {
        label: 'Data Groups',
        to: '/data-groups',
        component: DataGroupsPage,
      },
      {
        label: 'Survey Responses',
        to: '/survey-responses',
        component: SurveyResponsesPage,
      },
      {
        label: 'Sync Groups',
        to: '/sync-groups',
        component: SyncGroupsPage,
      },
      {
        label: 'Data Mapping',
        to: '/data-mapping',
        component: DataElementDataServicesPage,
      },
    ],
  },
  {
    label: 'Visualisations',
    to: '/dashboard-items',
    icon: <InsertChart />,
    tabs: [
      {
        label: 'Dashboard Items',
        to: '',
        component: DashboardItemsPage,
      },
      {
        label: 'Dashboards',
        to: '/dashboards',
        component: DashboardsPage,
      },
      {
        label: 'Dashboard Relations',
        to: '/dashboard-relations',
        component: DashboardRelationsPage,
      },
      {
        label: 'Legacy Reports',
        to: '/legacy-reports',
        component: LegacyReportsPage,
      },
      {
        label: 'Map Overlays',
        to: '/map-overlays',
        component: MapOverlaysPage,
      },
      {
        label: 'Map Overlay Groups',
        to: '/map-overlay-groups',
        component: MapOverlayGroupsPage,
      },
      {
        label: 'Map Overlay Group Relations',
        to: '/map-overlay-group-relations',
        component: MapOverlayGroupRelationsPage,
      },
      {
        label: 'Indicators',
        to: '/indicators',
        component: IndicatorsPage,
      },
      {
        label: 'Data-Tables',
        to: '/dataTables',
        component: DataTablesPage,
      },
      {
        label: 'Social Feed',
        to: '/social-feed',
        component: SocialFeedPage,
      },
    ],
  },
  {
    label: 'Users & Permissions',
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
        label: 'Permission Groups',
        to: '/permission-groups',
        component: PermissionGroupsPage,
      },
      {
        label: 'Access Requests',
        to: '/access-requests',
        component: AccessRequestsPage,
      },
    ],
  },
  {
    label: 'Entities',
    to: '/entities',
    icon: <Storage />,
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
        label: 'Entity Types',
        to: '/entityTypes',
        component: EntityTypesPage,
      },
    ],
  },
  {
    label: 'Projects',
    to: '/projects',
    icon: <Flag />,
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
        label: 'Disaster',
        to: '/disaster',
        component: DisasterResponsePage,
      },
    ],
  },
  {
    label: 'External Data',
    to: '/external-database-connections',
    icon: <Language />,
    tabs: [
      {
        label: 'External Database Connections',
        to: '',
        component: ExternalDatabaseConnectionsPage,
      },
    ],
  },
];
