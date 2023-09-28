/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import { render as r } from '@testing-library/react';
import { AppProviders } from '../../AppProviders';
import { ROUTES } from '../../constants';
import { SurveyPage } from '../../views';

export function renderComponent(children) {
  return r(children, { wrapper: AppProviders });
}

export function renderPage(activeUrl, PageRoute) {
  return r(
    <AppProviders>
      <MemoryRouter initialEntries={[activeUrl]}>
        <Routes>{PageRoute}</Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

export function renderSurveyPage(activeUrl) {
  const routePath = ROUTES.SURVEY_SCREEN;
  return renderPage(activeUrl, <Route path={routePath} element={<SurveyPage />} />);
}
