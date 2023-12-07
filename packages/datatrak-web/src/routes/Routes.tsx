/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Navigate, Route, Routes as RouterRoutes, generatePath, useParams } from 'react-router-dom';
import {
  LandingPage,
  SurveyPage,
  SurveySelectPage,
  LoginPage,
  VerifyEmailPage,
  ErrorPage,
  RegisterPage,
  VerifyEmailResendPage,
  SurveyReviewScreen,
  SurveySuccessScreen,
  SurveyScreen,
  ProjectSelectPage,
  RequestProjectAccessPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AccountSettingsPage,
  SurveyResponsePage,
} from '../views';
import { useCurrentUser, useSurvey } from '../api';
import { ROUTES } from '../constants';
import { CentredLayout, BackgroundPageLayout, MainPageLayout } from '../layout';
import { SurveyLayout, useSurveyForm } from '../features';
import { PrivateRoute } from './PrivateRoute';

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

const SurveyStartRedirect = () => {
  const params = useParams();
  const path = generatePath(ROUTES.SURVEY_SCREEN, { ...params, screenNumber: '1' });
  return <Navigate to={path} replace={true} />;
};

// This is to redirect the user to the start of the survey if they try to access a screen that is not visible on the survey
const SurveyPageRedirect = ({ children }) => {
  const { screenNumber } = useParams();
  const { visibleScreens } = useSurveyForm();

  if (visibleScreens && visibleScreens.length && visibleScreens.length < Number(screenNumber)) {
    return <SurveyStartRedirect />;
  }
  return children;
};

/**
 * This is to redirect the user to the survey not found page if they try to access a survey that does not exist
 */
const SurveyNotFoundRedirect = ({ children }) => {
  const { surveyCode } = useParams();
  const { isError, error } = useSurvey(surveyCode);
  if (isError) {
    return <ErrorPage error={error as Error} title="Unable to fetch survey" />;
  }
  return children;
};

export const SurveyPageRoutes = (
  <Route
    path={ROUTES.SURVEY}
    element={
      <SurveyNotFoundRedirect>
        <SurveyPage />
      </SurveyNotFoundRedirect>
    }
  >
    <Route index element={<SurveyStartRedirect />} />
    <Route path={ROUTES.SURVEY_SUCCESS} element={<SurveySuccessScreen />} />
    <Route element={<SurveyLayout />}>
      <Route path={ROUTES.SURVEY_RESPONSE} element={<SurveyResponsePage />} />
      <Route path={ROUTES.SURVEY_REVIEW} element={<SurveyReviewScreen />} />
      <Route
        path={ROUTES.SURVEY_SCREEN}
        element={
          <SurveyPageRedirect>
            <SurveyScreen />
          </SurveyPageRedirect>
        }
      />
    </Route>
  </Route>
);

/**
 * This Router is using [version 6.3]{@link https://reactrouter.com/en/v6.3.0}, as later versions are not supported by our TS setup. See [this issue here]{@link https://github.com/remix-run/react-router/discussions/8364}
 * This means the newer 'createBrowserRouter' and 'RouterProvider' can't be used here.
 **/
export const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<MainPageLayout />}>
        <Route path="/" element={<PrivateRoute />}>
          <Route index element={<LandingPage />} />
        </Route>
        {/** Any views that should have the background image should go in here */}
        <Route
          path="/"
          element={
            <BackgroundPageLayout backgroundImage="/auth-background.svg" headerBorderHidden />
          }
        >
          {/** Any public centred views should go in here */}
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
            <Route element={<PrivateRoute />}>
              <Route path={ROUTES.PROJECT_SELECT} element={<ProjectSelectPage />} />
              <Route path={ROUTES.REQUEST_ACCESS} element={<RequestProjectAccessPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="/" element={<BackgroundPageLayout backgroundImage="/survey-background.svg" />}>
          <Route element={<PrivateRoute />}>
            {/** Any private centred views should go in here */}
            <Route element={<CentredLayout />}>
              <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
              <Route path={ROUTES.SURVEY_SELECT} element={<SurveySelectPage />} />
            </Route>
            {SurveyPageRoutes}
          </Route>
        </Route>
        <Route
          path={ROUTES.ACCOUNT_SETTINGS}
          element={
            <PrivateRoute>
              <AccountSettingsPage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </RouterRoutes>
  );
};
