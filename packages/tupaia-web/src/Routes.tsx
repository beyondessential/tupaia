/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { Navigate, Route, Routes as RouterRoutes } from 'react-router-dom';
import {
  LandingPage,
  LoginForm,
  PasswordResetForm,
  Project,
  RegisterForm,
  RequestAccessForm,
  VerifyEmailForm,
} from './pages';
import { DEFAULT_URL } from './constants';
import { Layout } from './layout';

export const USER_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',
  REQUEST_ACCESS: '/request-access',
  VERIFY_EMAIL: '/verify-email',
};

/**
 * This Router is using [version 6.3]{@link https://reactrouter.com/en/v6.3.0}, as later versions are not supported by our TS setup. See [this issue here]{@link https://github.com/remix-run/react-router/discussions/8364}
 * This means the newer 'createBrowserRouter' and 'RouterProvider' can't be used here.
 *
 * **/

export const Routes = () => (
  <RouterRoutes>
    {/* This is the layout for the entire app, so needs to be wrapped around the rest of the routes so that we can access params in top bar etc */}
    <Route element={<Layout />}>
      <Route path="/" element={<Navigate to={`/${DEFAULT_URL}`} replace />} />
      <Route path={USER_ROUTES.LOGIN} element={<LoginForm />} />
      <Route path={USER_ROUTES.REGISTER} element={<RegisterForm />} />
      <Route path={USER_ROUTES.RESET_PASSWORD} element={<PasswordResetForm />} />
      <Route path={`${USER_ROUTES.REQUEST_ACCESS}/:projectCode`} element={<RequestAccessForm />} />
      <Route path={USER_ROUTES.VERIFY_EMAIL} element={<VerifyEmailForm />} />
      <Route path="/:landingPageUrlSegment" element={<LandingPage />} />
      {/** Because react-router v 6.3 doesn't support optional url segments, we need to handle dashboardCode with a splat/catch-all instead */}
      <Route path="/:projectCode/:entityCode/*" element={<Project />} />
    </Route>
  </RouterRoutes>
);
