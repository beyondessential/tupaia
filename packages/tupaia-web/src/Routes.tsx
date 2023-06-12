/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Navigate, Route, Routes as RouterRoutes, useLocation } from 'react-router-dom';
import { LandingPage, Project } from './pages';
import { USER_ROUTES, DEFAULT_URL } from './constants';
import { Layout } from './layout';
import { ModalRoute } from './pages/ModalRoute';

/**
 * This Router is using [version 6.3]{@link https://reactrouter.com/en/v6.3.0}, as later versions are not supported by our TS setup. See [this issue here]{@link https://github.com/remix-run/react-router/discussions/8364}
 * This means the newer 'createBrowserRouter' and 'RouterProvider' can't be used here.
 *
 * **/
export const Routes = () => {
  let location = useLocation();
  const state = location.state as { backgroundLocation?: Location };

  return (
    <>
      <ModalRoute />
      <RouterRoutes location={state?.backgroundLocation || location}>
        {/* This is the layout for the entire app, so needs to be wrapped around the rest of the routes so that we can access params in top bar etc */}
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to={`${DEFAULT_URL}`} replace />} />
          {/* Email verification links redirect to the login page where the verification happens */}
          <Route
            path="/verify-email"
            element={
              <Navigate to={{ ...location, pathname: `?modal=${USER_ROUTES.LOGIN}` }} replace />
            }
          />
          <Route path="/:landingPageUrlSegment" element={<LandingPage />} />
          {/** Because react-router v 6.3 doesn't support optional url segments, we need to handle dashboardCode with a splat/catch-all instead */}
          <Route path="/:projectCode/:entityCode/*" element={<Project />} />
        </Route>
      </RouterRoutes>
    </>
  );
};
