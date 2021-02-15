/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { HomeView } from '../views/HomeView';
import { ProvinceView } from '../views/ProvinceView';
import { DistrictView } from '../views/DistrictView';
import { SchoolView } from '../views/SchoolView';
import { ProfileView } from '../views/ProfileView';
import { NotFoundView } from '../views/NotFoundView';

/**
 * Main Page Routes
 * eg. /vientiane-capital/mayparkngum/mayparkngum
 */
export const PageRoutes = React.memo(() => (
  <Switch>
    <Route exact path="/">
      <HomeView />
    </Route>
    <Route path="/profile">
      <ProfileView />
    </Route>
    <Route exact path="/:province">
      <ProvinceView />
    </Route>
    <Route exact path="/:province/:district">
      <DistrictView />
    </Route>
    <Route exact path="/:province/:district/:school">
      <SchoolView />
    </Route>
    <Route>
      <NotFoundView />
    </Route>
  </Switch>
));
