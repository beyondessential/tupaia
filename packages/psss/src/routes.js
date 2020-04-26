/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import styled from 'styled-components';
import { Route, Switch } from 'react-router-dom';
import { CountryLayout } from './layouts/CountryLayout';
import { CountriesLayout } from './layouts/CountriesLayout';
import { AlertsLayout } from './layouts/AlertsLayout';

const Main = styled.section`
  background: lightgray;
  height: 800px;
  padding: 1rem;
  width: 100%;
`;

const AlertsData = () => (
  <Main>
    <h2>Alerts Data</h2>
  </Main>
);

const OutbreakData = () => (
  <Main>
    <h2>Outbreak Data</h2>
  </Main>
);

const ArchiveData = () => (
  <Main>
    <h2>Archive Data</h2>
  </Main>
);

const WeeklyData = () => (
  <Main>
    <h2>Weekly Data</h2>
  </Main>
);

const EventBasedData = () => (
  <Main>
    <h2>Event Based Data</h2>
  </Main>
);

const ROUTES = [
  {
    path: '/',
    exact: true,
    component: CountriesLayout,
    title: 'Countries',
  },
  {
    path: '/country/:countryId',
    component: CountryLayout,
    title: 'Country',
    routes: [
      {
        path: '/country/:countryId',
        exact: true,
        component: WeeklyData,
      },
      {
        path: '/country/:countryId/event-based',
        component: EventBasedData,
      },
    ],
  },
  {
    path: '/alerts',
    component: AlertsLayout,
    title: 'Alerts',
    routes: [
      {
        path: '/alerts',
        exact: true,
        component: AlertsData,
      },
      {
        path: '/alerts/outbreaks',
        component: OutbreakData,
      },
      {
        path: '/alerts/archive',
        component: ArchiveData,
      },
    ],
  },
];

function RouteWithSubRoutes(route) {
  return (
    <Route
      title={route.title}
      path={route.path}
      exact={route.exact}
      render={props => <route.component {...props} routes={route.routes} />}
    />
  );
}

/**
 * Use this component for any new section of routes (any config object that has a "routes" property
 */
// eslint-disable-next-line react/prop-types
export function RenderRoutes({ routes }) {
  return (
    <Switch>
      {routes.map((route, i) => {
        // eslint-disable-next-line react/no-array-index-key
        return <RouteWithSubRoutes key={i} {...route} />;
      })}
      <Route component={() => <h1>Not Found!</h1>} />
    </Switch>
  );
}

export default ROUTES;
