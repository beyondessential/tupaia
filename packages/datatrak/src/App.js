/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoginView } from './views/LoginView';
import { BaseView } from './views/BaseView';
import { SurveyView } from './views/SurveyView';

const router = createBrowserRouter([
  {
    path: '/',
    element: <BaseView title="Home" />,
  },
  {
    path: '/login',
    element: <LoginView />,
  },
  {
    path: '/:projectId/:countryId/:surveyId/:entityId',
    element: <SurveyView />,
  },
]);

export const App = () => {
  return <RouterProvider router={router} />;
};
