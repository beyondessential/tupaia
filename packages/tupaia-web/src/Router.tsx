/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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

export const Router = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to={`/${DEFAULT_URL}`} replace />} />
      {/**
       *  The below user pages will actually be modals, which will be done when each view is created. There is an example at: https://github.com/remix-run/react-router/tree/dev/examples/modal
       */}
      <Route path="login" element={<LoginForm />} />
      <Route path="register" element={<RegisterForm />} />
      <Route path="reset-password" element={<PasswordResetForm />} />
      <Route path="request-access" element={<RequestAccessForm />} />
      <Route path="verify-email" element={<VerifyEmailForm />} />
      <Route path="/:landingPageUrlSegment" element={<LandingPage />} />
      {/** react-router v 6.4 an above dob't work in our setup. Which means we need to handle the routes with a base project page using splats (catchall routes), since version 6.3 doesn't support optional segments */}
      <Route path="/:projectCode/:entityCode/*" element={<Project />} />
    </Routes>
  </BrowserRouter>
);
