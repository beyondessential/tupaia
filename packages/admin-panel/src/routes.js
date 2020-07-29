/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import {
  Assignment,
  AssignmentInd,
  InsertChart,
  Map,
  QuestionAnswer,
  PeopleAlt,
  Person,
  VerifiedUser,
  Flag,
  SupervisedUserCircle,
  Storage,
  Public,
} from '@material-ui/icons';
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
  DashboardGroupsPage,
  DataElementsPage,
  DataGroupsPage,
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
        icon: <Assignment />,
        component: SurveysPage,
      },
      {
        label: 'Questions',
        to: '/questions',
        icon: <Assignment />,
        component: QuestionsPage,
      },
      {
        label: 'Option Sets',
        to: '/option-sets',
        icon: <Assignment />,
        component: OptionSetsPage,
      },
      {
        label: 'Data Elements',
        to: '/data-elements',
        icon: <Assignment />,
        component: DataElementsPage,
      },
      {
        label: 'Data Groups',
        to: '/data-groups',
        icon: <Assignment />,
        component: DataGroupsPage,
      },
      {
        label: 'Survey Responses',
        to: '/survey-responses',
        icon: <Assignment />,
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
        icon: <InsertChart />,
        component: DashboardReportsPage,
      },
      {
        label: 'Dashboard Groups',
        to: '/dashboard-groups',
        icon: <InsertChart />,
        component: DashboardGroupsPage,
      },
      {
        label: 'Map Overlays',
        to: '/map-overlays',
        icon: <Map />,
        component: MapOverlaysPage,
      },
      {
        label: 'Social Feed',
        to: '/social-feed',
        icon: <QuestionAnswer />,
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
        icon: <Person />,
        component: UsersPage,
      },
      {
        label: 'Permissions',
        to: '/permissions',
        icon: <VerifiedUser />,
        component: PermissionsPage,
      },
      {
        label: 'Permission Groups',
        to: '/permission-groups',
        icon: <SupervisedUserCircle />,
        component: PermissionGroupsPage,
      },
      {
        label: 'Access Requests',
        to: '/access-requests',
        icon: <AssignmentInd />,
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
        icon: <Storage />,
        component: EntitiesPage,
      },
      {
        label: 'Countries',
        to: '/countries',
        icon: <Public />,
        component: CountriesPage,
      },
    ],
  },
  {
    label: 'Projects',
    to: '/strive',
    icon: <Flag />,
    tabs: [
      {
        label: 'Strive',
        to: '',
        icon: <Flag />,
        component: StrivePage,
      },
      {
        label: 'Disaster',
        to: '/disaster',
        icon: <Flag />,
        component: DisasterResponsePage,
      },
    ],
  },
];
