/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { NavBar, Footer } from '../components';
import { LesmisAdminRoute } from './LesmisAdminRoute';
import { HomeView } from '../views/HomeView';
import { ProfileView } from '../views/ProfileView';
import { PageView, TwoColumnPageView } from '../views/PageView';
import { EntityView } from '../views/EntityView';
import { NotFoundView } from '../views/NotFoundView';
import { LoginView } from '../views/LoginView';
import { RegisterView } from '../views/RegisterView';
import { UsersView } from '../views/UsersView';
import { AdminPanelRoutes } from './AdminPanelRoutes';
import { NotAuthorisedView } from '../views/NotAuthorisedView';
import { ABOUT_PAGE, FQS_PAGE, CONTACT_PAGE } from '../constants';

/**
 * Main Page Routes
 * eg. /en/TO/dashboard
 */
export const PageRoutes = React.memo(() => (
  <Switch>
    <Route exact path="/">
      <NavBar hideSearch />
      <HomeView />
    </Route>
    <Route path="/login">
      <LoginView />
    </Route>
    <Route path="/register">
      <RegisterView />
    </Route>
    <Route path="/profile">
      <NavBar />
      <ProfileView />
      <Footer />
    </Route>
    <Route path="/users-and-permissions">
      <NavBar />
      <LesmisAdminRoute path="*">
        <UsersView />
      </LesmisAdminRoute>
      <Footer />
    </Route>
    <Route path="/admin">
      <NavBar hideSearch />
      <AdminPanelRoutes />
      <Footer />
    </Route>
    <Route path="/about">
      <NavBar />
      <PageView content={ABOUT_PAGE} />
      <Footer />
    </Route>
    <Route path="/fundamental-quality-standards">
      <NavBar />
      <TwoColumnPageView content={FQS_PAGE} />
      <Footer />
    </Route>
    <Route path="/contact">
      <NavBar />
      <PageView content={CONTACT_PAGE} />
      <Footer />
    </Route>
    <Route path="/page-not-found">
      <NavBar />
      <NotFoundView />
      <Footer />
    </Route>
    <Route path="/not-authorised">
      <NavBar />
      <NotAuthorisedView />
      <Footer />
    </Route>
    <Route path="/:entityCode/:view?">
      <NavBar />
      <EntityView />
    </Route>
  </Switch>
));
