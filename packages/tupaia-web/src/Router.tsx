/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Navigate, createBrowserRouter } from 'react-router-dom';
import {
  LoginForm,
  PasswordResetForm,
  RequestAccessForm,
  Project,
  LandingPage,
  projectPageLoader,
} from './pages';
import { RegisterForm } from './pages/RegisterForm';
import { DEFAULT_URL } from './constants';

const Routes = [
  {
    path: '/',
    element: <Navigate to={`/${DEFAULT_URL}`} replace />, // This is to redirect from no URL to the default project URL. Some logic will also have to be added in here to render the projects modal in this case as well
  },
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
    path: '/:code',
    element: <LandingPage />,
  },
  {
    path: '/:code/:entityCode?/:dashboardCode?',
    loader: projectPageLoader,
    element: <Project />,
  },
];

export const Router = createBrowserRouter(Routes);
