/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Navigate, Route, Routes as RouterRoutes } from 'react-router-dom';
import { FullPageLoader } from '@tupaia/ui-components';
import { LandingPage, SurveyPage, SurveyQuestionsPage, LoginPage, VerifyEmailPage } from './views';
import { useUser } from './api/queries';
import { ROUTES } from './constants';
import { BackgroundPageLayout, MainPageLayout } from './layout';

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
const PrivateRoute = ({ children }) => {
  const { isLoggedIn, isLoading, isFetched } = useUser();
  if (isLoading || !isFetched) return <FullPageLoader />;
  if (!isLoggedIn) return <Navigate to="/login" replace={true} />;
  return children;
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
        <Route
          index
          element={
            <PrivateRoute>
              <LandingPage />
            </PrivateRoute>
          }
        />
        {/** Any views that should have the background image should go in here */}
        <Route path="/" element={<BackgroundPageLayout />}>
          <Route
            path={ROUTES.LOGIN}
            element={
              <LoggedInRedirect>
                <LoginPage />
              </LoggedInRedirect>
            }
          />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmailPage />} />
          <Route path={ROUTES.SURVEY}>
            <Route
              index
              element={
                <PrivateRoute>
                  <SurveyPage />
                </PrivateRoute>
              }
            />
            <Route
              path={ROUTES.QUESTIONS}
              element={
                <PrivateRoute>
                  <SurveyQuestionsPage />
                </PrivateRoute>
              }
            />
          </Route>
        </Route>
      </Route>
    </RouterRoutes>
  );
};
