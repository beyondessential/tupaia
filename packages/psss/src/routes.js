/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { CountryWeeklyReportsLayout } from './layouts/CountryWeeklyReportsLayout';
import { WeeklyReportsLayout } from './layouts/WeeklyReportsLayout';
import { AlertsLayout } from './layouts/AlertsLayout';
import { TableLayout } from './layouts/TableLayout';

export const ROUTES = [
  {
    path: '/',
    exact: true,
    component: WeeklyReportsLayout,
    metadata: {
      title: 'Countries',
      resource: 'base-url/resources/home-page',
    },
  },
  {
    path: '/weekly-reports/:countryId',
    component: CountryWeeklyReportsLayout,
    metadata: {
      title: 'Country',
    },
    routes: [
      {
        path: '/weekly-reports/:countryId',
        exact: true,
        fallback: true,
        component: TableLayout,
        metadata: {
          resource: 'base-url/resources/country',
        },
      },
      {
        path: '/weekly-reports/:countryId/event-based',
        component: TableLayout,
        metadata: {
          resource: 'base-url/resources/event-based',
        },
      },
    ],
  },
  {
    path: '/alerts',
    component: AlertsLayout,
    metadata: {
      title: 'Alerts',
    },
    routes: [
      {
        path: '/alerts',
        exact: true,
        component: TableLayout,
        metadata: {
          resource: 'base-url/resources/alerts',
        },
      },
      {
        path: '/alerts/outbreaks',
        component: TableLayout,
        metadata: {
          resource: 'base-url/resources/outbreaks',
        },
      },
      {
        path: '/alerts/archive',
        component: TableLayout,
        metadata: {
          resource: 'base-url/resources/archive',
        },
      },
    ],
  },
];
