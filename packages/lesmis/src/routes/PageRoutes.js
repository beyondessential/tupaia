/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { NavBar, Footer } from '../components';
import { HomeView } from '../views/HomeView';
import { ProfileView } from '../views/ProfileView';
import { PageView } from '../views/PageView';
import { EntityView } from '../views/EntityView';
import { NotFoundView } from '../views/NotFoundView';
import { ABOUT_PAGE, CONTACT_PAGE } from '../constants';

/**
 * Main Page Routes
 * eg. /en/TO/dashboard
 */
export const PageRoutes = React.memo(() => (
  <Switch>
    <Route exact path="/">
      <NavBar />
      <HomeView />
    </Route>
    <Route path="/profile">
      <NavBar />
      <ProfileView />
      <Footer />
    </Route>
    <Route path="/about">
      <NavBar />
      <PageView content={ABOUT_PAGE} />
      <Footer />
    </Route>
    <Route path="/contact">
      <NavBar />
      <PageView content={CONTACT_PAGE} />
      <Footer />
    </Route>
    <Route path="/:entityCode/:view?">
      <NavBar />
      <EntityView />
    </Route>
    <Route>
      <NavBar />
      <NotFoundView />
      <Footer />
    </Route>
  </Switch>
));
