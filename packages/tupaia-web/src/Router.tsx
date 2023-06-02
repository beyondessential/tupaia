/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { Navigate, createBrowserRouter } from 'react-router-dom';
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

const Routes = [
  {
    path: '/',
    element: <Navigate to={`/${DEFAULT_URL}`} replace />, // This is to redirect from no URL to the default project URL. Some logic will also have to be added in here to render the projects modal in this case as well
  },
  // The below user pages will actually be modals, which will be done when each view is created. There is an example at: https://github.com/remix-run/react-router/tree/dev/examples/modal
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
    path: '/verify-email',
    element: <VerifyEmailForm />,
  },
  {
    path: '/:landingPageUrlSegment',
    element: <LandingPage />,
  },
  {
    path: '/:projectCode/:entityCode/:dashboardCode?',
    element: <Project />,
  },
];

export const Router = createBrowserRouter(Routes);
