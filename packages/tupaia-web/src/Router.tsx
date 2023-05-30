/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { createBrowserRouter } from 'react-router-dom';
import { LandingPage, LoginForm, MapView, PasswordResetForm, RequestAccessForm } from './pages';
import { RegisterForm } from './pages/RegisterForm';

const Routes = [
  {
    path: '/register',
    element: <RegisterForm />,
  },
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/reset-password',
    element: <PasswordResetForm />,
  },
  {
    path: '/request-access',
    element: <RequestAccessForm />,
  },
  {
    path: '/:landingPage',
    element: <LandingPage />,
    // Load the landing page data from the API
    loader: async ({ params }) => {
      // This is where you would query for a landing page
      return null;
    },
    action: ({ params, data }) => {
      // This is where you would save the data, and handle if a landing page is not found - redirect to a project
    },
  },
  {
    path: '/:projectCode',
    element: <MapView />,
  },
];

export const Router = createBrowserRouter(Routes);
