/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import { Route, Routes as RouterRoutes } from 'react-router-dom';
import {
  MainPageLayout,
  SurveyPageLayout,
  LandingPage,
  SurveyPage,
  SurveyQuestionsPage,
} from './views';

/**
 * This Router is using [version 6.3]{@link https://reactrouter.com/en/v6.3.0}, as later versions are not supported by our TS setup. See [this issue here]{@link https://github.com/remix-run/react-router/discussions/8364}
 * This means the newer 'createBrowserRouter' and 'RouterProvider' can't be used here.
 *
 * **/

export const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<MainPageLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="survey" element={<SurveyPageLayout />}>
          <Route index element={<SurveyPage />} />
          <Route path="questions" element={<SurveyQuestionsPage />} />
        </Route>
      </Route>
    </RouterRoutes>
  );
};
