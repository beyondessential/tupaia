/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
import { LocationHeader, Toolbar, Breadcrumbs, Footer, FlexSpaceBetween } from '../components';
import { DashboardView } from './DashboardView';
import { MapView } from './MapView';
import { useEntityBreadcrumbs } from '../utils';
import { Menu } from '../components/Menu';

export const EntityView = () => {
  const match = useRouteMatch();
  const { breadcrumbs, isLoading } = useEntityBreadcrumbs();
  const { entityCode, view } = match.params;

  return (
    <>
      <Toolbar>
        <FlexSpaceBetween>
          <Breadcrumbs breadcrumbs={breadcrumbs} isLoading={isLoading} />
          <Menu />
        </FlexSpaceBetween>
      </Toolbar>
      <LocationHeader />
      <Switch>
        <Route path={`${match.path}/dashboard`}>
          <DashboardView />
        </Route>
        <Route path={`${match.path}/map`}>
          <MapView />
        </Route>
        <Redirect to={`/${entityCode}/dashboard`} />
      </Switch>
      {view !== 'map' && <Footer />}
    </>
  );
};
