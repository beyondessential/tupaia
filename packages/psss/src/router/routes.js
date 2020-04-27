/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { CountryLayout } from '../layouts/CountryLayout';
import { CountriesLayout } from '../layouts/CountriesLayout';
import { AlertsLayout } from '../layouts/AlertsLayout';
import { TableLayout } from '../layouts/TableLayout';

export const HOME_ALIAS = 'country';

export const ROUTES = [
  {
    path: '/',
    exact: true,
    component: CountriesLayout,
    metaData: {
      title: 'Countries',
      resource: 'base-url/resources/home-page',
    },
  },
  {
    path: '/country/:countryId',
    component: CountryLayout,
    metaData: {
      title: 'Country',
    },
    routes: [
      {
        path: '/country/:countryId',
        exact: true,
        fallback: true,
        component: TableLayout,
        metaData: {
          resource: 'base-url/resources/country',
        },
      },
      {
        path: '/country/:countryId/event-based',
        component: TableLayout,
        metaData: {
          resource: 'base-url/resources/event-based',
        },
      },
    ],
  },
  {
    path: '/alerts',
    component: AlertsLayout,
    metaData: {
      title: 'Alerts',
    },
    routes: [
      {
        path: '/alerts',
        exact: true,
        component: TableLayout,
        metaData: {
          resource: 'base-url/resources/alerts',
        },
      },
      {
        path: '/alerts/outbreaks',
        component: TableLayout,
        metaData: {
          resource: 'base-url/resources/outbreaks',
        },
      },
      {
        path: '/alerts/archive',
        component: TableLayout,
        metaData: {
          resource: 'base-url/resources/archive',
        },
      },
    ],
  },
];
