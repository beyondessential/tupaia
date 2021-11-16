/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React, { lazy, Suspense } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
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
 * eg. /en/LA/dashboard
 */
export const PageRoutes = React.memo(() => {
  const { path } = useRouteMatch();

  return (
    <Suspense fallback={<FullPageLoader />}>
      <Switch>
        <Route exact path={`${path}/`}>
          <NavBar hideSearch />
          <HomeView />
        </Route>
        <Route path={`${path}/login`}>
          <LoginView />
        </Route>
        <Route path={`${path}/register`}>
          <RegisterView />
        </Route>
        <Route path={`${path}/profile`}>
          <NavBar />
          <ProfileView />
          <Footer />
        </Route>
        <Route path={`${path}/admin`}>
          <NavBar hideSearch />
          <AdminPanel />
          <Footer />
        </Route>
        <Route path={`${path}/about`}>
          <NavBar />
          <PageView content={ABOUT_PAGE} />
          <Footer />
        </Route>
        <Route path={`${path}/fundamental-quality-standards`}>
          <NavBar />
          <TwoColumnPageView content={FQS_PAGE} />
          <Footer />
        </Route>
        <Route path={`${path}/contact`}>
          <NavBar />
          <PageView content={CONTACT_PAGE} />
          <Footer />
        </Route>
        <Route path={`${path}/page-not-found`}>
          <NavBar />
          <NotFoundView />
          <Footer />
        </Route>
        <Route path={`${path}/not-authorised`}>
          <NavBar />
          <NotAuthorisedView />
          <Footer />
        </Route>
        <Route path={`${path}/:entityCode/:view?`}>
          <NavBar />
          <EntityView />
        </Route>
      </Switch>
    </Suspense>
  );
});
