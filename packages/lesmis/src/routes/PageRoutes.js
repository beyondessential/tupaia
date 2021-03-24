/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { HomeView } from '../views/HomeView';
import { ProfileView } from '../views/ProfileView';
import { AboutView } from '../views/AboutView';
import { ContactView } from '../views/ContactView';
import { EntityView } from '../views/EntityView';
import { NotFoundView } from '../views/NotFoundView';

/**
 * Main Page Routes
 * eg. /en/TO/dashboard
 */
export const PageRoutes = React.memo(() => (
  <Switch>
    <Route exact path="/">
      <HomeView />
    </Route>
    <Route path="/profile">
      <ProfileView />
    </Route>
    <Route path="/about">
      <AboutView />
    </Route>
    <Route path="/contact">
      <ContactView />
    </Route>
    <Route path="/:organisationUnitCode/:view?">
      <EntityView />
    </Route>
    <Route>
      <NotFoundView />
    </Route>
  </Switch>
));
