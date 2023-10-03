/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { MemoryRouter, Routes } from 'react-router-dom';
import { renderHook } from '@testing-library/react-hooks';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { AppProviders } from '../../AppProviders';
import { SurveyPageRoutes } from '../../Routes';
import { UseMutationResult } from 'react-query';

export function renderComponent(children) {
  return render(children, { wrapper: AppProviders });
}

export function renderPage(activeUrl) {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[activeUrl]}>
        <Routes>{SurveyPageRoutes}</Routes>
      </MemoryRouter>
    </AppProviders>,
  );
}

export function renderSurveyPage(activeUrl) {
  return renderPage(activeUrl);
}

// Utility function to render a mutation hook with the AppProviders wrapper
export const renderMutation = (
  hook,
  options = {},
): {
  result: {
    current: UseMutationResult;
  };
  waitFor: (callback: () => void) => Promise<void>;
} => {
  const wrapper = ({ children }) => <AppProviders>{children}</AppProviders>;
  return renderHook(hook, { wrapper, ...options });
};
