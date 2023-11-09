/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React, { ReactNode } from 'react';
import {
  Navigate,
  Route,
  Routes as RouterRoutes,
  Outlet,
  generatePath,
  useParams,
  useLocation,
} from 'react-router-dom';
import { FullPageLoader } from '@tupaia/ui-components';
import {
  LandingPage,
  SurveyPage,
  SurveySelectPage,
  LoginPage,
  VerifyEmailPage,
  NotFoundPage,
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
} from './views';
import { useUser } from './api/queries';
import { ROUTES } from './constants';
import { CentredLayout, BackgroundPageLayout, MainPageLayout } from './layout';
import { SurveyLayout, useSurveyForm } from './features';

/**
 * If the user is logged in and tries to access the login page, redirect to the home page
 */
const LoggedInRedirect = ({ children }) => {
  const { isLoggedIn, isLoading, isFetched, data } = useUser();
  if (isLoading || !isFetched) {
    return <FullPageLoader />;
  }
  if (!isLoggedIn) {
    return children;
  }
  return <Navigate to={data?.projectId ? ROUTES.HOME : ROUTES.PROJECT_SELECT} replace={true} />;
};

// Reusable wrapper to handle redirecting to login if user is not logged in and the route is private
const PrivateRoute = ({ children }: { children?: ReactNode }): any => {
  const { isLoggedIn, isLoading, isFetched, data, isFetching } = useUser();
  const location = useLocation();
  if (isLoading || !isFetched || isFetching) return <FullPageLoader />;
  if (!isLoggedIn)
    return (
      <Navigate
        to="/login"
        replace={true}
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );

  const PROJECT_SELECT_URLS = [ROUTES.PROJECT_SELECT, ROUTES.REQUEST_ACCESS];
  // If the user is logged in and has a project, but is attempting to go to the project select page, redirect to the home page
  if (data?.projectId && PROJECT_SELECT_URLS.includes(location.pathname))
    return <Navigate to={ROUTES.HOME} replace={true} />;

  // If the user is logged in and does not have a project and is not already on the project select page, redirect to the project select page
  if (!data?.projectId && !PROJECT_SELECT_URLS.includes(location.pathname))
    return (
      <Navigate
        to={ROUTES.PROJECT_SELECT}
        replace={true}
        state={{
          from: `${location.pathname}${location.search}`,
        }}
      />
    );
  return children ? children : <Outlet />;
};

const SurveyStartRedirect = () => {
  const params = useParams();
  const path = generatePath(ROUTES.SURVEY_SCREEN, { ...params, screenNumber: '1' });
  return <Navigate to={path} replace={true} />;
};

/**
 * This Router is using [version 6.3]{@link https://reactrouter.com/en/v6.3.0}, as later versions are not supported by our TS setup. See [this issue here]{@link https://github.com/remix-run/react-router/discussions/8364}
 * This means the newer 'createBrowserRouter' and 'RouterProvider' can't be used here.
 *
 * **/

// This is to redirect the user to the start of the survey if they try to access a screen that is not visible on the survey
const SurveyPageRedirect = ({ children }) => {
  const { screenNumber } = useParams();
  const { visibleScreens } = useSurveyForm();
  if (visibleScreens && visibleScreens.length && visibleScreens.length < Number(screenNumber)) {
    return <SurveyStartRedirect />;
  }
  return children;
};

export const SurveyPageRoutes = (
  <Route path={ROUTES.SURVEY} element={<SurveyPage />}>
    <Route index element={<SurveyStartRedirect />} />
    <Route path={ROUTES.SURVEY_SUCCESS} element={<SurveySuccessScreen />} />
    <Route element={<SurveyLayout />}>
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
              <Route path={ROUTES.SURVEY_RESPONSE} element={<SurveyResponsePage />} />
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </RouterRoutes>
  );
};
