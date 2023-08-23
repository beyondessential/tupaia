/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Navigate, Route, Routes as RouterRoutes } from 'react-router-dom';
import {
  LandingPage,
  SurveyPage,
  SurveyQuestionsPage,
  LoginPage,
  RegisterPage,
  VerifyEmailResendPage,
} from './views';
import { useUser } from './api/queries';
import { FullPageLoader } from '@tupaia/ui-components';
import { ROUTES } from './constants';
import { BackgroundPageLayout, AuthLayout, MainPageLayout } from './layout';
import { VerifyEmailPage } from './views/VerifyEmailPage';

/**
 * If the user is not logged in, redirect to the login page
 */
const LandingPageRedirect = () => {
  const { isLoggedIn, isLoading, isFetched } = useUser();
  if (isLoading || !isFetched) return <FullPageLoader />;
  if (!isLoggedIn) return <Navigate to="/login" replace={true} />;
  return <LandingPage />;
};

/**
 * If the user is logged in and tries to access the login page, redirect to the home page
 */
const LoginRedirect = () => {
  const { isLoggedIn, isLoading, isFetched } = useUser();
  if (isLoading || !isFetched) return <FullPageLoader />;
  if (isLoggedIn) return <Navigate to="/" replace={true} />;
  return <LoginPage />;
};

/**
 * This Router is using [version 6.3]{@link https://reactrouter.com/en/v6.3.0}, as later versions are not supported by our TS setup. See [this issue here]{@link https://github.com/remix-run/react-router/discussions/8364}
 * This means the newer 'createBrowserRouter' and 'RouterProvider' can't be used here.
 *
 * **/

export const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<MainPageLayout />}>
        <Route index element={<LandingPageRedirect />} />
        {/** Any views that should have the background image should go in here */}
        <Route path="/" element={<BackgroundPageLayout />}>
          {/** Any auth views should go in here, as they have a layout where the form is centred in the page */}
          <Route path="/" element={<AuthLayout />}>
            <Route path={ROUTES.LOGIN} element={<LoginRedirect />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.VERIFY_EMAIL_RESEND} element={<VerifyEmailResendPage />} />
          </Route>
          <Route path={ROUTES.SURVEY}>
            <Route index element={<SurveyPage />} />
            <Route path={ROUTES.QUESTIONS} element={<SurveyQuestionsPage />} />
          </Route>
        </Route>
      </Route>
    </RouterRoutes>
  );
};
