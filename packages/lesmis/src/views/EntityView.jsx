/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { useState } from 'react';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
import { LocationHeader, Toolbar, Breadcrumbs, Footer, FlexSpaceBetween } from '../components';
import { DashboardView } from './DashboardView';
import { MapView } from './MapView';
import { useEntityBreadcrumbs, useUrlParams } from '../utils';
import { LocaleMenu } from '../components/LocaleMenu';

export const EntityView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const match = useRouteMatch();
  const { locale, entityCode, view } = useUrlParams();
  const { breadcrumbs, isLoading } = useEntityBreadcrumbs();

  return (
    <>
      <Toolbar>
        <FlexSpaceBetween>
          <Breadcrumbs breadcrumbs={breadcrumbs} isLoading={isLoading} />
          <LocaleMenu />
        </FlexSpaceBetween>
      </Toolbar>
      <LocationHeader setIsOpen={setIsOpen} />
      <Switch>
        <Route path={`${match.path}/dashboard`}>
          <DashboardView isOpen={isOpen} setIsOpen={setIsOpen} />
        </Route>
        <Route path={`${match.path}/map`}>
          <MapView />
        </Route>
        <Redirect to={`/${locale}/${entityCode}/dashboard`} />
      </Switch>
      {view !== 'map' && <Footer />}
    </>
  );
};
