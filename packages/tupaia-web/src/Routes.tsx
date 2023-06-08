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

/**
 * This Router is using [version 6.3]{@link https://reactrouter.com/en/v6.3.0}, as later versions are not supported by our TS setup. See [this issue here]{@link https://github.com/remix-run/react-router/discussions/8364}
 * This means the newer 'createBrowserRouter' and 'RouterProvider' can't be used here.
 *
 * **/

export const Routes = () => (
  <RouterRoutes>
    <Route path="/" element={<Navigate to={`/${DEFAULT_URL}`} replace />} />
    <Route path="login" element={<LoginForm />} />
    <Route path="register" element={<RegisterForm />} />
    <Route path="reset-password" element={<PasswordResetForm />} />
    <Route path="request-access/:projectCode" element={<RequestAccessForm />} />
    <Route path="verify-email" element={<VerifyEmailForm />} />
    <Route path="/:landingPageUrlSegment" element={<LandingPage />} />
    {/** Because react-router v 6.3 doesn't support optional url segments, we need to handle dashboardCode with a splat/catch-all instead */}
    <Route path="/:projectCode/:entityCode/*" element={<Project />} />
  </RouterRoutes>
);
