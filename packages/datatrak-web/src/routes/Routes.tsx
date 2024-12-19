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
  ReportsPage,
  TasksDashboardPage,
  TaskDetailsPage,
  NotAuthorisedPage,
} from '../views';
import { WelcomeScreens } from '../views/WelcomeScreens';
import { useCurrentUserContext } from '../api';
import { ROUTES } from '../constants';
import { isPWA, useFromLocation } from '../utils';
import { CentredLayout, BackgroundPageLayout, MainPageLayout, TasksLayout } from '../layout';
import { PrivateRoute } from './PrivateRoute';
import { SurveyRoutes } from './SurveyRoutes';

/**
 * If the user is logged in and tries to access the auth pages, redirect to the home page or project select pages
 */
const AuthViewLoggedInRedirect = ({ children }) => {
  const { isLoggedIn, projectId, hideWelcomeScreen } = useCurrentUserContext();
  const from = useFromLocation();

  if (!isLoggedIn) {
    return children;
  }

  const getRedirectPath = React.useCallback(() => {
    if (!hideWelcomeScreen && isPWA()) {
      return ROUTES.WELCOME;
    }
    if (projectId) {
      return ROUTES.HOME;
    }
    return ROUTES.PROJECT_SELECT;
  }, [projectId, hideWelcomeScreen]);

  return (
    <Navigate
      to={getRedirectPath()}
      replace={true}
      state={{
        from,
      }}
    />
  );
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
          <Route path={ROUTES.WELCOME} element={<WelcomeScreens />} />
          <Route path={ROUTES.ACCOUNT_SETTINGS} element={<AccountSettingsPage />} />
          <Route element={<TasksLayout />}>
            <Route path={ROUTES.TASKS} element={<TasksDashboardPage />} />
            <Route path={ROUTES.TASK_DETAILS} element={<TaskDetailsPage />} />
          </Route>
          <Route
            path="/"
            element={<BackgroundPageLayout backgroundImage="/survey-background.svg" />}
          >
            <Route element={<CentredLayout />}>
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
          <Route path={ROUTES.REPORTS} element={<ReportsPage />} />
        </Route>
        {/** Reports route is admin only so needs to be inside it's own PrivateRoute instance */}

        {/* PUBLIC ROUTES*/}
        <Route path="/" element={<BackgroundPageLayout backgroundImage="/survey-background.svg" />}>
          {SurveyRoutes}
        </Route>
        <Route
          path="/"
          element={
            <BackgroundPageLayout backgroundImage="/auth-background.svg" headerBorderHidden />
          }
        >
          <Route
            path="/"
            element={
              <AuthViewLoggedInRedirect>
                <CentredLayout />
              </AuthViewLoggedInRedirect>
            }
          >
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
            <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.VERIFY_EMAIL_RESEND} element={<VerifyEmailResendPage />} />
          </Route>
        </Route>
        <Route path={ROUTES.NOT_AUTHORISED} element={<NotAuthorisedPage />} />
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </RouterRoutes>
  );
};
