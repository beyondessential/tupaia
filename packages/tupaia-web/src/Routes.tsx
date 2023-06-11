/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Navigate, Route, Routes as RouterRoutes, useLocation } from 'react-router-dom';
import {
  LandingPage,
  ModalRoute,
  Login,
  PasswordResetForm,
  Project,
  RegisterForm,
  RequestAccessForm,
  VerifyEmailForm,
} from './pages';
import { DEFAULT_URL } from './constants';

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
      <RouterRoutes location={state?.backgroundLocation || location}>
        <Route element={<ModalRoute />}>
          <Route path="/" element={<Navigate to={DEFAULT_URL} replace />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="reset-password" element={<PasswordResetForm />} />
          <Route path="request-access" element={<RequestAccessForm />} />
          <Route path="verify-email" element={<VerifyEmailForm />} />
          <Route path="/login" element={<Login />} />
          <Route path="/:landingPageUrlSegment" element={<LandingPage />} />
          {/** Because react-router v 6.3 doesn't support optional url segments, we need to handle dashboardCode with a splat/catch-all instead */}
          <Route path="/:projectCode/:entityCode/*" element={<Project />} />
        </Route>
      </RouterRoutes>

      {/* The `backgroundLocation` state is the location that we were at when the modal links was clicked. If it's there, use it as the location for
      the <Routes> and we show the main page in the background, behind the modal. See react router docs [here]{@Link https://github.com/remix-run/react-router/tree/dev/examples/modal} */}
      {state?.backgroundLocation && (
        <RouterRoutes>
          <Route element={<ModalRoute />}>
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<Login />} />
          </Route>
        </RouterRoutes>
      )}
    </>
  );
};
