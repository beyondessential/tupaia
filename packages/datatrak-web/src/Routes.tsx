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
} from 'react-router-dom';
import { FullPageLoader } from '@tupaia/ui-components';
import {
  LandingPage,
  SurveyPage,
  SurveySelectPage,
  SurveyQuestionsPage,
  LoginPage,
  VerifyEmailPage,
  NotFoundPage,
  RegisterPage,
  VerifyEmailResendPage,
  SurveyReviewScreen,
  SurveySuccessScreen,
  SurveyScreen,
  ProjectSelectPage,
} from './views';
import { useUser } from './api/queries';
import { ROUTES } from './constants';
import { CentredLayout, BackgroundPageLayout, MainPageLayout } from './layout';

/**
 * If the user is logged in and tries to access the login page, redirect to the home page
 */
const LoggedInRedirect = ({ children }) => {
  const { isLoggedIn, isLoading, isFetched } = useUser();
  if (isLoading || !isFetched) return <FullPageLoader />;
  if (isLoggedIn) return <Navigate to="/" replace={true} />;
  return children;
};

// Reusable wrapper to handle redirecting to login if user is not logged in and the route is private
const PrivateRoute = ({ children }: { children?: ReactNode }): any => {
  const { isLoggedIn, isLoading, isFetched } = useUser();
  if (isLoading || !isFetched) return <FullPageLoader />;
  if (!isLoggedIn) return <Navigate to="/login" replace={true} />;
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

export const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<MainPageLayout />}>
        <Route path="/" element={<PrivateRoute />}>
          <Route index element={<LandingPage />} />
        </Route>
        {/** Any views that should have the background image should go in here */}
        <Route path="/" element={<BackgroundPageLayout />}>
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
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
            <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
            <Route path={ROUTES.VERIFY_EMAIL_RESEND} element={<VerifyEmailResendPage />} />
            <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
          </Route>
          <Route element={<PrivateRoute />}>
            {/** Any private centred views should go in here */}
            <Route element={<CentredLayout />}>
              <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
              <Route path={ROUTES.PROJECT_SELECT} element={<ProjectSelectPage />} />
              <Route path={ROUTES.SURVEY_SELECT} element={<SurveySelectPage />} />
            </Route>
            <Route path={ROUTES.SURVEY} element={<SurveyPage />}>
              <Route index element={<SurveyStartRedirect />} />
              <Route path={ROUTES.SURVEY_REVIEW} element={<SurveyReviewScreen />} />
              <Route path={ROUTES.SURVEY_SUCCESS} element={<SurveySuccessScreen />} />
              <Route path={ROUTES.SURVEY_SCREEN} element={<SurveyScreen />} />
              <Route path={ROUTES.QUESTIONS} element={<SurveyQuestionsPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </RouterRoutes>
  );
};
