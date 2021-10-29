/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { lazy, Suspense } from 'react';
import { Switch, Route } from 'react-router-dom';
import { NavBar, Footer, FullPageLoader } from '../components';
import { HomeView } from '../views/HomeView';
import { ProfileView } from '../views/ProfileView';
import { PageView, TwoColumnPageView } from '../views/PageView';
import { EntityView } from '../views/EntityView';
import { NotFoundView } from '../views/NotFoundView';
import { LoginView } from '../views/LoginView';
import { RegisterView } from '../views/RegisterView';
import { NotAuthorisedView } from '../views/NotAuthorisedView';
import { ABOUT_PAGE, FQS_PAGE, CONTACT_PAGE } from '../constants';

const AdminPanel = lazy(() => import('./AdminPanelRoutes'));

/**
 * Main Page Routes
 * eg. /en/TO/dashboard
 */
export const PageRoutes = React.memo(() => (
  <Suspense fallback={<FullPageLoader />}>
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
      <Route path="/admin">
        <NavBar hideSearch />
        <AdminPanel />
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
  </Suspense>
));
