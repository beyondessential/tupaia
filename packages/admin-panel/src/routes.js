/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Assignment, InsertChart, PeopleAlt, Flag, Storage } from '@material-ui/icons';
import { StrivePage } from './pages/StrivePage';
import {
  CountriesPage,
  EntitiesPage,
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
  DashboardReportsPage,
  MapOverlaysPage,
  IndicatorsPage,
  DashboardGroupsPage,
  DashboardsPage,
  DashboardItemsPage,
  DashboardRelationsPage,
  LegacyReportsPage,
  DataElementsPage,
  DataGroupsPage,
  ProjectsPage,
} from './pages/resources';

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
    ],
  },
  {
    label: 'Visualisations',
    to: '/dashboard-reports',
    icon: <InsertChart />,
    tabs: [
      {
        label: 'Dashboard Reports',
        to: '',
        component: DashboardReportsPage,
      },
      {
        label: 'Dashboard Groups',
        to: '/dashboard-groups',
        component: DashboardGroupsPage,
      },
      {
        label: 'Dashboards',
        to: '/dashboards',
        component: DashboardsPage,
      },
      {
        label: 'Dashboard Items',
        to: '/dashboardItems',
        component: DashboardItemsPage,
      },
      {
        label: 'Dashboard Relations',
        to: '/dashboardRelations',
        component: DashboardRelationsPage,
      },
      {
        label: 'Legacy Reports',
        to: '/legacyReports',
        component: LegacyReportsPage,
      },
      {
        label: 'Map Overlays',
        to: '/map-overlays',
        component: MapOverlaysPage,
      },
      {
        label: 'Indicators',
        to: '/indicators',
        component: IndicatorsPage,
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
];
