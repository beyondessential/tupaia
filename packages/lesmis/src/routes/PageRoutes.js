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
      <AboutView />
      <Footer />
    </Route>
    <Route path="/contact">
      <NavBar />
      <ContactView />
      <Footer />
    </Route>
    <Route path="/:organisationUnitCode/:view?">
      <NavBar />
      <EntityView />
      <Footer />
    </Route>
    <Route>
      <NavBar />
      <NotFoundView />
      <Footer />
    </Route>
  </Switch>
));
