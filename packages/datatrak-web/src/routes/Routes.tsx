/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Navigate, Route, Routes as RouterRoutes } from 'react-router-dom';
import {
  LandingPage,
  SurveySelectPage,
  LoginPage,
  VerifyEmailPage,
  ErrorPage,
  RegisterPage,
  VerifyEmailResendPage,
  ProjectSelectPage,
  RequestProjectAccessPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AccountSettingsPage,
} from '../views';
import { useCurrentUser } from '../api';
import { ROUTES } from '../constants';
import { CentredLayout, BackgroundPageLayout, MainPageLayout } from '../layout';
import { PrivateRoute } from './PrivateRoute';
import { SurveyPageRoutes } from './SurveyPageRoutes';

/**
 * If the user is logged in and tries to access the login page, redirect to the home page
 */
const LoggedInRedirect = ({ children }) => {
  const { isLoggedIn, ...user } = useCurrentUser();

  if (!isLoggedIn) {
    return children;
  }
  return <Navigate to={user.projectId ? ROUTES.HOME : ROUTES.PROJECT_SELECT} replace={true} />;
};

/**
 * This Router is using [version 6.3]{@link https://reactrouter.com/en/v6.3.0}, as later versions are not supported by our TS setup. See [this issue here]{@link https://github.com/remix-run/react-router/discussions/8364}
 * This means the newer 'createBrowserRouter' and 'RouterProvider' can't be used here.
 **/
export const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<MainPageLayout />}>
        {/* PRIVATE ROUTES */}
        <Route path="/" element={<PrivateRoute />}>
          <Route index element={<LandingPage />} />
          <Route path={ROUTES.ACCOUNT_SETTINGS} element={<AccountSettingsPage />} />
          <Route
            path="/"
            element={<BackgroundPageLayout backgroundImage="/survey-background.svg" />}
          >
            <Route element={<CentredLayout />}>
              <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
              <Route path={ROUTES.SURVEY_SELECT} element={<SurveySelectPage />} />
            </Route>
          </Route>
          <Route
            path="/"
            element={
              <BackgroundPageLayout backgroundImage="/auth-background.svg" headerBorderHidden />
            }
          >
            <Route path="/" element={<CentredLayout />}>
              <Route path={ROUTES.PROJECT_SELECT} element={<ProjectSelectPage />} />
              <Route path={ROUTES.REQUEST_ACCESS} element={<RequestProjectAccessPage />} />
            </Route>
          </Route>
        </Route>

        {/* PUBLIC ROUTES*/}
        <Route path="/" element={<BackgroundPageLayout backgroundImage="/survey-background.svg" />}>
          {SurveyPageRoutes}
        </Route>
        <Route
          path="/"
          element={
            <BackgroundPageLayout backgroundImage="/auth-background.svg" headerBorderHidden />
          }
        >
          <Route path="/" element={<CentredLayout />}>
            <Route
              path={ROUTES.LOGIN}
              element={
                <LoggedInRedirect>
                  <LoginPage />
                </LoggedInRedirect>
              }
            />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.VERIFY_EMAIL_RESEND} element={<VerifyEmailResendPage />} />
          </Route>
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </RouterRoutes>
  );
};
